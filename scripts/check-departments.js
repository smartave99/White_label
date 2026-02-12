"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env.local') });
const actions_1 = require("../src/app/actions");
async function checkDepartments() {
    console.log("Fetching departments...");
    const depts = await (0, actions_1.getDepartments)();
    console.log(`Found ${depts.length} departments in DB.`);
    console.log(JSON.stringify(depts, null, 2));
}
checkDepartments().catch(console.error);
