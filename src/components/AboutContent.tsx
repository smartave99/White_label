"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Globe, ShieldCheck, Users, Zap, TrendingUp, MapPin, Phone, Mail, Clock, Check, Star, Heart, Award, Target } from "lucide-react";
import Image from "next/image";
import { AboutPageContent, ContactContent } from "@/app/actions";
import { useSiteConfig } from "@/context/SiteConfigContext";

// Map string icon names to Lucide icons
const iconMap: Record<string, React.ElementType> = {
    CheckCircle2, Globe, ShieldCheck, Users, Zap, TrendingUp, MapPin, Phone, Mail, Clock, Check, Star, Heart, Award, Target
};

export default function AboutContent({ content, contact }: { content: AboutPageContent | null, contact: ContactContent | null }) {
    const { config } = useSiteConfig();

    // Default fallback content using config where possible
    const data = content || {
        heroTitle: config.branding.siteName || "Our Story",
        heroSubtitle: config.branding.tagline || "Building the future of retail, right here in your city.",
        heroImage: "",
        visionTitle: "Redefining Retail",
        visionText1: "We are not just a store; we are a logistics ecosystem designed for modern living. We bridge the gap between premium global brands and optimal local convenience.",
        visionText2: "Our platform leverages cutting-edge technology to ensure that quality, affordability, and speed are not mutually exclusive, but the standard for every interaction.",
        visionImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
        heroLabel: "Our Story",
        visionLabel: "Our Vision",
        statsCustomers: "10k+",
        statsCustomersLabel: "Happy Customers",
        statsSatisfaction: "98%",
        statsSatisfactionLabel: "Satisfaction Rate",
        contactTitle: "Visit Our Store",
        contactSubtitle: "We'd love to see you in person. Here's where you can find us.",
        valuesTitle: "The Standard",
        valuesSubtitle: "Driven by innovation, grounded in integrity.",
        values: [
            {
                title: "Verified Quality",
                desc: "Rigorous quality checks on 100% of inventory.",
                icon: "ShieldCheck",
                color: "text-blue-600"
            },
            {
                title: "Global Access",
                desc: "Sourcing the best products from around the world.",
                icon: "Globe",
                color: "text-green-600"
            },
            {
                title: "Instant Service",
                desc: "Efficient billing and personalized assistance.",
                icon: "Zap",
                color: "text-orange-500"
            },
            {
                title: "Total Transparency",
                desc: "Clear pricing, no hidden fees, honest service.",
                icon: "CheckCircle2",
                color: "text-gray-900"
            }
        ]
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-blue-600 font-semibold tracking-wide uppercase mb-3">{data.heroLabel}</h2>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {data.heroTitle}
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                {data.heroSubtitle}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={data.visionImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"}
                                    alt="Store Interior"
                                    width={800}
                                    height={600}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <div className="text-3xl font-bold mb-2">{data.statsCustomers}</div>
                                        <div className="text-white/80">{data.statsCustomersLabel}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Target className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">{data.visionLabel}</h2>
                            </div>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                {data.visionText1}
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {data.visionText2}
                            </p>

                            <div className="grid grid-cols-2 gap-6 mt-10">
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{data.statsSatisfaction}</h4>
                                    <p className="text-sm text-gray-600">{data.statsSatisfactionLabel}</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">Authentic</h4>
                                    <p className="text-sm text-gray-600">100% Genuine products</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.valuesTitle}</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {data.valuesSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.values.map((item, index) => {
                            const IconComponent = iconMap[item.icon] || Award;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                        <IconComponent className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">{data.contactTitle}</h2>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                {data.contactSubtitle}
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Address</h4>
                                        <p className="text-gray-400 whitespace-pre-line">
                                            {contact?.address || config.contact.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Phone</h4>
                                        <p className="text-gray-400">{contact?.phone || config.contact.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Email</h4>
                                        <p className="text-gray-400">{contact?.email || config.contact.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Clock className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold mb-1">Opening Hours</h4>
                                        <p className="text-gray-400">{contact?.storeHours || config.contact.storeHours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-800">
                            {/* Map Placeholder or Store Image */}
                            <Image
                                src="https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&q=80"
                                alt="Store Location"
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 text-center">
                                    <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
                                    <h3 className="font-bold text-xl">Find us on Map</h3>
                                    <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                                        Get Directions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
