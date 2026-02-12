import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Promotions from "@/components/Promotions";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent, HeroContent } from "@/app/actions";
import { getSiteConfig } from "@/app/actions/site-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuresRes, ctaRes, highlightsRes, config] = await Promise.all([
    getSiteContent<FeaturesContent>("features"),
    getSiteContent<CTAContent>("cta"),
    getSiteContent<HighlightsContent>("highlights"),
    getSiteConfig(),
  ]);

  const featuresContent = featuresRes || undefined;
  const ctaContent = ctaRes || undefined;
  const highlightsContent = highlightsRes || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero />

      <Promotions config={config.promotions} />

      {/* Dynamic Sections */}
      <Highlights content={highlightsContent} />

      <Features content={featuresContent} />

      <CTA content={ctaContent} />
    </div>
  );
}
