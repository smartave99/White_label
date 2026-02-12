import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getDepartments } from '../src/app/actions';

async function checkDepartments() {
    console.log("Fetching departments...");
    const depts = await getDepartments();
    console.log(`Found ${depts.length} departments in DB.`);
    console.log(JSON.stringify(depts, null, 2));
}

checkDepartments().catch(console.error);
