const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Mock data
const categories = [
    { name: "Electronics", slug: "electronics", parentId: null },
    { name: "Fashion", slug: "fashion", parentId: null },
    { name: "Home & Living", slug: "home-living", parentId: null },
];

const products = [
    {
        name: "Wireless Noise-Canceling Headphones",
        description: "Experience immersive sound with our premium wireless headphones. Features active noise cancellation, 30-hour battery life, and comfortable ear cushions.",
        price: 12999,
        categorySlug: "electronics",
        tags: ["audio", "headphones", "wireless", "music"],
        available: true,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
    {
        name: "Smart Fitness Watch",
        description: "Track your health and fitness goals with this advanced smartwatch. Monitors heart rate, sleep, and steps. Water-resistant and compatible with iOS and Android.",
        price: 4999,
        categorySlug: "electronics",
        tags: ["wearable", "fitness", "smartwatch", "tech"],
        available: true,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    },
    {
        name: "Men's Classic Running Shoes",
        description: "Lightweight and breathable running shoes designed for performance and comfort. Perfect for daily jogging or marathon training.",
        price: 3499,
        categorySlug: "fashion",
        tags: ["shoes", "running", "sports", "footwear"],
        available: true,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    },
    {
        name: "Women's Floral Summer Dress",
        description: "A beautiful floral dress perfect for summer outings. Made from breathable cotton fabric with a flattering fit.",
        price: 2499,
        categorySlug: "fashion",
        tags: ["clothing", "dress", "summer", "women"],
        available: true,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    },
    {
        name: "Modern Minimalist Coffee Table",
        description: "Elevate your living room with this sleek coffee table. Crafted from solid wood with a durable finish.",
        price: 8999,
        categorySlug: "home-living",
        tags: ["furniture", "living room", "decor", "table"],
        available: true,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80",
    },
    {
        name: "Ergonomic Office Chair",
        description: "Work in comfort with this ergonomic office chair. Adjustable height, lumbar support, and breathable mesh back.",
        price: 7500,
        categorySlug: "home-living",
        tags: ["furniture", "office", "chair", "work"],
        available: true,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
    },
    {
        name: "Professional DSLR Camera",
        description: "Capture stunning photos and videos with this professional DSLR camera. Includes 18-55mm lens and high-resolution sensor.",
        price: 45000,
        categorySlug: "electronics",
        tags: ["camera", "photography", "video", "tech"],
        available: true,
        featured: true,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    },
    {
        name: "Ceramic Vase Set",
        description: "Add a touch of elegance to your home with this set of 3 ceramic vases. Perfect for fresh or dried flowers.",
        price: 1500,
        categorySlug: "home-living",
        tags: ["decor", "vase", "home", "ceramic"],
        available: true,
        featured: false,
        imageUrl: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80",
    }
];

async function restoreProducts() {
    console.log("Starting product restoration...");

    // Initialize Admin SDK
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
    const categoryMap = new Map(); // slug -> id

    try {
        // 1. Restore Categories
        console.log("Restoring categories...");
        for (const cat of categories) {
            const snapshot = await db.collection("categories").where("slug", "==", cat.slug).get();
            let catId = "";

            if (!snapshot.empty) {
                console.log(`Category ${cat.name} already exists.`);
                catId = snapshot.docs[0].id;
            } else {
                const docRef = await db.collection("categories").add({
                    ...cat,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                catId = docRef.id;
                console.log(`Restored category ${cat.name}`);
            }
            categoryMap.set(cat.slug, catId);
        }

        // 2. Restore Products
        console.log("Restoring products...");
        for (const p of products) {
            const catId = categoryMap.get(p.categorySlug);
            if (!catId) {
                console.warn(`Category not found for product ${p.name}, skipping.`);
                continue;
            }

            // Check if product already exists to avoid duplicates on re-run
            // Simple check by name
            const existingProd = await db.collection("products").where("name", "==", p.name).limit(1).get();
            if (!existingProd.empty) {
                console.log(`Product ${p.name} already exists.`);
                continue;
            }

            const productData = {
                name: p.name,
                description: p.description,
                price: p.price,
                categoryId: catId,
                imageUrl: p.imageUrl,
                images: [p.imageUrl],
                available: p.available,
                featured: p.featured,
                tags: p.tags,
                videoUrl: null,
                subcategoryId: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection("products").add(productData);
            console.log(`Restored product ${p.name}`);
        }

        console.log("Restoration complete!");

    } catch (error) {
        console.error("Failed to restore products:", error);
    }
}

restoreProducts();
