
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Smart Avnue',
        short_name: 'Smart Avnue',
        description: 'We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f59e0b',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
