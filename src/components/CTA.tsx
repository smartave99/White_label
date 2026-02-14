"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ChatTriggerButton from "@/components/ChatTriggerButton";
import { CTAContent } from "@/app/actions";

const defaultContent: CTAContent = {
    title: "Ready to experience the new standard?",
    text: "Join thousands of smart shoppers transforming their lifestyle with Smart Avenue.",
    ctaPrimary: "Browse Catalog",
    ctaLink: "/products",
    ctaSecondary: "Chat with Us",
    backgroundImage: "", // Default gradient used
    images: []
};

export default function CTA({ content }: { content?: CTAContent }) {
    const finalContent = content || defaultContent;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = useMemo(() => {
        return finalContent.images && finalContent.images.length > 0
            ? finalContent.images
            : (finalContent.backgroundImage ? [finalContent.backgroundImage] : []);
    }, [finalContent.images, finalContent.backgroundImage]);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    return (
        <section className="py-24 relative overflow-hidden min-h-[500px] flex items-center">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0">
                {images.length > 0 ? (
                    images.map((img, index) => (
                        <div
                            key={img}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <Image
                                src={img}
                                alt="Background"
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            {/* Overlay for readability */}
                            <div className="absolute inset-0 bg-black/60" />
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 bg-brand-dark">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-transparent opacity-50" />
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
                    {finalContent.title}
                </h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    {finalContent.text}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={finalContent.ctaLink || "/products"}
                        className="px-8 py-4 bg-brand-lime hover:bg-lime-400 text-brand-dark font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]"
                    >
                        {finalContent.ctaPrimary} <ArrowRight className="w-5 h-5" />
                    </Link>
                    {/* Secondary Action - dynamic check if it's "Chat with Us" or a link */}
                    {finalContent.ctaSecondary === "Chat with Us" ? (
                        <ChatTriggerButton />
                    ) : (
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-full transition-all"
                        >
                            {finalContent.ctaSecondary}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
