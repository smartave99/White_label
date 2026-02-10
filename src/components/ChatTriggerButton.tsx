"use client";

import { Sparkles } from "lucide-react";

export default function ChatTriggerButton() {
    return (
        <button
            onClick={() => window.dispatchEvent(new Event("open-assistant-chat"))}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-full transition-all flex items-center gap-2 group"
        >
            Chat with AI
            <Sparkles className="w-5 h-5 text-brand-lime group-hover:scale-110 transition-transform" />
        </button>
    );
}
