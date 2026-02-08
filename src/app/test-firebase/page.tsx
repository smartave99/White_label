"use client";

import { useState } from "react";
import { testFirebaseConnection } from "@/app/actions";

export default function TestFirebasePage() {
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        collections?: string[];
        error?: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        try {
            const res = await testFirebaseConnection();
            setResult(res);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            setResult({ success: false, message: "Action failed", error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Firebase Connector</h1>
                    <p className="text-slate-500">Test your backend connection to Firebase Admin SDK.</p>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleTest}
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all transform active:scale-95 ${loading
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                            }`}
                    >
                        {loading ? "Testing Connection..." : "Test Firebase Connection"}
                    </button>
                </div>

                {result && (
                    <div className={`p-4 rounded-xl border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}>
                        <h2 className={`font-bold mb-1 ${result.success ? "text-green-800" : "text-red-800"}`}>
                            {result.success ? "✅ Success" : "❌ Connection Failed"}
                        </h2>
                        <p className="text-sm text-slate-700">{result.message}</p>

                        {result.error && (
                            <pre className="mt-4 p-3 bg-slate-900 text-red-400 text-xs rounded overflow-auto max-h-40">
                                {result.error}
                            </pre>
                        )}

                        {result.collections && result.collections.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Collections Found:</p>
                                <div className="flex flex-wrap gap-2">
                                    {result.collections.map((col) => (
                                        <span key={col} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 font-mono">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!result.success && !result.error && (
                            <p className="mt-4 text-xs text-slate-500 italic">
                                Hint: Make sure you&apos;ve added your credentials to `.env.local`.
                            </p>
                        )}
                    </div>
                )}

                <div className="text-xs text-slate-400 text-center border-t pt-4">
                    Uses <code>src/lib/firebase-admin.ts</code> and <code>actions.ts</code>
                </div>
            </div>
        </div>
    );
}
