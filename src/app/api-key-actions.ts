"use server";

/**
 * API Key Management Actions
 * 
 * Server actions for managing Gemini API keys in Firestore.
 */

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { getAPIKeyManager, resetAPIKeyManager } from "@/lib/api-key-manager";
import { revalidatePath } from "next/cache";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.0-flash";

// ==================== API KEY TYPES ====================

import { LLMProvider } from "@/types/assistant-types";

export interface StoredAPIKey {
    id: string;
    name: string;
    provider: LLMProvider;
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
                provider: data.provider || "google", // Default to google for existing keys
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
export async function addAPIKey(name: string, key: string, provider: LLMProvider = "google") {
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
            provider,
            key: trimmedKey,
            isActive: true,
            isValid: null,
            lastTested: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Invalidate API key manager cache
        resetAPIKeyManager();

        revalidatePath("/admin/api-keys");

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("[addAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Update an existing API key
 */
export async function updateAPIKey(id: string, data: { name?: string; key?: string; provider?: LLMProvider; isActive?: boolean }) {
    try {
        const updateData: Record<string, unknown> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.provider !== undefined) updateData.provider = data.provider;
        if (data.key !== undefined) {
            updateData.key = data.key.trim();
            updateData.isValid = null; // Reset validation when key changes
            updateData.lastTested = null;
        }
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        await getAdminDb().collection("apiKeys").doc(id).update(updateData);

        // Invalidate API key manager cache
        resetAPIKeyManager();

        revalidatePath("/admin/api-keys");

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

        revalidatePath("/admin/api-keys");

        return { success: true };
    } catch (error) {
        console.error("[deleteAPIKey] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

// ==================== API KEY TESTING ====================

/**
 * Test if an API key is functional
 */
export async function testAPIKey(keyOrId: string, isId: boolean = false, providerStr?: string) {
    try {
        let apiKey = keyOrId;
        let provider: LLMProvider = (providerStr as LLMProvider) || "google";

        // If it's an ID, fetch the key and provider from Firestore
        if (isId) {
            const doc = await getAdminDb().collection("apiKeys").doc(keyOrId).get();
            if (!doc.exists) {
                return { success: false, error: "API key not found", isValid: false };
            }
            const data = doc.data();
            apiKey = data?.key;
            provider = (data?.provider as LLMProvider) || "google";
        }

        if (!apiKey || apiKey.trim().length < 5) { // Adjusted min length as some keys might be short?
            return { success: false, error: "Invalid API key format", isValid: false };
        }

        let isValid = false;
        let errorMessage = "";
        let statusCode = 0;

        // Test based on provider
        if (provider === "google") {
            const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hi" }] }],
                    generationConfig: { maxOutputTokens: 5 },
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.error?.message || `HTTP ${statusCode}`;
            }
        } else if (provider === "openai") {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5,
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const data = await response.json().catch(() => ({}));
                errorMessage = data.error?.message || `HTTP ${statusCode}`;
            }
        } else if (provider === "anthropic") {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey.trim(),
                    "anthropic-version": "2023-06-01"
                },
                body: JSON.stringify({
                    model: "claude-3-haiku-20240307", // Use cheapest model for testing
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5,
                }),
            });
            statusCode = response.status;
            isValid = response.ok;
            if (!isValid) {
                const errorText = await response.text();
                errorMessage = `HTTP ${statusCode} - ${errorText.substring(0, 100)}`;
            }
        } else {
            return { success: false, error: "Unknown provider", isValid: false };
        }

        // Handle rate limits (429) as success for validity check
        if (statusCode === 429) {
            isValid = true;
            errorMessage = "Rate limited (Key is valid)";
        }

        // If testing by ID, update the key's validation status in Firestore
        if (isId) {
            await getAdminDb().collection("apiKeys").doc(keyOrId).update({
                isValid: isValid,
                lastTested: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        return {
            success: true,
            isValid: isValid,
            message: isValid ? "API key is working correctly" : errorMessage,
            statusCode: statusCode,
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

        const keys = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
                key: data.key as string,
                provider: (data.provider || "google") as LLMProvider,
                id: doc.id
            };
        }).filter(k => k.key && k.key.trim() !== "");

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
