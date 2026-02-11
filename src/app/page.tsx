import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import { getSiteContent, FeaturesContent, CTAContent, HighlightsContent } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featuresContent = (await getSiteContent<FeaturesContent>("features")) || undefined;
  const ctaContent = (await getSiteContent<CTAContent>("cta")) || undefined;
  const highlightsContent = (await getSiteContent<HighlightsContent>("highlights")) || undefined;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Hero />


      {/* Dynamic Sections */}
      <Highlights content={highlightsContent} />

      <Features content={featuresContent} />

      <CTA content={ctaContent} />
    </div>
  );
}
