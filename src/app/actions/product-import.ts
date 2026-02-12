"use server";

import { getAdminDb, admin } from "@/lib/firebase-admin"; // Requires backend admin logic
import { revalidatePath } from "next/cache";
// import * as XLSX from 'xlsx'; // Need dynamic import or usage
import { getSearchCache, CacheKeys } from "@/lib/search-cache";

// Type definition for Excel row
interface ProductRow {
    Name: string;
    Description?: string;
    Price: number;
    OriginalPrice?: number;
    Discount?: number;
    Category?: string;
    Subcategory?: string;
    ImageUrl?: string;
    Available?: boolean | string;
    Featured?: boolean | string;
    Tags?: string;
    OfferTitle?: string;
}

// Since XLSX is a CommonJS module, dynamic import is usually safer server side
export async function importProductsFromExcel(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        const buffer = await file.arrayBuffer();

        // Dynamically import xlsx or use require if permitted by next config
        const XLSX = require('xlsx');

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

        for (const row of rows) {
            // Skip invalid rows
            if (!row.Name || !row.Price) {
                console.warn(`Skipping row due to missing Name or Price: ${JSON.stringify(row)}`);
                continue;
            }

            // Resolve Category
            let categoryId = "";
            let subcategoryId = "";

            if (row.Category) {
                const catKey = String(row.Category).trim().toLowerCase();
                if (categoryMap.has(catKey)) {
                    categoryId = categoryMap.get(catKey)!;
                } else {
                    // Fallback: Create category logic could be here, but simpler to just skip or assign default
                    console.warn(`Category '${row.Category}' not found.`);
                }
            }

            if (row.Subcategory) {
                const subKey = String(row.Subcategory).trim().toLowerCase();
                if (categoryMap.has(subKey)) {
                    subcategoryId = categoryMap.get(subKey)!;
                }
            }

            // Resolve Offer
            let offerId = "";
            if (row.OfferTitle) {
                const offerKey = String(row.OfferTitle).trim().toLowerCase();
                if (offerMap.has(offerKey)) {
                    offerId = offerMap.get(offerKey)!;
                }
            }

            // Resolve Product ID (Update vs Create)
            // Query by Name to find existing product
            const existingProductSnap = await db.collection("products").where("name", "==", row.Name).limit(1).get();

            let productRef: admin.firestore.DocumentReference;
            const isUpdate = !existingProductSnap.empty;

            if (isUpdate) {
                productRef = existingProductSnap.docs[0].ref;
            } else {
                productRef = db.collection("products").doc();
            }

            const productData: any = {
                name: row.Name,
                description: row.Description || "",
                price: Number(row.Price),
                originalPrice: row.OriginalPrice ? Number(row.OriginalPrice) : null,
                categoryId: categoryId || "", // Empty if not found
                subcategoryId: subcategoryId || null,
                imageUrl: row.ImageUrl || "",
                images: row.ImageUrl ? [row.ImageUrl] : [],
                available: row.Available === true || String(row.Available).toLowerCase() === "true",
                featured: row.Featured === true || String(row.Featured).toLowerCase() === "true",
                offerId: offerId || null,
                tags: row.Tags ? String(row.Tags).split(',').map(s => s.trim()) : [],
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (!isUpdate) {
                productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                productData.reviewCount = 0;
                productData.averageRating = 0;
            }

            // Add to batch
            if (isUpdate) {
                batch.update(productRef, productData);
            } else {
                batch.set(productRef, productData);
            }

            operationCount++;

            if (operationCount >= BATCH_SIZE) {
                await batch.commit();
                batch = db.batch(); // Reset batch
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
            getSearchCache().clearPrefix("products");
            getSearchCache().clearPrefix("query");
        } catch (e) {
            // ignore cache errors
        }

        return { success: true, count: rows.length };

    } catch (error: unknown) {
        // console.error("Import Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown import error" };
    }
}
