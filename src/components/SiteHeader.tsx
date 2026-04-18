import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
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
          <Link to="/explore" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            Explore
          </Link>
          <Link to="/pros" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            For pros
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
            How it works
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/auth?mode=signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
