export interface BrandingConfig {
    siteName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    posterUrl?: string;
    pwaScreenshotUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    searchPlaceholder?: string;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
}

export interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    learnMoreLink?: string;
    backgroundImageUrl: string;
    overlayOpacity: number;
}

export interface HeroConfig extends DeprecatedHeroConfig {
    slides: HeroSlide[];
}

export interface DeprecatedHeroConfig {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    learnMoreLink?: string;
    backgroundImageUrl?: string;
    overlayOpacity?: number;
}

export interface PromotionItem {
    id: string;
    imageUrl: string;
    title?: string;
    link?: string;
    active: boolean;
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    logoUrl?: string;
    logoPublicId?: string;
    tagline: string;
    newsletter: {
        title: string;
        description: string;
        subtext?: string;
    };
    socialSectionTitle?: string;
    socialLinks: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
    navigation: {
        shop: FooterSection;
        company: FooterSection;
    };
    bottomLinks: FooterLink[];
}

export interface PromotionsConfig {
    enabled: boolean;
    title: string;
    items: PromotionItem[];
}

export interface SystemConfig {
    maintenanceMode: boolean;
    robotsTxt: string; // Custom content for robots.txt
    sitemapXml?: string; // Optional custom sitemap URL or content
    scripts: {
        googleAnalyticsId?: string;
        facebookPixelId?: string;
        customHeadScript?: string;
        customBodyScript?: string;
    };
}

export interface ManifestConfig {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
    startUrl: string;
}

export interface FrontendLabels {
    placeholders: {
        search: string;
        email: string;
    };
    buttons: {
        subscribe: string;
        viewCollection: string;
        shopNow: string;
        search: string;
    };
    messages: {
        success: string;
        error: string;
        loading: string;
        footerConnect: string;
        footerNoSpam: string;
        copyright: string;
    }
}

export interface SeoConfig {
    siteTitle: string;
    titleTemplate: string;
    metaDescription: string;
    keywords: string[];
    ogImageUrl: string;
    twitterHandle: string;
    googleVerification: string;
    jsonLd: {
        name: string;
        url: string;
        logo: string;
        description: string;
        addressCountry: string;
        priceRange: string;
    };
}

export interface SiteConfig {
    branding: BrandingConfig;
    theme: ThemeConfig;
    hero: HeroConfig;
    promotions: PromotionsConfig;
    footer: FooterConfig;
    sections: {
        showSmartClub: boolean;
        showWeeklyOffers: boolean;
        showDepartments: boolean;
        showTestimonials: boolean;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        mapEmbedUrl: string;
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        whatsappUrl?: string;
        storeHours: string;
    };
    headerLinks?: FooterLink[];
    system: SystemConfig;
    manifest: ManifestConfig;
    labels: FrontendLabels;
    seo: SeoConfig;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    branding: {
        siteName: process.env.NEXT_PUBLIC_BRAND_NAME || "Generic Brand",
        tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Quality Products & Services",
        logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO || "/logo.svg",
        faviconUrl: process.env.NEXT_PUBLIC_BRAND_FAVICON || "/favicon.ico",
        posterUrl: "",
        pwaScreenshotUrl: "",
        instagramUrl: "",
        whatsappUrl: "",
        searchPlaceholder: "Search collections..."
    },
    theme: {
        primaryColor: "#334155", // Slate 700 (Neutral)
        secondaryColor: "#64748b", // Slate 500 (Neutral)
        accentColor: "#0ea5e9", // Sky 500 (Generic Blue)
        backgroundColor: "#f8fafc", // Slate 50
        textColor: "#0f172a", // Slate 900
    },
    hero: {
        slides: [
            {
                id: "default-slide-1",
                title: "Welcome to Our Platform",
                subtitle: "Your destination for amazing products and services.",
                ctaText: "Shop Now",
                ctaLink: "/products",
                backgroundImageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop",
                overlayOpacity: 0.6,
            }
        ]
    },
    promotions: {
        enabled: true,
        title: "Special Offers",
        items: []
    },
    sections: {
        showSmartClub: true,
        showWeeklyOffers: true,
        showDepartments: true,
        showTestimonials: true,
    },
    footer: {
        logoUrl: "",
        tagline: "Your premier destination for quality products and exceptional service.",
        newsletter: {
            title: "Stay Updated",
            description: "Subscribe to receive the latest news and updates.",
            subtext: "We respect your privacy.",
        },
        socialSectionTitle: "Connect",
        socialLinks: {
            facebook: "#",
            instagram: "#",
            twitter: "#",
        },
        navigation: {
            shop: {
                title: "Shop",
                links: [
                    { name: "Departments", href: "/departments" },
                    { name: "All Products", href: "/products" },
                    { name: "Weekly Offers", href: "/offers" },
                    { name: "New Arrivals", href: "/new-arrivals" },
                ]
            },
            company: {
                title: "Company",
                links: [
                    { name: "Our Story", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "Contact Us", href: "/contact" },
                    { name: "Store Locator", href: "/stores" },
                ]
            }
        },
        bottomLinks: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Sitemap", href: "/sitemap" },
        ]
    },
    contact: {
        phone: "+1 234 567 890",
        email: "contact@example.com",
        address: "City, State, Country",
        mapEmbedUrl: "",
        storeHours: "Monday - Sunday\n10:00 AM - 10:00 PM",
    },
    headerLinks: [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "Departments", href: "/departments" },
        { name: "Special Offers", href: "/offers" },
        { name: "About Us", href: "/about" },
    ],
    system: {
        maintenanceMode: false,
        robotsTxt: `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/sitemap.xml`,
        scripts: {},
    },
    manifest: {
        name: "My App",
        shortName: "App",
        description: "A premium digital experience.",
        themeColor: "#064e3b",
        backgroundColor: "#ffffff",
        display: "standalone",
        startUrl: "/",
    },
    labels: {
        placeholders: {
            search: "Search collections...",
            email: "Enter your email address",
        },
        buttons: {
            subscribe: "Subscribe",
            viewCollection: "View Collection",
            shopNow: "Shop Now",
            search: "Search",
        },
        messages: {
            success: "Operation successful!",
            error: "Something went wrong.",
            loading: "Loading...",
            footerConnect: "Connect",
            footerNoSpam: "No spam, unsubscribe anytime",
            copyright: "All rights reserved.",
        }
    },
    seo: {
        siteTitle: "Generic Brand - Welcome",
        titleTemplate: "%s | Generic Brand",
        metaDescription: "Welcome to our platform. Discover our range of products.",
        keywords: [
            "brand",
            "product",
            "service",
        ],
        ogImageUrl: "/logo.png",
        twitterHandle: "@mystore",
        googleVerification: "",
        jsonLd: {
            name: "Generic Brand",
            url: "https://example.com",
            logo: "/logo.png",
            description: "Your trusted platform.",
            addressCountry: "US",
            priceRange: "$$",
        },
    }
};
