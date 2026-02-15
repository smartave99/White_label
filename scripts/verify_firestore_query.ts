
import { getAdminDb } from "@/lib/firebase-admin";

async function verifyQuery() {
    console.log("Starting query verification...");
    try {
        const db = getAdminDb();
        // Mimic the query in getProducts when available=false
        const query = db.collection("products")
            .where("available", "==", false)
            .orderBy("createdAt", "desc")
            .limit(10);

        console.log("Executing query: where(available == false).orderBy(createdAt, desc)");
        const snapshot = await query.get();
        console.log(`Query successful! retrieved ${snapshot.size} docs.`);
    } catch (error: any) {
        console.error("Query failed!");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        if (error.details) console.error("Error details:", error.details);
    }
}

verifyQuery()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
