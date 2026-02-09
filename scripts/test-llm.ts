
import 'dotenv/config';
import type { Product } from '../src/app/actions';

async function main() {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { analyzeIntent, rankAndSummarize } = await import('../src/lib/llm-service');

    console.log("Starting LLM Test...");

    // Mock categorization data
    const categories: any[] = [
        { id: "cat_shoes", name: "Shoes", description: "Footwear", image: "", parentId: null, slug: "shoes", order: 0, createdAt: new Date() },
        { id: "cat_electronics", name: "Electronics", description: "Gadgets", image: "", parentId: null, slug: "electronics", order: 1, createdAt: new Date() }
    ];

    // Mock products
    const products: Product[] = [
        {
            id: "p1", name: "SpeedRunner 3000", description: "High performance running shoe",
            price: 4500, categoryId: "cat_shoes", images: [], tags: ["running", "sports"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg",
            subcategoryId: null, offerId: null
        },
        {
            id: "p2", name: "ComfyWalker", description: "Casual walking shoe",
            price: 2000, categoryId: "cat_shoes", images: [], tags: ["walking", "casual"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg",
            subcategoryId: null, offerId: null
        },
        {
            id: "p3", name: "ProLaptop X", description: "Gaming laptop",
            price: 80000, categoryId: "cat_electronics", images: [], tags: ["gaming", "computer"],
            available: true, featured: false, createdAt: new Date(), updatedAt: new Date(),
            imageUrl: "placeholder.jpg",
            subcategoryId: null, offerId: null
        }
    ];

    // 1. Test Intent Analysis
    console.log("\n--- Testing Intent Analysis (Groq) ---");
    const query = "I am looking for a running shoe under 5000";

    try {
        const intent = await analyzeIntent(query, categories);
        console.log("Intent Result:", JSON.stringify(intent, null, 2));
    } catch (error) {
        console.error("Intent Analysis Failed:", error);
    }

    // 2. Test Rank & Summarize
    console.log("\n--- Testing Rank & Summarize (Groq) ---");

    try {
        // We'll mock the intent for this second call
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const mockIntent: any = {
            category: "cat_shoes",
            subcategory: null,
            requirements: ["running", "under 5000"],
            budgetMin: null,
            budgetMax: 5000,
            preferences: [],
            useCase: "running",
            confidence: 0.9
        };

        const result = await rankAndSummarize(query, products, mockIntent);
        console.log("Rank & Summary Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Rank & Summarize Failed:", error);
    }
}

main().catch(console.error);
