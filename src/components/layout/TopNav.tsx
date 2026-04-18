import { Link, NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/discover", label: "Discover" },
  { to: "/events", label: "My events" },
  { to: "/pros", label: "For professionals" },
];

const TopNav = () => {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-background/80 backdrop-blur-md md:block">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-sunset shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">Vibely</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/auth?mode=signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
