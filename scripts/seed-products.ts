import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getAdminDb, admin } from '../src/lib/firebase-admin';
import { createProduct, createCategory } from '../src/app/actions';

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

async function seed() {
    console.log("Seeding database...");

    // Clear existing data? Maybe not for now, just append/check.
    // Ideally we should check if data exists but for simplicity let's just create if not exists or duplicate (for dev).
    // Actually, let's just create them.

    const categoryMap = new Map<string, string>(); // slug -> id

    // 1. Create Categories
    console.log("Creating categories...");
    for (const cat of categories) {
        // Check if exists
        const snapshot = await getAdminDb().collection("categories").where("slug", "==", cat.slug).get();
        let catId = "";

        if (!snapshot.empty) {
            console.log(`Category ${cat.name} already exists.`);
            catId = snapshot.docs[0].id;
        } else {
            const res = await createCategory(cat.name, cat.parentId);
            if (res.success && res.id) {
                catId = res.id;
                console.log(`Created category ${cat.name}`);
            } else {
                console.error(`Failed to create category ${cat.name}:`, res.error);
            }
        }

        if (catId) {
            categoryMap.set(cat.slug, catId);
        }
    }

    // 2. Create Products
    console.log("Creating products...");
    for (const p of products) {
        const catId = categoryMap.get(p.categorySlug);
        if (!catId) {
            console.warn(`Category not found for product ${p.name}, skipping.`);
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
            // default empty/null for others
            videoUrl: "",
            subcategoryId: null,
        };

        const res = await createProduct(productData as any);
        if (res.success) {
            console.log(`Created product ${p.name}`);
        } else {
            console.error(`Failed to create product ${p.name}:`, res.error);
        }
    }

    console.log("Seeding complete!");
}

seed().catch(console.error);
