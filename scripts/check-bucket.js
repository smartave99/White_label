
const { Storage } = require('@google-cloud/storage');
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

console.log('Project ID:', projectId);

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin environment variables');
    process.exit(1);
}

async function run() {
    try {
        const storage = new Storage({
            projectId: projectId,
            credentials: {
                client_email: clientEmail,
                private_key: privateKey
            }
        });

        console.log('GCS Client Initialized');

        // 1. Check if ANY buckets exist
        console.log('Listing all available buckets...');
        try {
            const [buckets] = await storage.getBuckets();
            console.log(`Found ${buckets.length} buckets.`);

            if (buckets.length > 0) {
                console.log('Available buckets:');
                buckets.forEach(b => console.log(` - ${b.name}`));
                return; // We found buckets, no need to create
            }
        } catch (err) {
            console.error('Error listing buckets:', err.message);
            if (err.message.includes('permission') || err.code === 403) {
                console.error('Service account misses permissions to list buckets.');
            }
        }

        // 2. Try to CREATE a bucket if none exist
        const newBucketName = `${projectId}-uploads`; // e.g. smart-avenue-59f29-uploads
        console.log(`No buckets found. Attempting to create bucket: ${newBucketName}`);

        try {
            const [bucket] = await storage.createBucket(newBucketName, {
                location: 'US',
                standard: true
            });
            console.log(`SUCCESS: Created bucket '${bucket.name}'`);
        } catch (createErr) {
            console.error(`FAILED to create bucket '${newBucketName}':`, createErr.message);

            // Try another name
            const fallbackName = `${projectId}.appspot.com`; // Standard App Engine bucket
            console.log(`Attempting to create fallback bucket: ${fallbackName}`);
            try {
                const [bucket] = await storage.createBucket(fallbackName, {
                    location: 'US',
                    standard: true
                });
                console.log(`SUCCESS: Created bucket '${bucket.name}'`);
            } catch (fallbackErr) {
                console.error(`FAILED to create bucket '${fallbackName}':`, fallbackErr.message);
            }
        }

    } catch (error) {
        console.error('Error in run:', error);
    }
}

run();
