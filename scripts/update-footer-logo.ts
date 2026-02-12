import { getAdminDb } from "../src/lib/firebase-admin.js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function updateFooterLogo() {
    console.log("Starting footer logo update...");

    try {
        const db = getAdminDb();
        const configRef = db.collection("site_config").doc("main");

        console.log("Fetching current configuration...");
        const doc = await configRef.get();

        if (!doc.exists) {
            console.error("Error: site_config/main document does not exist.");
            return;
        }

        const data = doc.data();
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
