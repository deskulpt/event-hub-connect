import { Link } from "react-router-dom";
import { Building2, Music, ChefHat, ShieldCheck, Sparkles, Star } from "lucide-react";
import heroImg from "@/assets/hero-event.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QuickCreateForm } from "@/components/QuickCreateForm";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImg}
              alt="Friends gathered around a beautifully set outdoor dinner table at golden hour"
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/40 to-background" />
          </div>

          <div className="container relative px-4 pb-10 pt-12 sm:pt-20 lg:pb-20 lg:pt-28">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="text-primary-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" /> Plan in 60 seconds
                </span>
                <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                  Every gathering, beautifully booked.
                </h1>
                <p className="mt-4 max-w-xl text-base text-primary-foreground/90 sm:text-lg">
                  From an intimate dinner for two to a wedding for two hundred — find venues, chefs,
                  artists and at-home experiences in one place.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/85">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Verified pros
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4" /> Real reviews
                  </span>
                </div>
              </div>

              <div>
                <QuickCreateForm />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container px-4 py-14 sm:py-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-secondary sm:text-4xl">
                Whatever you're hosting
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Discover spaces and people who'll make the day unforgettable.
              </p>
            </div>
            <Link to="/explore" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
              Explore all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryCard
              icon={Building2}
              title="Venues by capacity"
              desc="Cafes, restaurants & event spaces filtered by how many guests you're bringing."
              to="/explore?tab=venues"
            />
            <CategoryCard
              icon={Music}
              title="Artists & performers"
              desc="Violinists, comedians, singers — the right vibe for your moment."
              to="/explore?tab=pros&category=artists"
            />
            <CategoryCard
              icon={ChefHat}
              title="In-home chefs & hosts"
              desc="Private dinners, wine & paint nights, and tasting menus at your place."
              to="/explore?tab=pros&category=chefs"
            />
          </div>
        </section>

        {/* Trust */}
        <section className="bg-muted/40">
          <div className="container px-4 py-14 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-semibold text-secondary sm:text-4xl">
                Vetted, reviewed, ready to host
              </h2>
              <p className="mt-3 text-muted-foreground">
                Every professional joining Vibely is reviewed before listings go live. We collect ID,
                business credentials and references — so you can welcome them home with confidence.
              </p>
              <Link
                to="/trust"
                className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Read our trust & safety promise →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

const CategoryCard = ({
  icon: Icon,
  title,
  desc,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  to: string;
}) => (
  <Link
    to={to}
    className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-sunset shadow-soft">
      <Icon className="h-6 w-6 text-primary-foreground" />
    </div>
    <h3 className="mt-4 font-display text-xl font-semibold text-secondary">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    <span className="mt-4 inline-block text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
      Browse →
    </span>
  </Link>
);

export default Index;
