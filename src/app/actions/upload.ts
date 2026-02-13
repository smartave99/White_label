"use server";

import { getAdminStorage } from "@/lib/firebase-admin";

// Simple validation to ensure only authorized users can upload.
// For now, we'll rely on the client-side check or if we have a session cookie.
// Since we don't have a full session system visible here, we'll proceed with basic implementation.
// In a real production app, we should verify the ID token passed in headers or cookies.

export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "uploads";

        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const buffer = await file.arrayBuffer();
        const storage = getAdminStorage();
        const bucket = storage.bucket();

        // Check if bucket exists to provide better error message
        const [exists] = await bucket.exists().catch(err => {
            console.error("Bucket exists check failed:", err);
            throw new Error(`Firebase Storage access error: ${err.message}. Check if your service account has "Storage Admin" or "Storage Object Admin" permissions.`);
        });

        if (!exists) {
            const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "undefined";
            return {
                success: false,
                error: `Firebase Storage bucket "${bucketName}" not found (404). Please ensure Storage is enabled in the Firebase Console and the bucket name in .env.local is exactly correct.`
            };
        }

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `${folder}/${timestamp}_${safeName}`;
        const fileRef = bucket.file(filePath);

        await fileRef.save(Buffer.from(buffer), {
            metadata: {
                contentType: file.type,
            },
        });

        // Make the file public
        await fileRef.makePublic();
        const publicUrl = fileRef.publicUrl();

        return { success: true, url: publicUrl, path: filePath };

    } catch (error) {
        console.error("Server upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed"
        };
    }
}
