
import { MetadataRoute } from 'next';
import { getSiteConfig } from "@/app/actions/site-config";
import { DEFAULT_SITE_CONFIG } from "@/types/site-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const config = await getSiteConfig();
    const manifest = config.manifest;

    return {
        name: manifest.name || process.env.NEXT_PUBLIC_BRAND_NAME || DEFAULT_SITE_CONFIG.branding.siteName,
        short_name: manifest.shortName || process.env.NEXT_PUBLIC_BRAND_NAME || DEFAULT_SITE_CONFIG.branding.siteName,
        description: manifest.description || `${process.env.NEXT_PUBLIC_BRAND_NAME || DEFAULT_SITE_CONFIG.branding.siteName}: ${DEFAULT_SITE_CONFIG.branding.tagline}`,
        start_url: manifest.startUrl || '/',
        display: manifest.display || 'standalone',
        background_color: manifest.backgroundColor || DEFAULT_SITE_CONFIG.theme.backgroundColor,
        theme_color: manifest.themeColor || DEFAULT_SITE_CONFIG.theme.primaryColor,
        icons: [
            {
                src: config.branding.logoUrl || '/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: config.branding.logoUrl || '/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
