
import * as XLSX from 'xlsx';

function testExcelParsing() {
    console.log("Creating a mock Excel file with lowercase headers...");

    // 1. Create a worksheet with LOWERCASE headers
    const ws_data = [
        ["name", "price", "description"], // headers
        ["Test Product", 100, "A test product"] // data
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // 2. Read it back as if it were uploaded
    // In the real app: const rows = XLSX.utils.sheet_to_json(sheet) as ProductRow[];
    const rows = XLSX.utils.sheet_to_json(ws);

    console.log("Parsed rows:", JSON.stringify(rows, null, 2));

    // 3. Simulate the logic in product-import.ts
    // The code expects "Name", "Price" (Capitalized)
    const row = rows[0] as any;

    console.log("\nChecking for 'Name' and 'Price' (Case Sensitive check as in current code):");
    if (!row.Name || !row.Price) {
        console.warn(`[FAIL] Row skipped because row.Name or row.Price is missing. Found: ${JSON.stringify(row)}`);
    } else {
        console.log("[SUCCESS] Row accepted.");
    }

    // 4. Verification with correct headers
    console.log("\n---------------------------------------------------");
    console.log("Creating a mock Excel file with CORRECT headers...");
    const ws_data_correct = [
        ["Name", "Price", "Description"], // headers
        ["Test Product Correct", 200, "A correct test product"] // data
    ];
    const ws_correct = XLSX.utils.aoa_to_sheet(ws_data_correct);
    const rows_correct = XLSX.utils.sheet_to_json(ws_correct);
    const row_correct = rows_correct[0] as any;

    console.log("Parsed rows (correct):", JSON.stringify(rows_correct, null, 2));

    if (!row_correct.Name || !row_correct.Price) {
        console.warn(`[FAIL] Row skipped.`);
    } else {
        console.log("[SUCCESS] Row accepted.");
    }

}

testExcelParsing();
