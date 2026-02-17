
import { MetadataRoute } from 'next';
import { getSiteConfig } from "@/app/actions/site-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const config = await getSiteConfig();
    const manifest = config.manifest;

    return {
        name: manifest.name || process.env.NEXT_PUBLIC_BRAND_NAME || 'My Store',
        short_name: manifest.shortName || process.env.NEXT_PUBLIC_BRAND_NAME || 'My Store',
        description: manifest.description || `${process.env.NEXT_PUBLIC_BRAND_NAME || 'My Store'} is a one-stop departmental store.`,
        start_url: manifest.startUrl || '/',
        display: manifest.display || 'standalone',
        background_color: manifest.backgroundColor || '#ffffff',
        theme_color: manifest.themeColor || '#0284c7',
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
