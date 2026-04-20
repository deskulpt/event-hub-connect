import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroBriefSheet } from "@/components/landing/HeroBriefSheet";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CategoryBento } from "@/components/landing/CategoryBento";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCta } from "@/components/landing/FinalCta";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader scrolled={scrolled} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mesh">
          {/* Animated orbs */}
          <div className="orb left-[-10%] top-[-10%] h-[480px] w-[480px] bg-gradient-sunset opacity-40" />
          <div className="orb right-[-15%] top-[10%] h-[420px] w-[420px] bg-gradient-aurora opacity-30" />
          <div className="orb bottom-[-20%] left-[30%] h-[420px] w-[420px] bg-gradient-ocean opacity-25" />

          <div className="container relative px-4 pb-20 pt-16 sm:pt-24 lg:pb-32 lg:pt-32">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-first event planning
              </span>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-secondary sm:text-6xl lg:text-7xl">
                Plan any event in{" "}
                <span className="text-gradient">60 seconds</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
                From a dinner for two to a wedding for two hundred — find venues, chefs, artists, and more in one place.
              </p>

              <HeroBriefSheet />

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" /> Verified & insured pros
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Free to start
                </span>
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />
        <HowItWorks />
        <CategoryBento />
        <Testimonials />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
