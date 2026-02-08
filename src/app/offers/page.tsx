import { getOffers } from "@/app/actions";
import OffersList from "@/components/OffersList";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
    const offers = await getOffers();

    return (
        <div className="bg-white min-h-screen py-20 px-4 md:px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <span className="text-brand-gold font-bold tracking-wider uppercase text-sm mb-2 block">Don&apos;t Miss Out</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">
                        Weekly <span className="text-brand-gold">Smart Deals</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Grab the best offers on premium products. Updated every Monday.
                    </p>
                </div>
                <OffersList offers={offers} />
            </div>
        </div>
    );
}
