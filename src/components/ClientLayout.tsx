"use client";

import { BrandingProvider } from "@/context/branding-context";
import { AuthProvider } from "@/context/auth-context";
import { ContactProvider } from "@/context/contact-context";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import AssistantChat from "./assistant/AssistantChat";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SiteConfigProvider>
                    <BrandingProvider>
                        <ContactProvider>
                            <Header />
                            {children}
                            <AssistantChat />
                            <Footer />
                        </ContactProvider>
                    </BrandingProvider>
                </SiteConfigProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
