"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getSiteConfig, updateSiteConfig } from "@/app/actions/site-config";
import { SiteConfig } from "@/types/site-config";
import {
    Loader2,
    ArrowLeft,
    Save,
    Smartphone,
    Image as ImageIcon,
    Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CloudinaryUpload from "@/components/CloudinaryUpload";

export default function BrandingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadConfig();
        }
    }, [user]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await getSiteConfig();
            setConfig(data);
        } catch (error) {
            console.error("Failed to load branding config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        setSaved(false);

        const result = await updateSiteConfig(config);

        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } else {
            alert("Failed to save changes: " + (result.error || "Unknown error"));
        }
        setSaving(false);
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    const screenshotUrl = config?.branding.pwaScreenshotUrl || "";

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">PWA Branding</h1>
                        <p className="text-gray-500">Manage the screenshot shown in the app install prompt</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Upload Section */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-amber-500" />
                                    PWA Install Screenshot
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    This image appears in the install prompt when users are asked to add the app to their home screen. Use a screenshot of your app for best results.
                                </p>

                                <div className="mb-3">
                                    <CloudinaryUpload
                                        folder="branding/pwa-screenshot"
                                        multiple={false}
                                        currentImages={screenshotUrl ? [screenshotUrl] : []}
                                        onUpload={(files) => files[0] && setConfig({
                                            ...config,
                                            branding: { ...config.branding, pwaScreenshotUrl: files[0].url }
                                        })}
                                        onRemoveImage={() => setConfig({
                                            ...config,
                                            branding: { ...config.branding, pwaScreenshotUrl: "" }
                                        })}
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={screenshotUrl}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        branding: { ...config.branding, pwaScreenshotUrl: e.target.value }
                                    })}
                                    placeholder="Or enter image URL manually..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                />

                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700">
                                        <strong>Tip:</strong> Use a phone-sized screenshot (e.g. 540×960 or similar portrait). This gives users a preview of what the app looks like before installing.
                                    </p>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-amber-500" />
                                    Install Prompt Preview
                                </h3>

                                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                                    {/* Mock Install Prompt */}
                                    <div className="bg-white rounded-xl shadow-2xl p-4 border border-blue-100 w-full max-w-[320px]">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-blue-100 bg-gray-50">
                                                <Image
                                                    src={config.branding.logoUrl || "/logo.png"}
                                                    alt="Logo"
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm">Install App</h4>
                                                <p className="text-xs text-gray-500">
                                                    Install {config.branding.siteName} for a faster experience.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Screenshot Preview */}
                                        {screenshotUrl ? (
                                            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                <Image
                                                    src={screenshotUrl}
                                                    alt="App Screenshot"
                                                    width={300}
                                                    height={200}
                                                    className="w-full h-auto object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                                                <Smartphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-gray-400">
                                                    Upload a screenshot to preview it here
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-3">
                                            <div className="flex-1 bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg text-center">
                                                Install Now
                                            </div>
                                            <div className="px-3 py-1.5 text-xs font-medium text-gray-400 text-center">
                                                Not Now
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="flex items-center justify-between">
                            {saved && (
                                <span className="text-green-600 text-sm">✓ Branding settings saved!</span>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-auto flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
