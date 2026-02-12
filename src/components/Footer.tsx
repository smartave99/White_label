
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function Footer() {
    const { config } = useSiteConfig();
    const { branding, contact, footer } = config;

    return (
        <footer className="bg-brand-dark text-white pt-24 pb-12 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

                    {/* Brand Column - Spans 4 columns */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="block">
                            <div className="relative w-48 h-12">
                                <Image
                                    src="/logo.png"
                                    alt={branding.siteName}
                                    fill
                                    className="object-contain brightness-0 invert"
                                />
                            </div>
                        </Link>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-light">
                            {footer.tagline}
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[
                                { Icon: Facebook, url: footer.socialLinks.facebook },
                                { Icon: Instagram, url: footer.socialLinks.instagram },
                                { Icon: Twitter, url: footer.socialLinks.twitter },
                            ].map(({ Icon, url }, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-lime hover:text-brand-dark hover:border-brand-lime transition-all duration-300">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Spacer - Spans 1 column */}
                    <div className="hidden lg:block lg:col-span-1" />

                    {/* Navigation - Spans 7 columns */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Shop */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-6 tracking-tight">{footer.navigation.shop.title}</h3>
                            <ul className="space-y-4">
                                {footer.navigation.shop.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="text-slate-400 hover:text-brand-lime transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-6 tracking-tight">{footer.navigation.company.title}</h3>
                            <ul className="space-y-4">
                                {footer.navigation.company.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="text-slate-400 hover:text-brand-lime transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="space-y-6">
                            <h3 className="text-white font-bold text-lg mb-6 tracking-tight">Get in Touch</h3>
                            <div className="flex items-start gap-4 text-slate-400 group">
                                <MapPin className="w-5 h-5 text-brand-blue shrink-0 mt-1" />
                                <span className="group-hover:text-white transition-colors">{contact.address}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 group">
                                <Phone className="w-5 h-5 text-brand-blue shrink-0" />
                                <span className="group-hover:text-white transition-colors">{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 group">
                                <Mail className="w-5 h-5 text-brand-blue shrink-0" />
                                <span className="group-hover:text-white transition-colors">{contact.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} {branding.siteName}. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-slate-500">
                        {footer.bottomLinks.map((link, idx) => (
                            <Link key={idx} href={link.href} className="hover:text-white transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
