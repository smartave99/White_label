"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

// Type definition for Excel row
// Type definition for Excel row
interface ProductRow {
    [key: string]: unknown; // Allow flexible keys for initial parsing
}

export async function importProductsFromExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const buffer = await file.arrayBuffer();

        // Dynamically import xlsx
        const XLSX = await import('xlsx');

        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as ProductRow[];

        if (!rows || rows.length === 0) {
            return { success: false, error: "Excel file is empty" };
        }

        const db = getAdminDb();
        let batch = db.batch();
        let operationCount = 0;
        const BATCH_SIZE = 450;

        // Fetch Categories & Offers for mapping
        const [categoriesSnap, offersSnap] = await Promise.all([
            db.collection("categories").get(),
            db.collection("offers").get()
        ]);

        const categoryMap = new Map<string, string>(); // Name(lowercase) -> ID
        const offerMap = new Map<string, string>(); // Title(lowercase) -> ID

        categoriesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.name) categoryMap.set(data.name.toLowerCase(), doc.id);
            categoryMap.set(doc.id, doc.id);
        });

        offersSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.title) offerMap.set(data.title.toLowerCase(), doc.id);
            offerMap.set(doc.id, doc.id);
        });

        let totalImported = 0;

        for (const rawRow of rows) {
            // Normalize keys to lowercase
            const row: Record<string, unknown> = {};
            Object.keys(rawRow).forEach(key => {
                row[key.trim().toLowerCase()] = rawRow[key];
            });

            // Extract fields using normalized keys
            const Name = row['name'];
            const Price = row['price'];

            // Skip invalid rows
            if (!Name || !Price) {
                // Optional: log or track skipped rows
                continue;
            }

            // Other fields
            const Category = row['category'];
            const Subcategory = row['subcategory'];
            const OfferTitle = row['offertitle'];
            const Description = row['description'];
            const OriginalPrice = row['originalprice'];
            const ImageUrl = row['imageurl'];
            const Available = row['available'];
            const Featured = row['featured'];
            const Tags = row['tags'];

            // Resolve Category
            let categoryId = "";
            let subcategoryId = "";

            if (Category) {
                const catKey = String(Category).trim().toLowerCase();
                if (categoryMap.has(catKey)) {
                    categoryId = categoryMap.get(catKey)!;
                }
            }

            if (Subcategory) {
                const subKey = String(Subcategory).trim().toLowerCase();
                if (categoryMap.has(subKey)) {
                    subcategoryId = categoryMap.get(subKey)!;
                }
            }

            // Resolve Offer
            let offerId = "";
            if (OfferTitle) {
                const offerKey = String(OfferTitle).trim().toLowerCase();
                if (offerMap.has(offerKey)) {
                    offerId = offerMap.get(offerKey)!;
                }
            }

            // Resolve Product ID (Update vs Create)
            const existingProductSnap = await db.collection("products").where("name", "==", Name).limit(1).get();

            let productRef: admin.firestore.DocumentReference;
            const isUpdate = !existingProductSnap.empty;

            if (isUpdate) {
                productRef = existingProductSnap.docs[0].ref;
            } else {
                productRef = db.collection("products").doc();
            }

            const productData: Record<string, unknown> = {
                name: Name,
                price: Number(Price),
                categoryId: categoryId || "",
                available: Available === true || String(Available).toLowerCase() === "true",
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Only add optional fields if they exist in Excel OR if it's a new product
            // If it's an update, we DON'T want to overwrite existing data with empty strings/nulls
            // unless the Excel file explicitly has an empty column (which we can't easily distinguish from "missing column" without more complex logic,
            // but for now, the user request "previous product details... got removed" implies we should safeguard existing data).

            if (Description || !isUpdate) productData.description = Description || "";
            if (OriginalPrice || !isUpdate) productData.originalPrice = OriginalPrice ? Number(OriginalPrice) : null;
            if (subcategoryId || !isUpdate) productData.subcategoryId = subcategoryId || null;

            // Image logic: 
            // 1. If ImageUrl is provided in Excel, use it.
            // 2. If NOT provided, and it's an update, LEAVE EXISTING IMAGES ALONE.
            // 3. If new product, default to empty.
            if (ImageUrl) {
                productData.imageUrl = ImageUrl;
                productData.images = [ImageUrl];
            } else if (!isUpdate) {
                productData.imageUrl = "";
                productData.images = [];
            }

            if (Featured !== undefined || !isUpdate) productData.featured = Featured === true || String(Featured).toLowerCase() === "true";
            if (offerId || !isUpdate) productData.offerId = offerId || null;
            if (Tags || !isUpdate) productData.tags = Tags ? String(Tags).split(',').map((s: string) => s.trim()) : [];

            if (!isUpdate) {
                productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                productData.reviewCount = 0;
                productData.averageRating = 0;
            }

            // Add to batch
            if (isUpdate) {
                batch.update(productRef, productData as Partial<admin.firestore.DocumentData>);
            } else {
                batch.set(productRef, productData);
            }

            operationCount++;
            totalImported++;

            if (operationCount >= BATCH_SIZE) {
                await batch.commit();
                batch = db.batch();
                operationCount = 0;
            }
        }

        if (operationCount > 0) {
            await batch.commit();
        }

        revalidatePath("/products");
        revalidatePath("/admin/content/products");

        // Clear cache
        try {
            const { getSearchCache } = await import("@/lib/search-cache");
            getSearchCache().clearPrefix("products");
            getSearchCache().clearPrefix("query");
        } catch {
            // ignore cache errors
        }

        if (totalImported === 0) {
            return { success: false, error: "No valid products found. Ensure columns 'Name' and 'Price' exist." };
        }

        return { success: true, count: totalImported };

    } catch (error: unknown) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown import error" };
    }
}
