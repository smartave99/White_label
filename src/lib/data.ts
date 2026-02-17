import "server-only";
import { getAdminDb, admin } from "@/lib/firebase-admin";
import { getSearchCache, CacheKeys } from "@/lib/search-cache";

// ==================== OFFERS ====================

export interface Offer {
    id: string;
    title: string;
    discount: string;
    description: string;
    createdAt: Date;
}

export async function getOffers(): Promise<Offer[]> {
    try {
        const snapshot = await getAdminDb().collection("offers").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Offer[];
    } catch (error) {
        console.error("Error fetching offers:", error);
        return [];
    }
}

// ==================== TEST CONNECTION ====================

export async function testFirebaseConnection() {
    try {
        const snapshot = await getAdminDb().listCollections();
        console.log("Successfully connected to Firebase!");
        return {
            success: true,
            message: "Connected to Firebase!",
            collections: snapshot.map((col: admin.firestore.CollectionReference) => col.id)
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Firebase Connection Error:", errorMessage);
        return {
            success: false,
            message: "Failed to connect to Firebase. Check your .env.local file.",
            error: errorMessage
        };
    }
}

// ==================== SITE CONTENT ====================

export interface HeroContent {
    title: string;
    subtitle: string;
    tagline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    learnMoreLink?: string;
    backgroundImage: string;
}

export interface DepartmentContent {
    id: string;
    title: string;
    description: string;
    icon: string;
    image: string;
}

export interface ContactContent {
    address: string;
    phone: string;
    email: string;
    mapEmbed: string;
    storeHours: string;
}

export interface FeaturesContent {
    title: string;
    subtitle: string;
    items: {
        title: string;
        desc: string;
        icon: string;
    }[];
}

export interface CTAContent {
    title: string;
    text: string;
    ctaPrimary: string;
    ctaLink: string;
    ctaSecondary: string;
    backgroundImage: string;
}

export interface HighlightsContent {
    title: string;
    subtitle: string;
    description: string;
}

// Get site content by section
export async function getSiteContent<T>(section: string): Promise<T | null> {
    try {
        const doc = await getAdminDb().collection("siteContent").doc(section).get();
        if (doc.exists) {
            const data = doc.data();
            // detailed generic serialization for common timestamp fields
            return {
                ...data,
                createdAt: (data?.createdAt as admin.firestore.Timestamp)?.toDate() || undefined,
                updatedAt: (data?.updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
            } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ${section} content:`, error);
        return null;
    }
}

// Get all departments
export async function getDepartments(): Promise<DepartmentContent[]> {
    try {
        const doc = await getAdminDb().collection("siteContent").doc("departments").get();
        if (doc.exists) {
            return doc.data()?.items || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}

// ==================== STAFF MANAGEMENT ====================

export interface StaffMember {
    id: string;
    email: string;
    name: string;
    role: "admin" | "manager" | "editor";
    permissions: string[];
    createdAt: Date;
}

export async function getStaffMembers(): Promise<StaffMember[]> {
    try {
        const snapshot = await getAdminDb().collection("staff").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as StaffMember[];
    } catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
}

// Get staff role by email
export async function getStaffRole(email: string): Promise<string | null> {
    try {


        const snapshot = await getAdminDb().collection("staff").where("email", "==", email).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // Capitalize first letter for consistency (admin -> Admin)
            return data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff";
        }
        return null;
    } catch (error) {
        console.error("Error fetching staff role:", error);
        return null;
    }
}

// ==================== CATEGORIES ====================

export interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    order: number;
    createdAt: Date;
}

export async function getCategories(): Promise<Category[]> {
    const cache = getSearchCache();
    const cacheKey = CacheKeys.categories();

    // Check cache first
    const cached = cache.get<Category[]>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const snapshot = await getAdminDb().collection("categories").orderBy("order", "asc").get();
        const categories = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Category[];

        // Cache for 5 minutes
        cache.set(cacheKey, categories);
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// ==================== PRODUCTS ====================

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    categoryId: string;
    subcategoryId?: string;
    imageUrl: string;
    images: string[];
    available: boolean;
    featured: boolean;
    offerId?: string;
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt?: Date;
}

export async function getProducts(
    categoryId?: string,
    available?: boolean,
    limitCount: number = 50,
    startAfterId?: string
): Promise<Product[]> {
    const cache = getSearchCache();

    // For simple queries (all products, no filters, no pagination), use cache
    const canUseCache = !startAfterId && !categoryId && available === undefined && limitCount >= 50;
    if (canUseCache) {
        const cacheKey = CacheKeys.allProducts();
        const cached = cache.get<Product[]>(cacheKey);
        if (cached) {
            return cached;
        }
    }

    try {
        let query: admin.firestore.Query = getAdminDb().collection("products");

        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }

        if (available !== undefined) {
            query = query.where("available", "==", available);
        }

        query = query.orderBy("createdAt", "desc");

        if (startAfterId) {
            const startAfterDoc = await getAdminDb().collection("products").doc(startAfterId).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }

        const snapshot = await query.limit(limitCount).get();
        const products = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
            updatedAt: (doc.data().updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
        })) as Product[];

        // Cache if this was a cacheable query
        if (canUseCache) {
            cache.set(CacheKeys.allProducts(), products);
        }

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function searchProducts(
    searchQuery: string,
    categoryId?: string,
    subcategoryId?: string
): Promise<Product[]> {
    // Get all products (uses cache) and filter available ones in-memory
    const allProducts = await getProducts();

    const searchLower = searchQuery.toLowerCase().trim();

    // Filter to available products first
    let filtered = allProducts.filter(p => p.available);

    // Text search filter
    if (searchLower) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
    }

    // Category filter
    if (categoryId) {
        filtered = filtered.filter(p =>
            p.categoryId === categoryId || p.subcategoryId === categoryId
        );
    }

    // Subcategory filter
    if (subcategoryId) {
        filtered = filtered.filter(p => p.subcategoryId === subcategoryId);
    }

    return filtered;
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const doc = await getAdminDb().collection("products").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: (data?.createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
                updatedAt: (data?.updatedAt as admin.firestore.Timestamp)?.toDate() || undefined,
            } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// ==================== REVIEWS ====================

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export async function getReviews(productId: string): Promise<Review[]> {
    try {
        const snapshot = await getAdminDb()
            .collection("reviews")
            .where("productId", "==", productId)
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Review[];
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export async function getAllReviews(): Promise<(Review & { productName?: string })[]> {
    try {
        const snapshot = await getAdminDb().collection("reviews").orderBy("createdAt", "desc").limit(50).get();

        return snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate() || new Date(),
        })) as Review[];
    } catch (error) {
        console.error("Error fetching all reviews:", error);
        return [];
    }
}
