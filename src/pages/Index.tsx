import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import QuickCreate from "@/components/QuickCreate";
import { VenueCard, ProCard } from "@/components/ListingCards";
import { MOCK_PROS, MOCK_VENUES } from "@/data/mock";
import heroImage from "@/assets/hero-gathering.jpg";

const Index = () => {
  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt=""
            width={1536}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/40 to-background" />
        </div>

        <div className="container pt-12 pb-8 md:pt-20 md:pb-16">
          <div className="mx-auto max-w-2xl text-center text-primary-foreground animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-medium uppercase tracking-wide backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Plan it. Book it. Live it.
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] md:text-6xl">
              Every gathering, <span className="italic text-primary-glow">unforgettable.</span>
            </h1>
            <p className="mt-4 text-base text-primary-foreground/85 md:text-lg">
              From a coffee for two to a wedding for five hundred — find the venue, the chef, the
              violinist, and the moment.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl animate-fade-up md:mt-10">
            <QuickCreate />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Vetted professionals", d: "ID, insurance & background checks before anyone walks into your home." },
            { icon: HeartHandshake, t: "Real, honest reviews", d: "We collect feedback from day one — ratings only show after enough trust is built." },
            { icon: Sparkles, t: "From 2 to 500+", d: "Cafés for two, ballrooms for hundreds — one search, all your options." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VENUES */}
      <section className="container py-6 md:py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Spaces guests love</h2>
            <p className="mt-1 text-sm text-muted-foreground">Hand-picked venues for any group size.</p>
          </div>
          <Link to="/discover" className="text-sm font-medium text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_VENUES.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      </section>

      {/* FEATURED PROS */}
      <section className="container py-6 md:py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Bring the moment to you</h2>
            <p className="mt-1 text-sm text-muted-foreground">Chefs, musicians, hosts — at your door.</p>
          </div>
          <Link to="/discover?tab=pros" className="text-sm font-medium text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROS.map((p) => (
            <ProCard key={p.id} pro={p} />
          ))}
        </div>
      </section>

      {/* PRO CTA */}
      <section className="container py-12">
        <div className="overflow-hidden rounded-3xl bg-gradient-aubergine p-8 text-secondary-foreground md:p-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-glow">
              For professionals
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Are you a venue, chef, or performer?
            </h2>
            <p className="mt-3 text-secondary-foreground/85">
              Join Vibely's vetted network. Get discovered by hosts planning their next gathering —
              from intimate dinners to grand celebrations.
            </p>
            <Link
              to="/pros"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-sunset px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
            >
              Apply to list your service →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Vibely. Made for memorable gatherings.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/safety" className="hover:text-foreground">Safety</Link>
          </div>
        </div>
      </footer>
    </AppShell>
  );
};

export default Index;
