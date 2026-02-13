"use client";

import { X } from "lucide-react";
import CloudinaryUpload, { CloudinaryFile } from "@/components/CloudinaryUpload";
import { useEffect } from "react";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: string;
    title: string;
    onUploadSuccess?: (files: CloudinaryFile[]) => void;
}

export default function UploadModal({
    isOpen,
    onClose,
    folder,
    title,
    onUploadSuccess
}: UploadModalProps) {
    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500">Quick upload to <code className="bg-gray-100 px-1 rounded">{folder}</code></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <CloudinaryUpload
                        folder={folder}
                        multiple={true}
                        onUpload={(files) => {
                            if (onUploadSuccess) onUploadSuccess(files);
                            // We don't necessarily close immediately to allow multiple batches
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
