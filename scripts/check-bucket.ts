
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

console.log('Project ID:', projectId);
console.log('Storage Bucket Strategy:', storageBucket);

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin environment variables');
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
        storageBucket: storageBucket,
    });

    console.log('Firebase Admin Initialized');

    const storage = admin.storage();

    // Try to get the default bucket
    const bucket = storage.bucket();
    console.log('Default Bucket Name:', bucket.name);

    // Check if it exists
    bucket.exists().then(([exists]) => {
        console.log(`Default bucket '${bucket.name}' exists:`, exists);

        if (!exists) {
            console.log('Listing all buckets...');
            storage.getBuckets().then(([buckets]) => {
                console.log('Available buckets:');
                buckets.forEach(b => console.log(` - ${b.name}`));
            }).catch(err => {
                console.error('Error listing buckets:', err);
            });
        }
    }).catch(err => {
        console.error('Error checking default bucket existence:', err);
    });

} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}
