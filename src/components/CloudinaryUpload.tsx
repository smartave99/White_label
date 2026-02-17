"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Film, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { getCloudinarySignature } from "@/app/cloudinary-actions";

export interface CloudinaryFile {
    url: string;
    publicId: string;
    resourceType: "image" | "video";
}

interface CloudinaryUploadProps {
    onUpload: (files: CloudinaryFile[]) => void;
    folder: string;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    currentImages?: string[];
    currentVideo?: string | null;
    onRemoveImage?: (index: number) => void;
    onRemoveVideo?: () => void;
    accept?: "image/*" | "video/*" | "image/*,video/*";
}

export default function CloudinaryUpload({
    onUpload,
    folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "products",
    multiple = false,
    maxFiles = 100, // Effectively unlimited
    className = "",
    currentImages = [],
    currentVideo = null,
    onRemoveImage,
    onRemoveVideo,
    accept = "image/*,video/*"
}: CloudinaryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!multiple && files.length > 1) {
            setError("Please select only one file.");
            return;
        }

        if (multiple && maxFiles && (files.length + currentImages.length) > maxFiles) {
            setError(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        setError(null);
        setUploading(true);
        const newFiles: CloudinaryFile[] = [];

        try {
            // Get signature first (one signature can be used for the batch usually, but let's get one per file or batch if needed. 
            // Cloudinary signatures are valid for a specific set of params. 
            // If we are just setting folder and timestamp, we can reuse it if the timestamp is recent enough, 
            // but getting strict signature per session is safer/easier to implement without complex state.)
            // Actually, for simple folder uploads, we can just fetch signature once if params are identical.
            // But let's keep it simple: fetch signature -> upload.

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const resourceType = file.type.startsWith("video/") ? "video" : "image";

                // Check file size (max 100MB for video, 10MB for image - standard Cloudinary free tier limits are smaller than server, but direct upload is better)
                // Let's keep the previous generous limits or adjust to realistic Cloudinary limits.
                const maxSize = resourceType === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    throw new Error(`File ${file.name} is too large (max ${resourceType === "video" ? "100MB" : "10MB"})`);
                }

                // Optimization transformation: Limit width to 1200px, auto quality, auto format
                // This ensures we don't store massive raw files
                const transformation = "w_1200,c_limit,q_auto,f_auto";

                // Get signature with transformation
                const sigResult = await getCloudinarySignature(folder, transformation);

                if (!sigResult.success || !sigResult.signature || !sigResult.timestamp || !sigResult.apiKey || !sigResult.cloudName) {
                    throw new Error(sigResult.error || "Failed to get upload signature");
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", sigResult.apiKey);
                formData.append("timestamp", sigResult.timestamp.toString());
                formData.append("signature", sigResult.signature);
                formData.append("folder", `smart-avenue/${folder}`); // Match the server-side signing folder structure
                // Note: Cloudinary expects just "folder" param in signed upload to match signature.
                // In getCloudinarySignature we signed: folder: `smart-avenue/${folder}`
                // So we must pass exactly that.
                formData.append("transformation", transformation); // Must match signed param

                const uploadUrl = `https://api.cloudinary.com/v1_1/${sigResult.cloudName}/${resourceType}/upload`;

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || "Upload failed");
                }

                const data = await response.json();

                newFiles.push({
                    url: data.secure_url,
                    publicId: data.public_id,
                    resourceType
                });
            }

            onUpload(newFiles);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err instanceof Error ? err.message : "Failed to upload to Cloudinary");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {uploading ? "Uploading..." : "Upload Images/Video"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {error && (
                    <span className="text-sm text-red-500">{error}</span>
                )}
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Video Preview */}
                {currentVideo && (
                    <div className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                        <video
                            src={currentVideo}
                            className="max-w-full max-h-full"
                            controls
                        />
                        {onRemoveVideo && (
                            <button
                                type="button"
                                onClick={onRemoveVideo}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                title="Remove video"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-1">
                            <Film className="w-3 h-3" /> Video
                        </div>
                    </div>
                )}

                {/* Images Preview */}
                {currentImages.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        {onRemoveImage && (
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Remove image"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Image
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
