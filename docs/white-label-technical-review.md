# White-Label Technical Review & Findings

**Date:** 2026-02-14
**Scope:** `smart_avenue` Codebase

## Executive Summary
This document outlines the technical barriers to making the `smart_avenue` platform fully white-label. While the system has a strong foundation with `SiteConfig`, several hardcoded artifacts remain that tie the codebase to "Smart Avenue 99". Code changes are required to fully decouple branding from logic.

## 1. Hardcoded Branding Instances
The following files contain direct references to "Smart Avenue" or specific URLs that must be parameterized.

### Frontend Components
-   **`src/components/Hero.tsx`**:
    -   Line 69: Hardcoded `<span>Smart Avenue 99</span>` in the hero badge.
    -   *Fix:* Replace with `{config.branding.siteName}`.
-   **`src/components/PwaInstallPrompt.tsx`**:
    -   Line 92: Hardcoded text "Install Smart Avenue 99 for a faster, better experience."
    -   *Fix:* Replace with `Install ${config.branding.siteName}...`.
-   **`src/components/Header.tsx`**:
    -   Line 67: Generic alt text fallback "Smart Avenue".
    -   *Fix:* Ensure `config.branding.siteName` is always available or use a generic "Store Logo" fallback.

### Content Pages
-   **`src/app/terms/page.tsx`**:
    -   Lines 22, 43: Hardcoded "Smart Avenue" in legal text.
    -   Line 50: Hardcoded jurisdiction "Patna, Bihar".
    -   *Fix:* These pages should either use dynamic replacements OR be converted to CMS-managed content.
-   **`src/app/privacy/page.tsx`**:
    -   Likely contains similar hardcoded entity names.

### Metadata & Configuration
-   **`src/app/layout.tsx`**:
    -   Lines 18-65: Hardcoded `metadata` export with specific titles, descriptions, keywords, OpenGraph images, and JSON-LD schema.
    -   *Fix:* Switch to `generateMetadata()` function that pulls from `SiteConfig`.
-   **`src/app/manifest.ts`**:
    -   Lines 6-12: Static manifest with "Smart Avenue 99" name and specific theme colors.
    -   *Fix:* Convert to async function and pull from `SiteConfig`.
-   **`src/app/sitemap.ts` & `src/app/robots.ts`**:
    -   Use hardcoded base URL `https://smartavenue99.com`.
    -   *Fix:* Use `process.env.NEXT_PUBLIC_SITE_URL`.

## 2. Backend & Logic Check
-   **`src/app/actions.ts`**:
    -   Line 345: Hardcoded logic `if (email === "admin@smartavenue99.com")` for super-admin privileges.
    -   *Fix:* Move specific email to environment variable `ADMIN_EMAIL`.

## 3. Environment Dependencies
To achieve true white-label capability, the inspection revealed reliance on specific environment setups that need to be generalized.
-   **Authentication**: Relies on Firebase Auth. New tenants need their own Firebase project or a multi-tenant auth architecture.
-   **Database**: Currently single Firestore instance.

## 4. Recommendations
1.  **Immediate**: Replace all UI strings with `SiteConfig` values.
2.  **Short-term**: Implement `generateMetadata` and Environment Variables for URLs/Admin.
3.  **Long-term**: Move "Terms" and "Privacy" content to the database/CMS so they can be edited per tenant without code redeployment.
