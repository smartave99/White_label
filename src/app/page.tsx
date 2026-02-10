import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import { getSiteContent, HeroContent } from "@/app/actions";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react";
import ChatTriggerButton from "@/components/ChatTriggerButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const heroContent = (await getSiteContent<HeroContent>("hero")) || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero content={heroContent} />


      {/* Dynamic Sections */}
      <Highlights />

      {/* Features / Why Choose Us - Redesigned Modern Tech */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-brand-lime font-bold tracking-widest uppercase text-xs mb-2 block">Values</span>
              <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 tracking-tight">
                Smart Shopping, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-lime">Elevated Experience.</span>
              </h2>
            </div>
            <p className="text-slate-500 text-lg max-w-md pt-4">
              We bridge the gap between premium international retail and local convenience, delivering excellence in every package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Premium Quality",
                desc: "Certified authentic products sourcing from global brands.",
                icon: ShieldCheck
              },
              {
                title: "Smart Logistics",
                desc: "Next-day delivery across Patna with live tracking.",
                icon: Zap
              },
              {
                title: "Global Standards",
                desc: "International shopping experience right at your doorstep.",
                icon: Globe
              },
              {
                title: "Trusted Service",
                desc: "24/7 dedicated support and easy returns policy.",
                icon: CheckCircle2
              },
            ].map((item, idx) => (
              <div key={idx} className="group p-8 bg-slate-50 hover:bg-brand-dark rounded-2xl transition-all duration-300 border border-slate-100 hover:border-brand-dark">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 text-brand-blue group-hover:bg-white/10 group-hover:border-white/10 group-hover:text-brand-lime transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-dark">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-lime/20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/30 via-transparent to-transparent opacity-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
            Ready to experience the new standard?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of smart shoppers transforming their lifestyle with Smart Avenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/departments"
              className="px-8 py-4 bg-brand-lime hover:bg-lime-400 text-brand-dark font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(132,204,22,0.4)]"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
            <ChatTriggerButton />
          </div>
        </div>
      </section>
    </div>
  );
}
