"use server";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOffer = createOffer;
exports.getOffers = getOffers;
exports.deleteOffer = deleteOffer;
exports.getDashboardStats = getDashboardStats;
exports.testFirebaseConnection = testFirebaseConnection;
exports.getSiteContent = getSiteContent;
exports.updateSiteContent = updateSiteContent;
exports.getDepartments = getDepartments;
exports.updateDepartments = updateDepartments;
exports.getStaffMembers = getStaffMembers;
exports.createStaffMember = createStaffMember;
exports.updateStaffMember = updateStaffMember;
exports.deleteStaffMember = deleteStaffMember;
exports.getStaffRole = getStaffRole;
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getProducts = getProducts;
exports.searchProducts = searchProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.toggleProductAvailability = toggleProductAvailability;
exports.addReview = addReview;
exports.getReviews = getReviews;
exports.deleteReview = deleteReview;
exports.getAllReviews = getAllReviews;
// Force re-compile
const firebase_admin_1 = require("@/lib/firebase-admin");
const search_cache_1 = require("@/lib/search-cache");
const cache_1 = require("next/cache");
async function createOffer(title, discount, description) {
    try {
        const docRef = await (0, firebase_admin_1.getAdminDb)().collection("offers").add({
            title,
            discount,
            description,
            createdAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/offers");
        (0, cache_1.revalidatePath)("/admin/content/offers");
        (0, cache_1.revalidatePath)("/admin"); // For dashboard stats matches
        return { success: true, id: docRef.id };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
async function getOffers() {
    try {
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("offers").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
    }
    catch (error) {
        console.error("Error fetching offers:", error);
        return [];
    }
}
async function deleteOffer(id) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("offers").doc(id).delete();
        (0, cache_1.revalidatePath)("/offers");
        (0, cache_1.revalidatePath)("/admin/content/offers");
        (0, cache_1.revalidatePath)("/admin");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
// ==================== DASHBOARD STATS ====================
async function getDashboardStats() {
    try {
        const db = (0, firebase_admin_1.getAdminDb)();
        const [offersSnap, productsSnap, categoriesSnap] = await Promise.all([
            db.collection("offers").get(),
            db.collection("products").get(),
            db.collection("categories").get(),
        ]);
        return {
            offersCount: offersSnap.size,
            productsCount: productsSnap.size,
            categoriesCount: categoriesSnap.size,
        };
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { offersCount: 0, productsCount: 0, categoriesCount: 0 };
    }
}
// ==================== TEST CONNECTION ====================
async function testFirebaseConnection() {
    try {
        const snapshot = await (0, firebase_admin_1.getAdminDb)().listCollections();
        console.log("Successfully connected to Firebase!");
        return {
            success: true,
            message: "Connected to Firebase!",
            collections: snapshot.map((col) => col.id)
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Firebase Connection Error:", errorMessage);
        return {
            success: false,
            message: "Failed to connect to Firebase. Check your .env.local file.",
            error: errorMessage
        };
    }
}
// Get site content by section
async function getSiteContent(section) {
    try {
        const doc = await (0, firebase_admin_1.getAdminDb)().collection("siteContent").doc(section).get();
        if (doc.exists) {
            const data = doc.data();
            // detailed generic serialization for common timestamp fields
            return {
                ...data,
                createdAt: data?.createdAt?.toDate() || undefined,
                updatedAt: data?.updatedAt?.toDate() || undefined,
            };
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching ${section} content:`, error);
        return null;
    }
}
// Update site content by section
async function updateSiteContent(section, data) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("siteContent").doc(section).set({
            ...data,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        (0, cache_1.revalidatePath)("/", "layout"); // Revalidate everything as site content (like contact info) can be global
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
// Get all departments
async function getDepartments() {
    try {
        const doc = await (0, firebase_admin_1.getAdminDb)().collection("siteContent").doc("departments").get();
        if (doc.exists) {
            return doc.data()?.items || [];
        }
        return [];
    }
    catch (error) {
        console.error("Error fetching departments:", error);
        return [];
    }
}
// Update departments
async function updateDepartments(departments) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("siteContent").doc("departments").set({
            items: departments,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/"); // Departments are usually on home page
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
async function getStaffMembers() {
    try {
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("staff").orderBy("createdAt", "desc").get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
    }
    catch (error) {
        console.error("Error fetching staff:", error);
        return [];
    }
}
async function createStaffMember(email, name, role, permissions) {
    try {
        const docRef = await (0, firebase_admin_1.getAdminDb)().collection("staff").add({
            email,
            name,
            role,
            permissions,
            createdAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/admin/staff");
        return { success: true, id: docRef.id };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
async function updateStaffMember(id, data) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("staff").doc(id).update({
            ...data,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/admin/staff");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
async function deleteStaffMember(id) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("staff").doc(id).delete();
        (0, cache_1.revalidatePath)("/admin/staff");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
// Get staff role by email
async function getStaffRole(email) {
    try {
        // Hardcoded super admin
        if (email === "admin@smartavenue99.com")
            return "Admin";
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("staff").where("email", "==", email).limit(1).get();
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // Capitalize first letter for consistency (admin -> Admin)
            return data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "Staff";
        }
        return null;
    }
    catch (error) {
        console.error("Error fetching staff role:", error);
        return null;
    }
}
async function getCategories() {
    const cache = (0, search_cache_1.getSearchCache)();
    const cacheKey = search_cache_1.CacheKeys.categories();
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }
    try {
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("categories").orderBy("order", "asc").get();
        const categories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        // Cache for 5 minutes
        cache.set(cacheKey, categories);
        return categories;
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
async function createCategory(name, parentId = null) {
    try {
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("categories").get();
        const order = snapshot.size;
        const docRef = await (0, firebase_admin_1.getAdminDb)().collection("categories").add({
            name,
            slug,
            parentId,
            order,
            createdAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/products"); // Categories appear in product filters
        (0, cache_1.revalidatePath)("/admin/content/categories");
        return { success: true, id: docRef.id };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().delete(search_cache_1.CacheKeys.categories());
    }
}
async function updateCategory(id, data) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("categories").doc(id).update({
            ...data,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/categories");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().delete(search_cache_1.CacheKeys.categories());
    }
}
async function deleteCategory(id) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("categories").doc(id).delete();
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/categories");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().delete(search_cache_1.CacheKeys.categories());
    }
}
async function getProducts(categoryId, available, limitCount = 50, startAfterId) {
    const cache = (0, search_cache_1.getSearchCache)();
    // For simple queries (all products, no filters, no pagination), use cache
    const canUseCache = !startAfterId && !categoryId && available === undefined && limitCount >= 50;
    if (canUseCache) {
        const cacheKey = search_cache_1.CacheKeys.allProducts();
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }
    }
    try {
        let query = (0, firebase_admin_1.getAdminDb)().collection("products");
        if (categoryId) {
            query = query.where("categoryId", "==", categoryId);
        }
        // Note: Firestore requires an index for combining equality operators (==) with range/order operators (orderBy/limit)
        // creating the index is a manual step in Firebase console usually.
        // If 'available' is used effectively as a filter, we might need a composite index.
        if (available !== undefined) {
            query = query.where("available", "==", available);
        }
        query = query.orderBy("createdAt", "desc");
        if (startAfterId) {
            const startAfterDoc = await (0, firebase_admin_1.getAdminDb)().collection("products").doc(startAfterId).get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }
        const snapshot = await query.limit(limitCount).get();
        const products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || undefined,
        }));
        // Cache if this was a cacheable query
        if (canUseCache) {
            cache.set(search_cache_1.CacheKeys.allProducts(), products);
        }
        return products;
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}
/**
 * Search products by text query with in-memory filtering
 * Optimized for speed by caching products and filtering client-side
 */
async function searchProducts(searchQuery, categoryId, subcategoryId) {
    // Get all products (uses cache) and filter available ones in-memory
    const allProducts = await getProducts();
    const searchLower = searchQuery.toLowerCase().trim();
    // Filter to available products first
    let filtered = allProducts.filter(p => p.available);
    // Text search filter
    if (searchLower) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower))));
    }
    // Category filter
    if (categoryId) {
        filtered = filtered.filter(p => p.categoryId === categoryId || p.subcategoryId === categoryId);
    }
    // Subcategory filter
    if (subcategoryId) {
        filtered = filtered.filter(p => p.subcategoryId === subcategoryId);
    }
    return filtered;
}
async function getProduct(id) {
    try {
        const doc = await (0, firebase_admin_1.getAdminDb)().collection("products").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data?.createdAt?.toDate() || new Date(),
                updatedAt: data?.updatedAt?.toDate() || undefined,
            };
        }
        return null;
    }
    catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}
// ==================== REVIEWS ====================
// Add new product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createProduct(data) {
    try {
        const docRef = await (0, firebase_admin_1.getAdminDb)().collection("products").add({
            ...data,
            createdAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/");
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/products");
        return { success: true, id: docRef.id };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
        (0, search_cache_1.getSearchCache)().clearPrefix("query");
    }
}
// Update product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateProduct(id, data) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("products").doc(id).update({
            ...data,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/");
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/products");
        (0, cache_1.revalidatePath)(`/products/${id}`);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
        (0, search_cache_1.getSearchCache)().clearPrefix("query");
    }
}
// Delete product
async function deleteProduct(id) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("products").doc(id).delete();
        (0, cache_1.revalidatePath)("/");
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/products");
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
        (0, search_cache_1.getSearchCache)().clearPrefix("query");
    }
}
// Toggle product availability
async function toggleProductAvailability(id, available) {
    try {
        await (0, firebase_admin_1.getAdminDb)().collection("products").doc(id).update({
            available,
            updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        (0, cache_1.revalidatePath)("/");
        (0, cache_1.revalidatePath)("/products");
        (0, cache_1.revalidatePath)("/admin/content/products");
        (0, cache_1.revalidatePath)(`/products/${id}`);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
        (0, search_cache_1.getSearchCache)().clearPrefix("query");
    }
}
async function addReview(productId, userId, userName, rating, comment) {
    try {
        const db = (0, firebase_admin_1.getAdminDb)();
        const reviewRef = db.collection("reviews").doc();
        const productRef = db.collection("products").doc(productId);
        await db.runTransaction(async (t) => {
            const productDoc = await t.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Product not found");
            }
            const productData = productDoc.data();
            const currentCount = productData.reviewCount || 0;
            const currentRating = productData.averageRating || 0;
            const newCount = currentCount + 1;
            const newAverage = ((currentRating * currentCount) + rating) / newCount;
            t.set(reviewRef, {
                productId,
                userId,
                userName,
                rating,
                comment,
                createdAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
            });
            t.update(productRef, {
                reviewCount: newCount,
                averageRating: newAverage,
                updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
    }
}
async function getReviews(productId) {
    try {
        console.log(`[getReviews] Fetching reviews for product: ${productId}`);
        const db = (0, firebase_admin_1.getAdminDb)();
        try {
            // First attempt: with orderBy (requires index)
            const snapshot = await db
                .collection("reviews")
                .where("productId", "==", productId)
                .orderBy("createdAt", "desc")
                .get();
            console.log(`[getReviews] Found ${snapshot.size} reviews (ordered)`);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
        }
        catch (orderError) {
            console.warn(`[getReviews] Ordered query failed (possibly missing index), attempting fallback:`, orderError instanceof Error ? orderError.message : String(orderError));
            // Fallback: without orderBy
            const snapshot = await db
                .collection("reviews")
                .where("productId", "==", productId)
                .get();
            console.log(`[getReviews] Found ${snapshot.size} reviews (fallback unordered)`);
            // Sort in-memory if possible or just return as is
            const reviews = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            }));
            return reviews.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        }
    }
    catch (error) {
        console.error("[getReviews] Fatal error fetching reviews:", error);
        return [];
    }
}
async function deleteReview(reviewId, productId, rating) {
    try {
        const db = (0, firebase_admin_1.getAdminDb)();
        const reviewRef = db.collection("reviews").doc(reviewId);
        const productRef = db.collection("products").doc(productId);
        await db.runTransaction(async (t) => {
            const productDoc = await t.get(productRef);
            if (!productDoc.exists) {
                throw new Error("Product not found");
            }
            const productData = productDoc.data();
            const currentCount = productData.reviewCount || 0;
            const currentRating = productData.averageRating || 0;
            if (currentCount <= 1) {
                t.update(productRef, {
                    reviewCount: 0,
                    averageRating: 0,
                    updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            else {
                const newCount = currentCount - 1;
                // Calculate new average: (oldAvg * oldCount - ratingToRemove) / newCount
                const newAverage = ((currentRating * currentCount) - rating) / newCount;
                t.update(productRef, {
                    reviewCount: newCount,
                    averageRating: newAverage,
                    updatedAt: firebase_admin_1.admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            t.delete(reviewRef);
        });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
    finally {
        (0, search_cache_1.getSearchCache)().clearPrefix("products");
    }
}
async function getAllReviews() {
    try {
        const snapshot = await (0, firebase_admin_1.getAdminDb)().collection("reviews").orderBy("createdAt", "desc").limit(50).get();
        // To show product name, we might need to fetch products or just show ID. 
        // For efficiency, let's just return reviews and handle product name on frontend or fetch distinct products locally.
        // A better approach for admin is to fetch basic product info or map it.
        // Let's just return reviews for now.
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
    }
    catch (error) {
        console.error("Error fetching all reviews:", error);
        return [];
    }
}
