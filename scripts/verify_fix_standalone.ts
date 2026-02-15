
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
    try {
        const firebaseAdminConfig = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        };

        if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
            console.error("Missing env vars");
            process.exit(1);
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig),
            });
        }

        const db = admin.firestore();

        console.log("Attempting query: products where available == true (NO ORDER BY)");

        // This query queries filters by available=true but does NOT sort by createdAt in the DB
        // allowing us to bypass the missing composite index.
        const snapshot = await db.collection("products")
            .where("available", "==", true)
            .get(); // NO orderBy here

        console.log(`Query successful! Found ${snapshot.size} products.`);

        // Simulate in-memory sort
        const products = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as any)?.toDate() || new Date()
        }));

        products.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log("Top 3 available products (sorted in-memory):");
        products.slice(0, 3).forEach((p: any) => {
            console.log(`- ${p.id}: ${p.name} (available: ${p.available})`);
        });

    } catch (error: any) {
        console.error("Script failed!", error);
    }
}

run();
