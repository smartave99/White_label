# White-Label Platform Deployment Guide

**For Non-Technical Users**

This guide will help you launch your own version of the store platform. You do not need to write code, but you will need to set up a few services.

## Prerequisites
Before you begin, ensure you have accounts for:
1.  **GitHub** (To host the code): [Sign up](https://github.com)
2.  **Vercel** (To host the website): [Sign up](https://vercel.com)
3.  **Firebase** (For database & authentication): [Sign up](https://firebase.google.com)

---

## Step 1: Get the Code
1.  Go to the **Smart Avenue Repository** on GitHub (ask developer for link).
2.  Click the **"Fork"** button in the top right. This creates your own copy of the code.

## Step 2: Set up the Database (Firebase)
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give it a name (e.g., "My Store").
3.  Disable Google Analytics (optional, simplifies setup).
4.  **Create Web App**:
    -   Click the **Web icon (</>)** on the dashboard.
    -   Register app (e.g., "My Store Web").
    -   **Copy the configuration** (apiKey, authDomain, projectId, etc.). Save this for Step 4.
5.  **Enable Authentication**:
    -   Go to **Build > Authentication**.
    -   Click "Get Started".
    -   Enable **Google** and **Email/Password** providers.
6.  **create Firestore Database**:
    -   Go to **Build > Firestore Database**.
    -   Click "Create Database".
    -   Start in **Production Mode**.
    -   Choose a location near your customers (e.g., `asia-south1` for India).

## Step 3: Configure Storage Rules
1.  Go to **Build > Storage**.
2.  Click "Get Started" and create a bucket.
3.  Go to the **Rules** tab and paste the provided security rules (ask developer for `storage.rules` file content if not provided).

## Step 4: Deploy to Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** > **Project**.
3.  Select your **Forked Repository** (from Step 1) and click **Import**.
4.  **Configure Environment Variables**:
    -   Expand the **"Environment Variables"** section.
    -   Add the keys found in your Firebase Config (from Step 2) and others:

    | Key | Value (Example) |
    | :--- | :--- |
    | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` (from Firebase) |
    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` |
    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456...` |
    | `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:12345...` |
    | `NEXT_PUBLIC_SITE_URL` | `https://your-store-domain.com` |
    | `NEXT_PUBLIC_ADMIN_EMAIL` | `your-email@gmail.com` (Grants you admin access) |

5.  Click **"Deploy"**.

## Step 5: Connect Your Domain
1.  Once deployment is complete (confetti verification!), go to the project **Settings > Domains** on Vercel.
2.  Enter your custom domain (e.g., `www.mystore.com`).
3.  Vercel will give you DNS value (Backend validation). Login to your domain provider (GoDaddy, Namecheap) and add the **CNAME** or **A Record** as instructed.

## Step 6: Initial Setup
1.  Visit your new website URL.
2.  Log in using the email you set as `NEXT_PUBLIC_ADMIN_EMAIL`.
3.  You should now see the **Admin Dashboard**.
4.  Go to **Settings/Configuration** to upload your Logo, set Colors, and change the Site Name.

🎉 **Your White-Label Store is Live!**
