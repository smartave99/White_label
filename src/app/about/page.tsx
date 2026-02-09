"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, Heart, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="bg-brand-sand min-h-screen">
            {/* Editorial Hero */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="About Hero"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-brand-dark/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-brand-gold font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Our Story</span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                            Smart Avenue
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
                            Bringing comfort, convenience, and elegance to everyday living.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-24 container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-brand-green font-bold tracking-widest uppercase text-sm mb-2 block">Our Vision</span>
                            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-6">Redefining Retail in Patna</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed font-light">
                            At Smart Avenue, we believe that quality, style, and affordability should go hand in hand. Our mission is to redefine retail shopping by offering well-designed, long-lasting, and functional products that enhance everyday life while remaining budget-friendly.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed font-light">
                            We continuously update our product range to match current trends, customer needs, and modern lifestyles, ensuring that every visit to Smart Avenue feels fresh, valuable, and satisfying.
                        </p>
                    </div>
                    <div className="flex-1 relative aspect-square w-full max-w-md mx-auto">
                        <div className="absolute inset-0 bg-brand-gold rounded-full opacity-20 blur-3xl transform translate-x-12 translate-y-12" />
                        <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop"
                                alt="Store Interior"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-brand-gold font-bold tracking-widest uppercase text-sm mb-2 block">Our Values</span>
                        <h2 className="text-4xl font-serif font-bold text-brand-dark mb-4">The Pillars of Smart Avenue</h2>
                        <p className="text-gray-500 font-light">Experience the difference in every detail.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Quality Assurance",
                                desc: "100% genuine products, sourced directly from trusted brands.",
                                color: "text-brand-green bg-brand-green/10"
                            },
                            {
                                icon: Globe,
                                title: "Global Standards",
                                desc: "International shopping ambiance and service protocols.",
                                color: "text-brand-gold bg-brand-gold/10"
                            },
                            {
                                icon: Heart,
                                title: "Customer First",
                                desc: "Valet parking, lounge access, and premium hospitality.",
                                color: "text-red-500 bg-red-50"
                            },
                            {
                                icon: CheckCircle2,
                                title: "Integrity",
                                desc: "Transparent billing and honest pricing, always.",
                                color: "text-blue-500 bg-blue-50"
                            },
                        ].map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 rounded-full ${value.color} flex items-center justify-center mb-6`}>
                                    <value.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-brand-dark mb-3 group-hover:text-brand-gold transition-colors">{value.title}</h3>
                                <p className="text-gray-600 font-light leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
