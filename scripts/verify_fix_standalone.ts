
const admin = require("firebase-admin");
const path = require("path");
const dotenv = require("dotenv");

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

        const snapshot = await db.collection("products")
            .where("available", "==", true)
            .get();

        console.log(`Query successful! Found ${snapshot.size} products.`);

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log("Top 3 available products (sorted in-memory):");
        products.slice(0, 3).forEach(p => {
            console.log(`- ${p.id}: ${p.name} (available: ${p.available})`);
        });

    } catch (error) {
        console.error("Script failed!", error);
    }
}

run();
