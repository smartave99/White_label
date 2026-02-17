"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

function AdminPROTECTOR({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname.startsWith("/admin")) {
            router.push("/auth/login?redirect=" + encodeURIComponent(pathname));
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <AdminPROTECTOR>
                    {/* Full-screen overlay that covers the parent Header/Footer */}

                    <div className="fixed inset-0 z-50 bg-brand-sand overflow-hidden flex">
                        <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

                        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                            {/* Mobile Header Toggle */}
                            <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <Menu className="w-6 h-6" />
                                    </button>
                                    <span className="font-serif font-semibold text-lg ml-2 text-gray-800">Admin Portal</span>
                                </div>
                            </div>

                            <main className="flex-1 overflow-y-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </AdminPROTECTOR>
            </AuthProvider>
        </ErrorBoundary>
    );
}

