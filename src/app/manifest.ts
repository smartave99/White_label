
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Smart Avnue',
        short_name: 'Smart Avnue',
        description: 'We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0284c7', // brand-blue
        icons: [
            {
                src: '/logo.png?v=2',
                sizes: 'any',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon.png?v=2',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/apple-icon.png?v=2',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
