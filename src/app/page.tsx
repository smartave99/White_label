import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import { getSiteContent, HeroContent } from "@/app/actions";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Heart, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const heroContent = await getSiteContent<HeroContent>("hero");

  // Get config or default text/visibility here if needed, 
  // but for simple components we can just code the structure 
  // and use CSS variables for theming.

  return (
    <div className="flex flex-col min-h-screen bg-brand-sand">
      <Hero content={heroContent} />

      {/* Dynamic Sections */}
      <Highlights />

      {/* Features / Why Choose Us - Redesigned */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-green/5 skew-y-3 transform origin-bottom-left" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-brand-gold font-bold tracking-widest uppercase text-sm mb-2 block">Our Promise</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6">
              Why Choose Smart Avenue?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
              We are committed to delivering the best retail experience in Patna, blending luxury with everyday convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Premium Quality",
                desc: "Handpicked products that meet high standards of durability and style.",
                icon: ShieldCheck
              },
              {
                title: "Affordable Luxury",
                desc: "Experience the finest quality without the premium price tag.",
                icon: Globe
              },
              {
                title: "Customer First",
                desc: "Your satisfaction is our top priority, with dedicated service.",
                icon: Heart
              },
              {
                title: "Trusted Retail",
                desc: "A legacy of trust and excellence in every interaction.",
                icon: CheckCircle2
              },
            ].map((item, idx) => (
              <div key={idx} className="group p-8 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white/40 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-full bg-brand-green/10 flex items-center justify-center mb-6 group-hover:bg-brand-gold group-hover:text-brand-dark transition-colors text-brand-green">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-dark mb-3 group-hover:text-brand-gold transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-dark text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">Ready to elevate your lifestyle?</h2>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand-gold px-8 text-sm font-medium text-brand-dark shadow transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
