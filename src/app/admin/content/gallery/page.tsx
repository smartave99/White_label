"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGalleryImages, addGalleryImage, deleteGalleryImage, GalleryImage } from "@/app/actions";
import {
    Loader2,
    ArrowLeft,
    Upload,
    Trash2,
    Image as ImageIcon,

} from "lucide-react";
import Link from "next/link";

export default function GalleryEditor() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadImages();
        }
    }, [user]);

    const loadImages = async () => {
        setLoading(true);
        const data = await getGalleryImages();
        setImages(data);
        setLoading(false);
    };

    const handleAddImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl.trim()) return;

        setUploading(true);
        const result = await addGalleryImage(imageUrl, `manual/${Date.now()}`);
        if (result.success) {
            setImageUrl("");
            setShowUpload(false);
            await loadImages();
        }
        setUploading(false);
    };

    const handleDeleteImage = async (id: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            await deleteGalleryImage(id);
            await loadImages();
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Gallery Manager</h1>
                        <p className="text-gray-500">Manage your gallery images</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        Add Image
                    </button>
                </div>

                {/* Add image form */}
                {showUpload && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Add Image URL</h3>
                        <form onSubmit={handleAddImage} className="flex gap-4">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowUpload(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Add
                            </button>
                        </form>
                        <p className="text-sm text-gray-500 mt-2">
                            Note: For file uploads, please enable Firebase Storage first. Currently supporting URL-based images.
                        </p>
                    </div>
                )}

                {/* Gallery grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Gallery Images ({images.length})</h3>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No images yet. Add your first image!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={image.imageUrl}
                                        alt="Gallery"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://via.placeholder.com/300?text=Image+Error";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDeleteImage(image.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
