import { Star } from "lucide-react";

const QUOTES = [
  {
    quote: "We planned my sister's wedding in three evenings. The Fit Score nailed our venue on try one.",
    name: "Maya R.",
    role: "Host · Brooklyn",
  },
  {
    quote: "Bookings doubled the month I joined. The CRM keeps every conversation in one place.",
    name: "Diego A.",
    role: "DJ · Austin",
  },
  {
    quote: "Finally one tool for inquiries, calendar, and payouts. Saved us an admin hire.",
    name: "Ananya P.",
    role: "Venue manager · SF",
  },
];

export const Testimonials = () => (
  <section className="bg-muted/30">
    <div className="container px-4 py-16 sm:py-20">
      <div className="mb-8 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Loved by hosts & pros</p>
        <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-secondary sm:text-4xl">
          Real events. Real people.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {QUOTES.map((q) => (
          <div key={q.name} className="bento p-6">
            <div className="flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground">"{q.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-sunset font-display text-sm font-semibold text-primary-foreground">
                {q.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
