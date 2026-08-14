import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Users, Vote } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HomePrefsExperience } from "@/components/landing/HomePrefsExperience";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader scrolled={scrolled} />

      <main className="flex-1">
        <section className="border-b-2 border-border bg-background">
          <div className="container px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
                For adults 50 and over
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
                Vibely
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xl font-medium text-foreground sm:text-2xl">
                Meet neighbours. Vote on what happens next. Show up — together.
              </p>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                Local circles, morning walks, bhajans, cards, day trips, and senior perks —
                designed so you never have to figure it out alone.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <HomePrefsExperience />
            </div>
          </div>
        </section>

        <section id="how" className="border-b-2 border-border bg-muted/60 py-14" aria-labelledby="how-title">
          <div className="container px-4">
            <h2 id="how-title" className="text-center font-display text-3xl font-semibold text-foreground">
              How Vibely works
            </h2>
            <ol className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
              {[
                {
                  icon: HeartHandshake,
                  title: "Tell us about you",
                  body: "Age, where you live, and what you love. Thirty seconds — then we personalise everything.",
                },
                {
                  icon: Vote,
                  title: "Vote with your neighbourhood",
                  body: "Suggest walks, music, and meetups. When enough neighbours agree, it becomes a real activity.",
                },
                {
                  icon: Users,
                  title: "Join a circle",
                  body: "Small local groups. Friendly faces. One tap to join — bring a friend anytime.",
                },
              ].map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-3xl border-2 border-border bg-card p-6 shadow-soft"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">Step {i + 1}</p>
                  <step.icon className="mt-3 h-8 w-8 text-foreground" aria-hidden />
                  <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-secondary py-14 text-secondary-foreground" aria-labelledby="promise-title">
          <div className="container max-w-3xl px-4 text-center">
            <h2 id="promise-title" className="font-display text-3xl font-semibold">
              Built for clarity, not clutter
            </h2>
            <p className="mt-4 text-lg opacity-95">
              Large type. High contrast. Voice-friendly. Languages you speak at home.
              No endless menus — just the next good thing to do near you.
            </p>
            <p className="mt-6 text-base">
              Already have an account?{" "}
              <Link to="/auth" className="font-bold underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
