import { getProducts, getCategories, getOffers, searchProducts, Product, Category, Offer } from "@/lib/data";
import Link from "next/link";
import { Package, Search, ChevronRight, Zap, ArrowLeft, Tag } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; subcategory?: string; search?: string }>
}) {
    const params = await searchParams;
    const [products, categories, offers] = await Promise.all([
        params.search
            ? searchProducts(params.search, params.category, params.subcategory)
            : getProducts(),
        getCategories(),
        getOffers()
    ]);

    const mainCategories = categories.filter((c: Category) => !c.parentId);
    const getSubcategories = (parentId: string) => categories.filter((c: Category) => c.parentId === parentId);
    const getCategoryName = (id: string) => categories.find((c: Category) => c.id === id)?.name || "Unknown";
    const getOffer = (id?: string) => id ? offers.find((o: Offer) => o.id === id) : null;

    // Filter products
    let filteredProducts = params.search
        ? products
        : products.filter((p: Product) => p.available);

    if (!params.search) {
        if (params.category) {
            filteredProducts = filteredProducts.filter((p: Product) =>
                p.categoryId === params.category || p.subcategoryId === params.category
            );
        }
        if (params.subcategory) {
            filteredProducts = filteredProducts.filter((p: Product) => p.subcategoryId === params.subcategory);
        }
    }



    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Nav would be in layout, but let's add a simple breadcrumb or header if needed */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="font-semibold text-lg text-gray-800">
                        {params.search ? `Search: "${params.search}"` :
                            params.category ? getCategoryName(params.category) : "All Products"}
                    </div>
                    <div className="w-24"></div> {/* Spacer for centering */}
                </div>

                {/* Categories / Filters Bar */}
                <div className="container mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                    <Link
                        href="/products"
                        className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!params.category ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </Link>
                    {mainCategories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/products?category=${cat.id}`}
                            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${params.category === cat.id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Subcategories if a category is selected */}
                {params.category && getSubcategories(params.category).length > 0 && (
                    <div className="container mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-50 pt-2">
                        {getSubcategories(params.category).map(sub => (
                            <Link
                                key={sub.id}
                                href={`/products?category=${params.category}&subcategory=${sub.id}`}
                                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors border ${params.subcategory === sub.id ? 'border-amber-600 text-amber-600 bg-amber-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 py-8">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search term.
                        </p>
                        <Link href="/products" className="inline-block mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                            Clear Filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const offer = getOffer(product.offerId);
                            return (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                        {product.imageUrl ? (
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-12 h-12" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.featured && (
                                                <span className="px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md shadow-sm flex items-center gap-1">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    Featured
                                                </span>
                                            )}
                                            {offer && (
                                                <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-md shadow-sm flex items-center gap-1">
                                                    <Tag className="w-3 h-3 fill-current" />
                                                    {offer.discount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {getCategoryName(product.categoryId)}
                                            {product.subcategoryId && ` > ${getCategoryName(product.subcategoryId)}`}
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                            {product.name}
                                        </h3>

                                        <div className="mt-auto pt-2 flex items-end justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                                                    )}
                                                </div>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                    </span>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
