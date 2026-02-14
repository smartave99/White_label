const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
    }),
});

async function createAdminUser() {
    try {
        // First try to find if user already exists
        try {
            const existingUser = await admin.auth().getUserByEmail("admin@smartavenue99.com");
            console.log("User already exists:", existingUser.uid);
            console.log("Email:", existingUser.email);
            console.log("Disabled:", existingUser.disabled);

            // If user is disabled, enable them
            if (existingUser.disabled) {
                await admin.auth().updateUser(existingUser.uid, { disabled: false });
                console.log("User was disabled - now ENABLED.");
            }

            // Reset password to 123456
            await admin.auth().updateUser(existingUser.uid, { password: "123456" });
            console.log("Password has been reset to 123456");

            process.exit(0);
            return;
        } catch (err) {
            if (err.code !== "auth/user-not-found") {
                throw err;
            }
            console.log("User does not exist, creating...");
        }

        // Create the user
        const userRecord = await admin.auth().createUser({
            email: "admin@smartavenue99.com",
            password: "123456",
            displayName: "Admin",
            emailVerified: true,
        });

        console.log("Successfully created admin user:");
        console.log("  UID:", userRecord.uid);
        console.log("  Email:", userRecord.email);
        console.log("  Display Name:", userRecord.displayName);
        console.log("\nYou can now log in with:");
        console.log("  Email: admin@smartavenue99.com");
        console.log("  Password: 123456");
    } catch (error) {
        console.error("Error:", error.message);
    }
    process.exit(0);
}

createAdminUser();
