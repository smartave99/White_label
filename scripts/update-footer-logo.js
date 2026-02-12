const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function updateFooterLogo() {
    console.log("Starting footer logo update (JS version)...");

    const firebaseAdminConfig = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
        console.error("Firebase Admin Error: Missing environment variables.");
        return;
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseAdminConfig),
        });
    }

    const db = admin.firestore();

    try {
        const configRef = db.collection("site_config").doc("main");

        console.log("Fetching current configuration...");
        const doc = await configRef.get();

        if (!doc.exists) {
            console.error("Error: site_config/main document does not exist.");
            return;
        }

        console.log("Current configuration found. Updating footer logo...");

        await configRef.update({
            "footer.logoUrl": "/logo.png"
        });

        console.log("Successfully updated footer logo to /logo.png");

        // Verify the update
        const updatedDoc = await configRef.get();
        const updatedData = updatedDoc.data();
        console.log("Verification - New footer logo URL:", updatedData?.footer?.logoUrl);

    } catch (error) {
        console.error("Failed to update footer logo:", error);
    }
}

updateFooterLogo();
