import * as admin from "firebase-admin";

// Lazy initialization - only initialize when actually needed at runtime
function getAdminApp() {
    if (!admin.apps.length) {
        try {
            const firebaseAdminConfig = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace literal search for \n with actual newline character for PEM key
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            };

            if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
                console.error("Firebase Admin Error: Missing environment variables. Check .env.local");
                throw new Error("Missing Firebase Admin environment variables");
            }

            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig),
            });
        } catch (error) {
            console.error("Firebase Admin Initialization Failed:", error);
            // Return null or throw? If we throw, it crashes. 
            // Better to not initialize and let getAdminAuth/Db handle it.
            return null;
        }
    }
    return admin.app();
}

// Export getter functions for lazy initialization
export function getAdminAuth() {
    const app = getAdminApp();
    if (!app) {
        console.warn("Firebase Admin Auth accessed but app not initialized. Returning mock.");
        return {
            getUserByEmail: async () => null,
            verifyIdToken: async () => null,
        } as unknown as admin.auth.Auth;
    }
    return app.auth();
}

export function getAdminDb() {
    const app = getAdminApp();
    if (!app) {
        console.warn("Firebase Admin Firestore accessed but app not initialized. Returning mock.");
        // Return a mock object that matches Firestore interface nominally to prevent immediate crash, 
        // but operations will fail or return empty.
        return {
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false, data: () => undefined }),
                    set: async () => { },
                    update: async () => { },
                    delete: async () => { },
                    collection: () => ({ get: async () => ({ docs: [], empty: true }) }),
                }),
                add: async () => ({ id: "mock-id" }),
                where: () => ({ get: async () => ({ docs: [], empty: true }), limit: () => ({ get: async () => ({ docs: [], empty: true }) }) }),
                orderBy: () => ({ get: async () => ({ docs: [], empty: true }) }),
                get: async () => ({ docs: [], empty: true, size: 0 }),
                listCollections: async () => [],
            }),
            listCollections: async () => [],
        } as unknown as admin.firestore.Firestore;
    }
    return app.firestore();
}

export { admin };
