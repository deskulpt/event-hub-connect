import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SiteHeaderProps {
  scrolled?: boolean;
}

export const SiteHeader = ({ scrolled = false }: SiteHeaderProps) => {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b-2 transition-colors",
        scrolled ? "border-border bg-card" : "border-transparent bg-background",
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Vibely home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Vibely
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <a href="#how" className="text-base font-bold text-foreground hover:text-primary">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="lg" className="h-11 rounded-full bg-primary px-5 font-bold text-primary-foreground hover:bg-primary/90">
              <Link to="/app">
                Open app <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="lg" className="hidden h-11 rounded-full border-2 border-border px-5 font-bold sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="lg" className="h-11 rounded-full bg-accent px-5 font-bold text-accent-foreground hover:bg-accent/90">
                <Link to="/auth?mode=signup">Join free</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
