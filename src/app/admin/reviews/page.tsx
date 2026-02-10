"use client";

import { useState, useEffect } from "react";
import { getAllReviews, deleteReview, Review } from "@/app/actions";
import { Trash2, Star, AlertCircle } from "lucide-react";

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        const data = await getAllReviews();
        setReviews(data);
        setLoading(false);
    };

    const handleDelete = async (id: string, productId: string, rating: number) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        setDeletingId(id);
        const result = await deleteReview(id, productId, rating);

        if (result.success) {
            setReviews(reviews.filter(r => r.id !== id));
        } else {
            alert("Failed to delete review");
        }
        setDeletingId(null);
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Manage Reviews</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {reviews.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-900">{review.userName}</span>
                                            <span className="text-xs text-gray-400">
                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown Date'}
                                            </span>
                                        </div>

                                        <div className="flex text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-gray-600 text-sm mt-2">{review.comment}</p>

                                        <div className="mt-2 text-xs text-gray-400">
                                            Product ID: <span className="font-mono">{review.productId}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(review.id, review.productId, review.rating)}
                                        disabled={deletingId === review.id}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Delete Review"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
