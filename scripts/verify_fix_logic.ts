
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import from local lib to ensure consistent init
import { getAdminDb } from "../src/lib/firebase-admin.ts";

async function run() {
    try {
        const db = getAdminDb();

        console.log("Attempting query: products where available == true (NO ORDER BY)");

        // This query should work without a composite index
        const snapshot = await db.collection("products")
            .where("available", "==", true)
            // .orderBy("createdAt", "desc") // Intentionally removed
            .get();

        console.log(`Query successful! Found ${snapshot.size} products.`);

        // Simulate in-memory sort
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as any)?.toDate() || new Date()
        }));

        products.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log("Top 3 available products (sorted in-memory):");
        products.slice(0, 3).forEach((p: any) => {
            console.log(`- ${p.id}: ${p.name} (${p.createdAt.toISOString()})`);
        });

    } catch (error: any) {
        console.error("Script failed!", error);
    }
}

run();
