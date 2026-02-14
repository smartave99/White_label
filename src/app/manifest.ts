
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Smart Avenue 99',
        short_name: 'Smart Avenue 99',
        description: 'Smart Avenue 99 is a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0284c7', // brand-blue
        icons: [
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
