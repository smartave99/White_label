"use server";

/**
 * API Key Management Actions
 * 
 * Server actions for managing Gemini API keys in Firestore.
 */

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { getAPIKeyManager, resetAPIKeyManager } from "@/lib/api-key-manager";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-1.5-flash";

// ==================== API KEY TYPES ====================

export interface StoredAPIKey {
    id: string;
    name: string;
    key: string;
    maskedKey: string;
    isActive: boolean;
    isValid: boolean | null;
    lastTested: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== API KEY CRUD ====================

/**
 * Get all stored API keys
 */
export async function getAPIKeys(): Promise<StoredAPIKey[]> {
    try {
        const snapshot = await getAdminDb()
            .collection("apiKeys")
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || `Key ${doc.id.substring(0, 6)}`,
                key: data.key,
                maskedKey: maskKey(data.key),
                isActive: data.isActive ?? true,
                isValid: data.isValid ?? null,
                lastTested: data.lastTested?.toDate() || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error("[getAPIKeys] Error:", error);
        return [];
    }
}

/**
 * Add a new API key
 */
export async function addAPIKey(name: string, key: string) {
    try {
        // Validate key format (basic check)
        if (!key || key.trim().length < 10) {
            return { success: false, error: "Invalid API key format" };
        }

        const trimmedKey = key.trim();

        // Check for duplicates
        const existing = await getAdminDb()
            .collection("apiKeys")
            .where("key", "==", trimmedKey)
            .get();

        if (!existing.empty) {
            return { success: false, error: "This API key already exists" };
        }

        const docRef = await getAdminDb().collection("apiKeys").add({
            name: name.trim() || `Key ${Date.now()}`,
            key: trimmedKey,
            isActive: true,
            isValid: null,
            lastTested: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Invalidate API key manager cache
        resetAPIKeyManager();

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("[addAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Update an existing API key
 */
export async function updateAPIKey(id: string, data: { name?: string; key?: string; isActive?: boolean }) {
    try {
        const updateData: Record<string, unknown> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.key !== undefined) {
            updateData.key = data.key.trim();
            updateData.isValid = null; // Reset validation when key changes
            updateData.lastTested = null;
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        await getAdminDb().collection("apiKeys").doc(id).update(updateData);

        // Invalidate API key manager cache
        resetAPIKeyManager();

        return { success: true };
    } catch (error) {
        console.error("[updateAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(id: string) {
    try {
        await getAdminDb().collection("apiKeys").doc(id).delete();

        // Invalidate API key manager cache
        resetAPIKeyManager();

        return { success: true };
    } catch (error) {
        console.error("[deleteAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== API KEY TESTING ====================

/**
 * Test if an API key is functional by making a simple request to Gemini
 */
export async function testAPIKey(keyOrId: string, isId: boolean = false) {
    try {
        let apiKey = keyOrId;

        // If it's an ID, fetch the key from Firestore
        if (isId) {
            const doc = await getAdminDb().collection("apiKeys").doc(keyOrId).get();
            if (!doc.exists) {
                return { success: false, error: "API key not found", isValid: false };
            }
            apiKey = doc.data()?.key;
        }

        if (!apiKey || apiKey.trim().length < 10) {
            return { success: false, error: "Invalid API key format", isValid: false };
        }

        // Make a simple test request to Gemini
        const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say hello in one word." }] }],
                generationConfig: { maxOutputTokens: 10 },
            }),
        });

        const isValid = response.ok;
        let errorMessage = "";

        if (!isValid) {
            const data = await response.json().catch(() => ({}));
            if (response.status === 429) {
                errorMessage = "Rate limited - key is valid but temporarily throttled";
                // Still consider it valid if rate limited
            } else if (response.status === 400) {
                errorMessage = data.error?.message || "Invalid request format";
            } else if (response.status === 403) {
                errorMessage = "API key is invalid or lacks permissions";
            } else {
                errorMessage = data.error?.message || `HTTP ${response.status}`;
            }
        }

        // If testing by ID, update the key's validation status in Firestore
        if (isId) {
            await getAdminDb().collection("apiKeys").doc(keyOrId).update({
                isValid: isValid || response.status === 429, // Rate limited = still valid
                lastTested: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        return {
            success: true,
            isValid: isValid || response.status === 429,
            message: isValid ? "API key is working correctly" : errorMessage,
            statusCode: response.status,
        };
    } catch (error) {
        console.error("[testAPIKey] Error:", error);

        // Update validation status if testing by ID
        if (isId) {
            try {
                await getAdminDb().collection("apiKeys").doc(keyOrId).update({
                    isValid: false,
                    lastTested: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch { /* ignore */ }
        }

        return {
            success: false,
            isValid: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

// ==================== SYNC WITH API KEY MANAGER ====================

/**
 * Load active API keys from Firestore into the API Key Manager
 */
export async function syncAPIKeysToManager() {
    try {
        const snapshot = await getAdminDb()
            .collection("apiKeys")
            .where("isActive", "==", true)
            .get();

        const keys = snapshot.docs
            .map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data().key as string)
            .filter((key: string) => key && key.trim() !== "");

        const manager = getAPIKeyManager();
        manager.loadFirestoreKeys(keys);

        return { success: true, keyCount: keys.length };
    } catch (error) {
        console.error("[syncAPIKeysToManager] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Get the current health status of the API Key Manager
 */
export async function getAPIKeyManagerHealth() {
    // First sync keys from Firestore
    await syncAPIKeysToManager();

    const manager = getAPIKeyManager();
    return manager.getHealthStatus();
}

// ==================== HELPERS ====================

function maskKey(key: string): string {
    if (!key || key.length <= 8) return "****";
    return key.substring(0, 4) + "****" + key.substring(key.length - 4);
}
