'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // specific check for standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);

            // Check if user has recently dismissed the prompt
            const lastDismissed = localStorage.getItem('pwaPromptDismissed');
            if (lastDismissed) {
                const dismissedTime = parseInt(lastDismissed, 10);
                const now = Date.now();
                // Don't show again for 3 days if dismissed
                if (now - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
                    return;
                }
            }

            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwaPromptDismissed', Date.now().toString());
    };

    if (isInstalled || !isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
                >
                    <div className="bg-white rounded-xl shadow-2xl p-4 border border-blue-100 flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-blue-100">
                            <Image src="/logo.png" alt="Smart Avenue 99" width={48} height={48} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Install App</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Install Smart Avenue 99 for a faster, better experience.
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Install Now
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Not Now
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
