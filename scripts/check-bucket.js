
const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Handle private key newlines
const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;
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
    const bucketName = storageBucket;
    const bucket = storage.bucket(bucketName);
    console.log('Checking configured Bucket:', bucket.name);

    // Check if it exists
    bucket.exists().then(async ([exists]) => {
        console.log(`Configured bucket '${bucket.name}' exists:`, exists);

        if (!exists) {
            console.log('Default configured bucket does not exist.');

            // Check alternative common name
            const altName = `${projectId}.appspot.com`;
            const altBucket = storage.bucket(altName);
            try {
                const [altExists] = await altBucket.exists();
                console.log(`Checking alternative '${altName}' exists:`, altExists);
            } catch (e) {
                console.log(`Error checking alternative '${altName}':`, e.message);
            }

            console.log('Listing all available buckets...');
            try {
                // Access the underlying GCS Storage client
                // In firebase-admin, storage().bucket() returns a GCS Bucket.
                // The bucket instance has a 'storage' property which is the GCS Storage client.
                const gcs = bucket.storage;
                const [buckets] = await gcs.getBuckets();
                console.log('Available buckets:');
                if (buckets && buckets.length > 0) {
                    buckets.forEach(b => console.log(` - ${b.name}`));
                } else {
                    console.log(' - No buckets found.');
                }
            } catch (err) {
                console.error('Error listing buckets:', err.message);
            }
        }
    }).catch(err => {
        console.error('Error checking bucket existence:', err);
    });

} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
}
