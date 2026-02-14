"use client";

import { AuthProvider } from "@/context/auth-context";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import AssistantChat from "./assistant/AssistantChat";

import { SiteConfig } from "@/types/site-config";

import PwaInstallPrompt from "./PwaInstallPrompt";
import SwUpdateBanner from "./SwUpdateBanner";

export default function ClientLayout({
    children,
    initialConfig,
}: {
    children: React.ReactNode;
    initialConfig: SiteConfig;
}) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SiteConfigProvider initialConfig={initialConfig}>
                    <Header />
                    {children}
                    <AssistantChat />
                    <PwaInstallPrompt />
                    <SwUpdateBanner />
                    <Footer />
                </SiteConfigProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
