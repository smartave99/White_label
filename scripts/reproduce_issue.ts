
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import from local lib to ensure consistent init
import { getAdminDb } from "../src/lib/firebase-admin";

async function run() {
    try {
        const db = getAdminDb();
        if (!db) {
            console.error("Failed to initialize DB (mock returned?)");
            process.exit(1);
        }

        console.log("Checking products collection...");
        // Check if ANY products exist first
        try {
            const allSnap = await db.collection("products").limit(1).get();
            console.log(`Any products exist? ${!allSnap.empty} (size: ${allSnap.size})`);
        } catch (e: any) {
            console.error("Basic connectivity check failed:", e.message);
            process.exit(1);
        }

        console.log("\nAttempting query: products where available == true, ordered by createdAt desc");

        try {
            const snapshot = await db.collection("products")
                .where("available", "==", true)
                .orderBy("createdAt", "desc")
                .get();

            console.log(`Query successful! Found ${snapshot.size} products.`);
            snapshot.docs.forEach((doc: any) => {
                const d = doc.data();
                console.log(`- ${doc.id}: ${d.name} (available: ${d.available})`);
            });
        } catch (queryError: any) {
            console.error("\n--- QUERY FAILED ---");
            console.error(queryError.message);
            if (queryError.code === 9 || queryError.message.includes("index")) { // FAILED_PRECONDITION
                console.log("\n---------------------------------------------------");
                console.log("ROOT CAUSE IDENTIFIED: Missing Firestore Index");
                console.log("---------------------------------------------------");
                if (queryError.details) console.log(queryError.details);
            }
        }

    } catch (error) {
        console.error("Script failed!", error);
    }
}

run();
