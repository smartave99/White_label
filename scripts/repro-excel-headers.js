
const XLSX = require('xlsx');

function testExcelParsing() {
    console.log("Creating a mock Excel file with lowercase headers...");

    // 1. Create a worksheet with LOWERCASE headers
    const ws_data = [
        ["name", "price", "description"], // headers
        ["Test Product", 100, "A test product"] // data
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(ws);

    console.log("Parsed rows (lowercase headers):");
    console.log(JSON.stringify(rows, null, 2));

    // 2. Simulate the logic in product-import.ts
    // The code expects "Name", "Price" (Capitalized)
    const row = rows[0];

    console.log("\nChecking for 'Name' and 'Price' (Case Sensitive check):");
    if (!row.Name || !row.Price) {
        console.warn(`[FAIL] Row skipped because row.Name or row.Price is missing.`);
        console.warn(`       Expected 'Name', 'Price' but found keys: ${Object.keys(row).join(', ')}`);
    } else {
        console.log("[SUCCESS] Row accepted.");
    }

    // 3. Verification with correct headers
    console.log("\n---------------------------------------------------");
    console.log("Creating a mock Excel file with CORRECT headers...");
    const ws_data_correct = [
        ["Name", "Price", "Description"], // headers
        ["Test Product Correct", 200, "A correct test product"] // data
    ];
    const ws_correct = XLSX.utils.aoa_to_sheet(ws_data_correct);
    const rows_correct = XLSX.utils.sheet_to_json(ws_correct);
    const row_correct = rows_correct[0];

    console.log("Parsed rows (correct headers):");
    console.log(JSON.stringify(rows_correct, null, 2));

    if (!row_correct.Name || !row_correct.Price) {
        console.warn(`[FAIL] Row skipped.`);
    } else {
        console.log("[SUCCESS] Row accepted.");
    }
}

try {
    testExcelParsing();
} catch (e) {
    console.error("Error running test:", e);
}
