"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getDashboardStats } from "@/app/actions";
import {
    Megaphone,
    ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, loading: authLoading, role } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ offersCount: 0, productsCount: 0, categoriesCount: 0 });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            getDashboardStats().then(setStats);
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="p-8">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-100 h-32 animate-pulse rounded-xl">
                            <div className="h-10 w-10 bg-gray-100 rounded mb-4" />
                            <div className="h-5 w-24 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const dashboardTitle = `${role} Dashboard`;

    return (
        <div className="p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-2xl font-serif text-gray-800 tracking-tight">{dashboardTitle}</h2>
                    <p className="text-gray-500 text-sm mt-1">Overview of your store&apos;s performance and content.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Welcome Card */}
                    <div className="bg-brand-green rounded-xl p-8 text-white relative overflow-hidden md:col-span-2 shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-serif mb-2">Welcome back, {user.email?.split('@')[0]}</h3>
                            <p className="text-brand-gold/80 mb-6 max-w-md">
                                Manage your store&apos;s products, offers, and content from this unified dashboard.
                            </p>
                            <div className="flex gap-3">
                                <Link href="/admin/content/products" className="px-4 py-2 bg-white text-brand-green rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                                    Manage Products
                                </Link>
                                <Link href="/" target="_blank" className="px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-lg font-medium text-sm hover:bg-brand-gold/30 transition-colors">
                                    View Store
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Offers Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-brand-gold" />
                            Active Offers
                        </h4>
                        <p className="text-3xl font-serif text-brand-green">{stats.offersCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Live on store</p>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-brand-blue" />
                            Total Products
                        </h4>
                        <p className="text-3xl font-serif text-brand-green">{stats.productsCount}</p>
                        <p className="text-xs text-gray-500 mt-1">In catalog</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
