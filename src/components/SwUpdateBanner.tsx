"use client";

import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

/**
 * Non-intrusive banner that slides up from the bottom when a new
 * service worker version is detected. Prompts the user to reload.
 */
export default function SwUpdateBanner() {
    const { updateAvailable, reload } = useServiceWorkerUpdate();

    return (
        <AnimatePresence>
            {updateAvailable && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]"
                >
                    <div className="flex items-center gap-3 rounded-full bg-sky-600 px-5 py-3 text-white shadow-lg shadow-sky-600/30">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                            A new version is available
                        </span>
                        <button
                            onClick={reload}
                            className="ml-1 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold transition-colors hover:bg-white/30 active:bg-white/40"
                        >
                            Refresh
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
