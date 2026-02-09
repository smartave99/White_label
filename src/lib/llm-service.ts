/**
 * LLM Service
 * 
 * Wrapper for Google Gemini API with automatic key rotation and error handling.
 */

import { getAPIKeyManager } from "./api-key-manager";
import {
    LLMIntentResponse,
    LLMServiceError,
    APIKeyExhaustedError
} from "@/types/assistant-types";
import { Product, Category } from "@/app/actions";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-1.5-flash";
const MAX_RETRIES = 3;

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        code: number;
        message: string;
    };
}

/**
 * Make a request to Gemini API with automatic key rotation on failure
 */
async function callGeminiAPI(prompt: string, retryCount: number = 0): Promise<string> {
    const keyManager = getAPIKeyManager();

    if (!keyManager.hasKeys()) {
        throw new APIKeyExhaustedError("No API keys configured");
    }

    let apiKey: string;
    try {
        apiKey = keyManager.getActiveKey();
    } catch (error) {
        throw error;
    }

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (response.status === 429) {
            // Rate limited
            keyManager.markKeyRateLimited(apiKey);

            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Rate limited, retrying with new key (attempt ${retryCount + 1})`);
                return callGeminiAPI(prompt, retryCount + 1);
            }

            throw new LLMServiceError("Rate limit exceeded on all available keys", 429);
        }

        if (!response.ok) {
            keyManager.markKeyFailed(apiKey);

            if (retryCount < MAX_RETRIES) {
                console.log(`[LLMService] Request failed (${response.status}), retrying (attempt ${retryCount + 1})`);
                return callGeminiAPI(prompt, retryCount + 1);
            }

            throw new LLMServiceError(`API request failed: ${response.statusText}`, response.status);
        }

        const data: GeminiResponse = await response.json();

        if (data.error) {
            keyManager.markKeyFailed(apiKey);
            throw new LLMServiceError(data.error.message, data.error.code);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new LLMServiceError("No response text from Gemini");
        }

        keyManager.markKeySuccess(apiKey);
        return text;
    } catch (error) {
        if (error instanceof LLMServiceError || error instanceof APIKeyExhaustedError) {
            throw error;
        }

        keyManager.markKeyFailed(apiKey);

        if (retryCount < MAX_RETRIES) {
            console.log(`[LLMService] Unexpected error, retrying (attempt ${retryCount + 1})`, error);
            return callGeminiAPI(prompt, retryCount + 1);
        }

        throw new LLMServiceError(`Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
}

/**
 * Parse JSON from LLM response, handling markdown code blocks
 */
function parseJSONFromResponse<T>(response: string): T {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        throw new LLMServiceError(`Failed to parse LLM response as JSON: ${response.substring(0, 100)}...`);
    }
}

/**
 * Analyze user query to extract intent
 */
export async function analyzeIntent(
    query: string,
    categories: Category[]
): Promise<LLMIntentResponse> {
    const categoryList = categories.map(c => `- ${c.name} (ID: ${c.id})`).join("\n");

    const prompt = `You are a product recommendation assistant for a retail store called "Smart Avenue" in India.

Analyze the following customer query and extract their intent.

Available product categories:
${categoryList}

Customer query: "${query}"

Respond with a JSON object (and nothing else) in this exact format:
{
  "category": "category ID from the list above, or null if unclear",
  "subcategory": "subcategory ID if applicable, or null",
  "requirements": ["list of specific requirements extracted from the query"],
  "budgetMin": null or number in INR,
  "budgetMax": null or number in INR (e.g., if they say "under 500", set this to 500),
  "preferences": ["any stated preferences like 'premium', 'simple', 'colorful', etc."],
  "useCase": "brief description of what they want to use the product for",
  "confidence": 0.0 to 1.0 indicating how confident you are in understanding their intent
}`;

    const response = await callGeminiAPI(prompt);
    return parseJSONFromResponse<LLMIntentResponse>(response);
}

/**
 * Score and rank products for the user's needs
 */
export async function rankProducts(
    query: string,
    products: Product[],
    intent: LLMIntentResponse
): Promise<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>> {
    if (products.length === 0) {
        return [];
    }

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `You are a product recommendation assistant for Smart Avenue retail store.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Rank the top 3-5 most suitable products for this customer. For each product, explain why it matches their needs.

Respond with a JSON array (and nothing else) in this exact format:
[
  {
    "productId": "the product ID",
    "matchScore": 0-100 indicating how well it matches,
    "highlights": ["key features that match their needs"],
    "whyRecommended": "A 1-2 sentence explanation of why this product is recommended"
  }
]

Only include products that are relevant. If no products match well, return an empty array.`;

    const response = await callGeminiAPI(prompt);
    return parseJSONFromResponse<Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>>(response);
}

/**
 * Generate a summary response for the user
 */
export async function generateSummary(
    query: string,
    recommendationCount: number,
    topProductName: string | null
): Promise<string> {
    if (recommendationCount === 0) {
        return "I couldn't find specific products matching your requirements. Could you provide more details about what you're looking for?";
    }

    const prompt = `You are a friendly product recommendation assistant for Smart Avenue retail store in India.

Customer asked: "${query}"

You found ${recommendationCount} product recommendation(s)${topProductName ? `, with "${topProductName}" being the top match` : ""}.

Write a brief, friendly 1-2 sentence summary to introduce the recommendations. Be helpful and conversational. Do not use markdown formatting.`;

    const response = await callGeminiAPI(prompt);
    return response.trim().replace(/```/g, "").replace(/^["']|["']$/g, "");
}

/**
 * Combined ranking and summary generation in a single LLM call
 * Reduces API calls from 3 to 2 for better performance
 */
export async function rankAndSummarize(
    query: string,
    products: Product[],
    intent: LLMIntentResponse
): Promise<{
    rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
    summary: string;
}> {
    if (products.length === 0) {
        return {
            rankings: [],
            summary: "I couldn't find specific products matching your requirements. Could you provide more details about what you're looking for?",
        };
    }

    const productList = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        tags: p.tags,
    }));

    const prompt = `You are a product recommendation assistant for Smart Avenue retail store in India.

Customer query: "${query}"

Intent analysis:
- Use case: ${intent.useCase}
- Requirements: ${intent.requirements.join(", ") || "none specified"}
- Preferences: ${intent.preferences.join(", ") || "none specified"}
- Budget: ${intent.budgetMin ? `₹${intent.budgetMin}` : "any"} - ${intent.budgetMax ? `₹${intent.budgetMax}` : "any"}

Available products:
${JSON.stringify(productList, null, 2)}

Do two things:
1. Rank the top 3-5 most suitable products for this customer
2. Write a brief, friendly 1-2 sentence summary to introduce the recommendations

Respond with a JSON object (and nothing else) in this exact format:
{
  "rankings": [
    {
      "productId": "the product ID",
      "matchScore": 0-100 indicating how well it matches,
      "highlights": ["key features that match their needs"],
      "whyRecommended": "A 1-2 sentence explanation"
    }
  ],
  "summary": "A brief, friendly 1-2 sentence summary for the customer"
}

Only include relevant products. If no products match well, return empty rankings.`;

    const response = await callGeminiAPI(prompt);
    return parseJSONFromResponse<{
        rankings: Array<{ productId: string; matchScore: number; highlights: string[]; whyRecommended: string }>;
        summary: string;
    }>(response);
}

