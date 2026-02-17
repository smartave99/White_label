const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env.local');
const exampleEnvPath = path.join(__dirname, '..', '.env.example');

console.log('\n🎨  White Label Platform - Brand Setup  🎨\n');

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function setup() {
    // 1. Check for existing .env.local
    let envContent = '';
    if (fs.existsSync(envPath)) {
        console.log('Found existing .env.local configuration.');
        envContent = fs.readFileSync(envPath, 'utf8');
    } else if (fs.existsSync(exampleEnvPath)) {
        console.log('Creating .env.local from .env.example...');
        envContent = fs.readFileSync(exampleEnvPath, 'utf8');
    } else {
        console.error('Error: .env.example not found!');
        process.exit(1);
    }

    // 2. Ask for Brand Details
    console.log('Please enter your brand details (press Enter to keep existing/default):');

    const brandName = await askQuestion('Brand Name: ');
    const brandTagline = await askQuestion('Brand Tagline: ');
    const siteUrl = await askQuestion('Site URL (e.g., https://mystore.com): ');

    // 3. Update Content
    let newEnvContent = envContent;

    if (brandName) {
        newEnvContent = updateEnvVariable(newEnvContent, 'NEXT_PUBLIC_BRAND_NAME', brandName);
    }
    if (brandTagline) {
        newEnvContent = updateEnvVariable(newEnvContent, 'NEXT_PUBLIC_BRAND_TAGLINE', brandTagline);
    }
    if (siteUrl) {
        newEnvContent = updateEnvVariable(newEnvContent, 'NEXT_PUBLIC_SITE_URL', siteUrl);
    }

    // 4. Write File
    fs.writeFileSync(envPath, newEnvContent);

    console.log('\n✅  Configuration updated successfully!');
    console.log(`    File: ${envPath}\n`);

    rl.close();
}

function updateEnvVariable(content, key, value) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
        return content.replace(regex, `${key}="${value}"`);
    } else {
        return content + `\n${key}="${value}"`;
    }
}

setup();
