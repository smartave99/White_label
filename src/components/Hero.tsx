"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { HeroContent } from "@/app/actions";

export default function Hero({ content }: { content: HeroContent | null }) {
    if (!content) return null; // Or render a skeleton/default

    return (
        <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-brand-green/20 z-10 mix-blend-multiply" />
                <div className="w-full h-full bg-slate-900 relative">
                    {content.backgroundImage && (
                        <Image
                            src={content.backgroundImage}
                            alt="Hero Background"
                            fill
                            className="object-cover opacity-60"
                            priority
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 relative z-20 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-gold text-sm font-medium tracking-wide mb-6">
                        {content.tagline}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                        {content.title}
                        <br />
                        <span className="text-brand-gold">{content.subtitle}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                        {/* If description wasn't in content, keep hardcoded or add to interface. 
                            Using subtitle as the main text for now if description is missing in interface.
                            The interface in actions.ts has title, subtitle, tagline, ctaPrimary, ctaSecondary, backgroundImage.
                            It does NOT have 'description'. I will use hardcoded description for now as fallback or just omit.
                        */}
                        We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items—bringing comfort, convenience, and elegance to everyday living.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/departments"
                            className="px-8 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-dark font-semibold rounded-full transition-all flex items-center gap-2 group shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                            {content.ctaPrimary}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/offers"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full transition-all"
                        >
                            {content.ctaSecondary}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
