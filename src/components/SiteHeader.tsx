import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
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
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunset shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight text-secondary">
            Vibely
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#how" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            How it works
          </a>
          <Link to="/auth?mode=signup&role=pro" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            For pros
          </Link>
          <Link to="/auth?mode=signup&role=business" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            For businesses
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" className="rounded-full bg-gradient-sunset font-semibold text-primary-foreground hover:opacity-95">
              <Link to="/app">Open app <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gradient-sunset font-semibold text-primary-foreground hover:opacity-95">
                <Link to="/auth?mode=signup">Start planning</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
