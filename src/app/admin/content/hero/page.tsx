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
    Image as ImageIcon,
    Type,
    Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

export default function HeroEditor() {
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
            console.error("Failed to load hero content:", error);
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

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Hero Section</h1>
                        <p className="text-gray-500">Edit the main homepage hero section</p>
                    </div>
                </div>

                {loading || !config ? (
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Text Content */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Type className="w-5 h-5 text-amber-500" />
                                Text Content
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
                                    <input
                                        type="text"
                                        value={config.hero.title}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, title: e.target.value }
                                        })}
                                        placeholder="Experience International Retail"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                    <textarea
                                        value={config.hero.subtitle}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, subtitle: e.target.value }
                                        })}
                                        placeholder="Premium groceries, fashion..."
                                        rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <LinkIcon className="w-5 h-5 text-amber-500" />
                                Call to Action Buttons
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Primary Button</h4>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                                    <input
                                        type="text"
                                        value={config.hero.ctaText}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, ctaText: e.target.value }
                                        })}
                                        placeholder="View Collection"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                    <input
                                        type="text"
                                        value={config.hero.ctaLink}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, ctaLink: e.target.value }
                                        })}
                                        placeholder="/products"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Secondary Button (&quot;Learn More&quot;)</h4>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                    <input
                                        type="text"
                                        value={config.hero.learnMoreLink || ""}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            hero: { ...config.hero, learnMoreLink: e.target.value }
                                        })}
                                        placeholder="/offers"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Background Image */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-amber-500" />
                                Background Image
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                                <div className="mb-4">
                                    <ImageUpload
                                        folder="hero"
                                        multiple={false}
                                        currentImages={config.hero.backgroundImageUrl ? [config.hero.backgroundImageUrl] : []}
                                        onUpload={(files) => files[0] && setConfig({
                                            ...config,
                                            hero: { ...config.hero, backgroundImageUrl: files[0].url }
                                        })}
                                        onRemove={() => setConfig({
                                            ...config,
                                            hero: { ...config.hero, backgroundImageUrl: "" }
                                        })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={config.hero.backgroundImageUrl}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                hero: { ...config.hero, backgroundImageUrl: e.target.value }
                                            })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="block text-sm font-medium text-gray-700">Overlay Opacity</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={config.hero.overlayOpacity}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                hero: { ...config.hero, overlayOpacity: parseFloat(e.target.value) }
                                            })}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-500 w-8">{config.hero.overlayOpacity}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                            {saved && (
                                <span className="text-green-600 text-sm">✓ Changes saved successfully!</span>
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
