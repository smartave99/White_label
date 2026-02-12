
// mocking the ProductRow interface structure
// interface ProductRow {
//     Name: string;
//     Price: number;
//     ...
// }

function normalizeKeys(row) {
    const normalized = {};
    Object.keys(row).forEach(key => {
        // Simple normalization: lowercase and trim
        // You might want a more robust mapping if you have specific expected keys
        // For now, we'll just lowercase everything to match our target keys
        normalized[key.trim().toLowerCase()] = row[key];
    });
    return normalized;
}

function processRow(row) {
    // 1. Normalize
    // We want to support "Name", "name", "NAME" -> mapped to "Name" for the logic
    // OR we change the logic to look for "name" (lowercase).
    // Let's verify what the fix will be: currently the code looks for row.Name
    // We should probably normalize the input row to have standard keys, OR allow case-insensitive lookup.

    // Strategy: Create a proxy or just normalise to a known standard.
    // Let's normalise to PascalCase or just lowercase for internal checking? 
    // The current code uses PascalCase (Name, Price). Let's standardise the *input* to match that or change code to check lower.
    // Changing code to check lower is safer/easier. 

    // Simulation of the FIXED logic:
    const normalizedIds = {};
    Object.keys(row).forEach(k => {
        normalizedIds[k.toLowerCase()] = row[k];
    });

    const name = normalizedIds['name'];
    const price = normalizedIds['price'];

    if (!name || !price) {
        return { success: false, error: "Missing Name or Price" };
    }
    return { success: true, data: { name, price } };
}

function runTest() {
    console.log("Running Product Import Logic Test...");

    const testCases = [
        {
            name: "PascalCase Headers (Original - Working)",
            row: { "Name": "Product A", "Price": 100 },
            shouldPass: true
        },
        {
            name: "Lowercase Headers (The Issue)",
            row: { "name": "Product B", "price": 200 },
            shouldPass: true // This currently FAILS in the app, but we want it to PASS
        },
        {
            name: "Mixed Case Headers",
            row: { "NAME": "Product C", "PrIcE": 300 },
            shouldPass: true
        },
        {
            name: "Missing Price",
            row: { "Name": "Product D" },
            shouldPass: false
        }
    ];

    let passed = 0;

    testCases.forEach(test => {
        const result = processRow(test.row);
        const didPass = result.success;

        if (didPass === test.shouldPass) {
            console.log(`[PASS] ${test.name}`);
            passed++;
        } else {
            console.error(`[FAIL] ${test.name}`);
            console.error(`       Input: ${JSON.stringify(test.row)}`);
            console.error(`       Expected: ${test.shouldPass}, Got: ${didPass}`);
        }
    });

    console.log(`\nTest Result: ${passed}/${testCases.length} passed`);
}

runTest();
