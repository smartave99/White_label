
import { getAdminDb } from "@/lib/firebase-admin";

async function verifyQuery() {
    console.log("Starting verification of fix logic...");
    try {
        const db = getAdminDb();
        console.log("1. Attempting query with orderBy (simulating current failure)...");
        // Mimic the query in getProducts when available=false
        const query = db.collection("products")
            .where("available", "==", false);

        try {
            await query.orderBy("createdAt", "desc").limit(10).get();
            console.log("SUCCESS: Index exists! (Unexpected but good)");
        } catch (e: any) {
            console.log("EXPECTED ERROR caught:", e.code);

            if (e.code === 9 || e.message?.includes("index")) {
                console.log("2. Simulating FALLBACK logic (in-memory sort)...");
                const snapshot = await query.limit(10).get();
                console.log(`Fallback query returned ${snapshot.size} docs.`);
                const products = snapshot.docs.map(d => ({ ...d.data(), id: d.id, createdAt: d.data().createdAt.toDate() }));

                // Sort in memory
                products.sort((a: any, b: any) => b.createdAt - a.createdAt);
                console.log("In-memory sort completed.");
                console.log("Top product:", products[0]?.name);
            } else {
                throw e;
            }
        }

    } catch (error: any) {
        console.error("Verification failed with unexpected error!");
        console.error(error);
    }
}

verifyQuery()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
