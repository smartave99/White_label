import { getOffers } from "@/app/actions";
import OffersList from "@/components/OffersList";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
    const offers = await getOffers();

    return (
        <div className="min-h-screen bg-brand-sand py-20 px-4 md:px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-gold/20 -z-10" />
                    <span className="bg-brand-sand px-4 text-brand-gold font-bold tracking-[0.2em] uppercase text-sm mb-2 inline-block relative z-10">Limited Time Only</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark mb-6 mt-4">
                        Exclusive <span className="text-brand-gold italic font-light">Privileges</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
                        Discover seasonal specials and member-only benefits curated just for you.
                    </p>
                </div>
                <OffersList offers={offers} />
            </div>
        </div>
    );
}
