import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="container px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="font-display text-xl font-semibold text-secondary">Vibely</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan any gathering — from a dinner for two to a wedding for two hundred.
            </p>
          </div>
          <FooterCol
            title="Discover"
            links={[
              { label: "Venues", to: "/explore?tab=venues" },
              { label: "Professionals", to: "/explore?tab=pros" },
              { label: "At-home experiences", to: "/explore?type=at-home" },
            ]}
          />
          <FooterCol
            title="For partners"
            links={[
              { label: "List your service", to: "/pros" },
              { label: "Vetting & trust", to: "/trust" },
              { label: "Partner portal", to: "/auth?mode=signup&role=pro" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "How it works", to: "/how-it-works" },
              { label: "Terms", to: "/terms" },
              { label: "Privacy", to: "/privacy" },
            ]}
          />
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vibely. Made for memorable moments.
        </p>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { label: string; to: string }[] }) => (
  <div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    <ul className="mt-3 space-y-2">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
