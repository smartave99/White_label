# Deployment & Run Guide

This guide provides instructions on how to run the Smart Avenue project locally and deploy it to Vercel.

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL database
- Firebase Project (for Auth and Firestore)
- Cloudinary Account (for media)
- Groq or Gemini API keys (for AI)

### 2. Setup
```bash
# Install dependencies
npm install

# Setup environment variables
# Copy .env.example to .env.local and fill in the keys
cp .env.example .env.local

# Initialize Prisma
npx prisma generate
npx prisma db push # or use migrations if available
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Deployment (Vercel)

### 1. Vercel Configuration
The project is optimized for deployment on **Vercel**. Ensure you have the following Environment Variables set in the Vercel Dashboard:

#### AI & Media
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GROQ_API_KEY_1` (up to 10)
- `GEMINI_API_KEY_1` (fallback)

#### Database
- `DATABASE_URL` (Use a cloud PostgreSQL provider like Supabase, Neon, or Railway)

#### Firebase
- `NEXT_PUBLIC_FIREBASE_*` (All client-side keys)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Admin SDK)

### 2. Deployment Steps
1. Connect your repository to Vercel.
2. Add all environment variables listed in `.env.local`.
3. Vercel will automatically detect Next.js and run `npm run build`.

---

## ⚡ Efficiency Tips
- **AI Performance**: Ensure at least one `GROQ_API_KEY` is provided for the fastest response times.
- **Media Optimization**: Always use the `CloudinaryUpload` component for product images to leverage CDN caching.
- **Db Connection**: Use a pooled connection string for `DATABASE_URL` to prevent exhaustion of database connections on serverless functions.
