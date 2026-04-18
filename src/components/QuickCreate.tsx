import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { EVENT_TYPES, EventType } from "@/data/mock";
import { cn } from "@/lib/utils";

const QuickCreate = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<EventType>("meetup");
  const [guests, setGuests] = useState(8);
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type,
      guests: String(guests),
      city,
      date,
    });
    navigate(`/discover?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border md:p-7"
      aria-label="Quick create event"
    >
      <h2 className="font-display text-xl font-semibold md:text-2xl">What are you planning?</h2>

      {/* Event type chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {EVENT_TYPES.map((t) => {
          const active = t.id === type;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              aria-pressed={active}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted",
              )}
            >
              <span aria-hidden>{t.emoji}</span>
              <span>{t.label}</span>
              <span
                className={cn(
                  "hidden text-xs opacity-70 sm:inline",
                  active ? "text-primary-foreground" : "text-muted-foreground",
                )}
              >
                · {t.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guests slider */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="guests" className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" /> Guests
          </label>
          <span className="font-display text-lg font-semibold">
            {guests}
            {guests >= 500 ? "+" : ""}
          </span>
        </div>
        <Slider
          id="guests"
          aria-label="Number of guests"
          min={2}
          max={500}
          step={guests < 50 ? 1 : 10}
          value={[guests]}
          onValueChange={(v) => setGuests(v[0])}
          className="mt-3"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>2</span>
          <span>500+</span>
        </div>
      </div>

      {/* City & date */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="City (e.g. Lisbon)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 rounded-lg pl-9"
            aria-label="City"
          />
        </div>
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 rounded-lg pl-9"
            aria-label="Event date"
          />
        </div>
      </div>

      <Button type="submit" variant="hero" size="xl" className="mt-5 w-full">
        <Search className="h-5 w-5" /> Find options
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Browse free · Log in only when you're ready to book.
      </p>
    </form>
  );
};

export default QuickCreate;
