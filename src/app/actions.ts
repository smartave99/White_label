"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function testFirebaseConnection() {
    try {
        // This will attempt to list collections or fetch a doc
        // Note: This will fail until the user provides valid env vars
        const snapshot = await adminDb.listCollections();
        console.log("Successfully connected to Firebase!");
        return {
            success: true,
            message: "Connected to Firebase!",
            collections: snapshot.map(col => col.id)
        };
    } catch (error: any) {
        console.error("Firebase Connection Error:", error.message);
        return {
            success: false,
            message: "Failed to connect to Firebase. Check your .env.local file.",
            error: error.message
        };
    }
}
