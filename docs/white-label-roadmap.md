# White-Label Implementation Roadmap

**Objective:** Transform the application into a tenant-agnostic platform.

## Phase 1: Configuration & Environment (Day 1)
Goal: Externalize all environment-specific settings.

1.  **Environment Variables**:
    -   Create `.env.local` template with:
        -   `NEXT_PUBLIC_SITE_URL`: Full URL of the deployed site (e.g., `https://mystore.com`).
        -   `NEXT_PUBLIC_ADMIN_EMAIL`: The email that grants super-admin access.
        -   `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.: Standard Firebase config.
2.  **Admin Access**:
    -   Update `src/app/actions.ts` to use `process.env.ADMIN_EMAIL` instead of hardcoded string.

## Phase 2: Metadata & SEO (Day 1-2)
Goal: Ensure search engines and social shares reflect the tenant's brand.

1.  **Dynamic Metadata (`layout.tsx`)**:
    -   Replace static `export const metadata` with `generateMetadata()`.
    -   Fetch `SiteConfig` to populate Title, Description, OpenGraph images.
2.  **Manifest & Terminology**:
    -   Update `manifest.ts` to be dynamic, pulling "Short Name" and "Theme Color" from config.
    -   Update `sitemap.ts` and `robots.ts` to use `NEXT_PUBLIC_SITE_URL`.

## Phase 3: UI Component Cleanup (Day 2)
Goal: Remove all visual traces of "Smart Avenue" from the interface.

1.  **Hero Section (`Hero.tsx`)**:
    -   Bind the "Smart Avenue 99" badge to `{config.branding.siteName}`.
2.  **PWA Install Prompt (`PwaInstallPrompt.tsx`)**:
    -   Update install text to use dynamic site name.
3.  **Header & Footer**:
    -   Ensure Logo `alt` tags and fallback text use config values.

## Phase 4: Content Management (Day 3+)
Goal: Allow legal and informational pages to be edited without code.

1.  **Legal Pages**:
    -   Refactor `src/app/terms/page.tsx` and `privacy/page.tsx`.
    -   **Option A (Fast)**: Replace static text with `{config.branding.siteName}` and `{config.contact.address}`.
    -   **Option B (Robust)**: Create a new Firestore collection `pages` and fetch content by slug (e.g., `/terms`), allowing admins to write their own terms in the CMS.

## Success Criteria
-   [ ] No "Smart Avenue" string exists in the codebase (except in default config/mocks).
-   [ ] Changing `NEXT_PUBLIC_SITE_URL` and `SiteConfig` completely deploys a distinct brand.
-   [ ] SEO tags match the configured tenant.
