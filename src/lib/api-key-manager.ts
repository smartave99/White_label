/**
 * API Key Manager with Firestore Support
 * 
 * Manages multiple API keys with automatic rotation, rate limit detection,
 * and health monitoring for high availability.
 * 
 * Keys can be loaded from:
 * 1. Environment variables (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
 * 2. Firestore collection (apiKeys) - managed via admin UI
 */

import {
    APIKeyConfig,
    APIKeyManagerStatus,
    KeyHealthStatus,
    APIKeyExhaustedError
} from "@/types/assistant-types";

// Cooldown duration in milliseconds after a key is rate-limited
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 1 minute

// Cooldown duration after consecutive errors
const ERROR_COOLDOWN_MS = 30 * 1000; // 30 seconds

// Max consecutive errors before key cooldown
const MAX_CONSECUTIVE_ERRORS = 3;

// Cache duration for Firestore keys
const FIRESTORE_CACHE_MS = 60 * 1000; // 1 minute

class APIKeyManager {
    private keys: APIKeyConfig[] = [];
    private activeKeyIndex: number = 0;
    private lastRotation: Date | null = null;
    private initialized: boolean = false;
    private lastFirestoreLoad: Date | null = null;
    private firestoreKeys: string[] = [];

    constructor() {
        this.initializeFromEnv();
    }

    private initializeFromEnv(): void {
        if (this.initialized) return;

        const keyEnvVars = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
        ];

        const envKeys = keyEnvVars
            .filter((key): key is string => !!key && key.trim() !== "")
            .map(key => key.trim());

        this.rebuildKeyList(envKeys, this.firestoreKeys);
        this.initialized = true;

        if (this.keys.length === 0) {
            console.warn("[APIKeyManager] No API keys configured from env. Keys may be loaded from Firestore.");
        } else {
            console.log(`[APIKeyManager] Initialized with ${this.keys.length} API key(s) from env`);
        }
    }

    /**
     * Load keys from Firestore (to be called externally with Firestore data)
     */
    public loadFirestoreKeys(keys: string[]): void {
        const validKeys = keys.filter(k => k && k.trim() !== "").map(k => k.trim());

        if (JSON.stringify(validKeys) !== JSON.stringify(this.firestoreKeys)) {
            console.log(`[APIKeyManager] Loading ${validKeys.length} key(s) from Firestore`);
            this.firestoreKeys = validKeys;
            this.lastFirestoreLoad = new Date();

            // Rebuild key list combining env and Firestore keys
            const envKeys = [
                process.env.GEMINI_API_KEY_1,
                process.env.GEMINI_API_KEY_2,
                process.env.GEMINI_API_KEY_3,
            ].filter((key): key is string => !!key && key.trim() !== "").map(k => k.trim());

            this.rebuildKeyList(envKeys, validKeys);
        }
    }

    private rebuildKeyList(envKeys: string[], firestoreKeys: string[]): void {
        // Combine keys, avoiding duplicates, with Firestore keys taking priority
        const allKeys = new Set([...firestoreKeys, ...envKeys]);
        const keyArray = Array.from(allKeys);

        // Preserve existing key state for keys we already have
        const existingKeyMap = new Map(this.keys.map(k => [k.key, k]));

        this.keys = keyArray.map((key, index) => {
            const existing = existingKeyMap.get(key);
            if (existing) {
                return { ...existing, index };
            }
            return {
                key,
                index,
                callCount: 0,
                lastUsed: null,
                errorCount: 0,
                consecutiveErrors: 0,
                rateLimited: false,
                cooldownUntil: null,
            };
        });

        // Reset active key index if it's out of bounds
        if (this.activeKeyIndex >= this.keys.length) {
            this.activeKeyIndex = 0;
        }

        console.log(`[APIKeyManager] Total keys available: ${this.keys.length}`);
    }

    /**
     * Check if Firestore cache needs refresh
     */
    public needsFirestoreRefresh(): boolean {
        if (!this.lastFirestoreLoad) return true;
        return Date.now() - this.lastFirestoreLoad.getTime() > FIRESTORE_CACHE_MS;
    }

    /**
     * Get the current active API key, rotating if necessary
     */
    public getActiveKey(): string {
        if (this.keys.length === 0) {
            throw new APIKeyExhaustedError("No API keys configured");
        }

        // Find a healthy key
        const healthyKey = this.findHealthyKey();
        if (!healthyKey) {
            throw new APIKeyExhaustedError();
        }

        return healthyKey.key;
    }

    /**
     * Find the next healthy key (not rate-limited, not in cooldown)
     */
    private findHealthyKey(): APIKeyConfig | null {
        const now = new Date();

        // First, try to use the current active key if healthy
        const activeKey = this.keys[this.activeKeyIndex];
        if (activeKey && this.isKeyHealthy(activeKey, now)) {
            return activeKey;
        }

        // Otherwise, find any healthy key
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (this.isKeyHealthy(key, now)) {
                this.rotateToKey(i);
                return key;
            }
        }

        // Check if any keys can be recovered from cooldown
        for (let i = 0; i < this.keys.length; i++) {
            const key = this.keys[i];
            if (key.cooldownUntil && key.cooldownUntil <= now) {
                // Reset key state after cooldown
                key.cooldownUntil = null;
                key.rateLimited = false;
                key.consecutiveErrors = 0;
                this.rotateToKey(i);
                return key;
            }
        }

        return null;
    }

    private isKeyHealthy(key: APIKeyConfig, now: Date): boolean {
        // Key is in cooldown
        if (key.cooldownUntil && key.cooldownUntil > now) {
            return false;
        }

        // Key is currently rate-limited
        if (key.rateLimited) {
            return false;
        }

        return true;
    }

    private rotateToKey(index: number): void {
        if (index !== this.activeKeyIndex) {
            console.log(`[APIKeyManager] Rotating from key ${this.activeKeyIndex} to key ${index}`);
            this.activeKeyIndex = index;
            this.lastRotation = new Date();
        }
    }

    /**
     * Mark that the key was used successfully
     */
    public markKeySuccess(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            keyConfig.callCount++;
            keyConfig.lastUsed = new Date();
            keyConfig.consecutiveErrors = 0;
        }
    }

    /**
     * Mark that the key encountered an error
     */
    public markKeyFailed(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            keyConfig.errorCount++;
            keyConfig.consecutiveErrors++;
            keyConfig.lastUsed = new Date();

            // Put key in cooldown after too many consecutive errors
            if (keyConfig.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                console.warn(`[APIKeyManager] Key ${keyConfig.index} reached max consecutive errors, entering cooldown`);
                keyConfig.cooldownUntil = new Date(Date.now() + ERROR_COOLDOWN_MS);
            }
        }
    }

    /**
     * Mark that the key was rate-limited (429 response)
     */
    public markKeyRateLimited(key: string): void {
        const keyConfig = this.keys.find(k => k.key === key);
        if (keyConfig) {
            console.warn(`[APIKeyManager] Key ${keyConfig.index} rate-limited, entering cooldown`);
            keyConfig.rateLimited = true;
            keyConfig.cooldownUntil = new Date(Date.now() + RATE_LIMIT_COOLDOWN_MS);
            keyConfig.lastUsed = new Date();
        }
    }

    /**
     * Get health status for monitoring
     */
    public getHealthStatus(): APIKeyManagerStatus {
        const now = new Date();

        return {
            totalKeys: this.keys.length,
            activeKeyIndex: this.activeKeyIndex,
            lastRotation: this.lastRotation,
            keys: this.keys.map((key): KeyHealthStatus => ({
                index: key.index,
                maskedKey: this.maskKey(key.key),
                callCount: key.callCount,
                isActive: key.index === this.activeKeyIndex,
                isHealthy: this.isKeyHealthy(key, now),
                rateLimited: key.rateLimited,
                cooldownRemaining: key.cooldownUntil
                    ? Math.max(0, Math.ceil((key.cooldownUntil.getTime() - now.getTime()) / 1000))
                    : null,
            })),
        };
    }

    private maskKey(key: string): string {
        if (key.length <= 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length - 4);
    }

    /**
     * Check if manager has any configured keys
     */
    public hasKeys(): boolean {
        return this.keys.length > 0;
    }

    /**
     * Get total number of configured keys
     */
    public getKeyCount(): number {
        return this.keys.length;
    }

    /**
     * Force reload - clears cache so next request refreshes from Firestore
     */
    public invalidateCache(): void {
        this.lastFirestoreLoad = null;
    }
}

// Singleton instance
let apiKeyManagerInstance: APIKeyManager | null = null;

export function getAPIKeyManager(): APIKeyManager {
    if (!apiKeyManagerInstance) {
        apiKeyManagerInstance = new APIKeyManager();
    }
    return apiKeyManagerInstance;
}

export function resetAPIKeyManager(): void {
    if (apiKeyManagerInstance) {
        apiKeyManagerInstance.invalidateCache();
    }
}

export { APIKeyManager };
