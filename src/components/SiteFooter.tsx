import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer className="border-t-2 border-border bg-card">
      <div className="container px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-foreground">Vibely</p>
            <p className="mt-2 text-base text-muted-foreground">
              Local community for adults 50+ — activities, circles, and neighbours nearby.
            </p>
          </div>
          <FooterCol
            title="Explore"
            links={[
              { label: "How it works", to: "/#how" },
              { label: "Join free", to: "/auth?mode=signup" },
              { label: "Sign in", to: "/auth" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "Terms", to: "/terms" },
              { label: "Privacy", to: "/privacy" },
            ]}
          />
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vibely. Built for connection, not clutter.
        </p>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, links }: { title: string; links: { label: string; to: string }[] }) => (
  <div>
    <p className="text-base font-bold text-foreground">{title}</p>
    <ul className="mt-3 space-y-2">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="text-base text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
