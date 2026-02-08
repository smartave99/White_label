"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSiteContent } from "@/app/actions";

export interface BrandingSettings {
    logoUrl: string;
    faviconUrl: string;
    posterUrl: string;
    siteName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    instagramUrl?: string;
    whatsappUrl?: string;
}

const defaultBranding: BrandingSettings = {
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    posterUrl: "",
    siteName: "Smart Avenue",
    tagline: "All your home needs, simplified.",
    primaryColor: "#C5A059",
    secondaryColor: "#0F281E",
    instagramUrl: "https://instagram.com",
    whatsappUrl: "https://wa.me/"
};

interface BrandingContextType {
    branding: BrandingSettings;
    loading: boolean;
    refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
    branding: defaultBranding,
    loading: true,
    refreshBranding: async () => { },
});

export function BrandingProvider({ children }: { children: ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
    const [loading, setLoading] = useState(true);

    const loadBranding = async () => {
        try {
            const data = await getSiteContent<BrandingSettings>("branding");
            if (data) {
                setBranding({ ...defaultBranding, ...data });
            }
        } catch (error) {
            console.error("Failed to load branding:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranding();
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, loading, refreshBranding: loadBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
