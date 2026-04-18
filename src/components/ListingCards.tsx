import { Star, Users, MapPin, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pro, Venue, showRating } from "@/data/mock";

const priceLabel = (p: 1 | 2 | 3 | 4) => "€".repeat(p);

export const VenueCard = ({ venue }: { venue: Venue }) => (
  <Card className="group overflow-hidden rounded-2xl border-border/60 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={venue.image}
        alt={venue.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
        {priceLabel(venue.priceLevel)}
      </span>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold leading-tight">{venue.name}</h3>
        {showRating(venue.reviewCount) && venue.rating && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {venue.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {venue.city}
      </div>
      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-3.5 w-3.5" /> Up to {venue.capacity} guests
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {venue.tags.map((t) => (
          <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground/70">
            {t}
          </span>
        ))}
      </div>
    </div>
  </Card>
);

export const ProCard = ({ pro }: { pro: Pro }) => (
  <Card className="group overflow-hidden rounded-2xl border-border/60 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={pro.image}
        alt={pro.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {pro.verified && (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-secondary/95 px-2.5 py-1 text-xs font-semibold text-secondary-foreground backdrop-blur">
          <BadgeCheck className="h-3.5 w-3.5" /> Verified
        </span>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{pro.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{pro.category}</p>
        </div>
        {showRating(pro.reviewCount) && pro.rating && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {pro.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {pro.city}
        </span>
        <span className="font-medium">
          from <span className="font-display text-base font-semibold">€{pro.priceFrom}</span>
        </span>
      </div>
    </div>
  </Card>
);
