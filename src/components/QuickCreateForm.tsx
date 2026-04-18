import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, Users, Search, PartyPopper, Cake, Briefcase, Home } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EVENT_TYPES = [
  { id: "casual", label: "Casual meetup", icon: PartyPopper, hint: "2–10 people" },
  { id: "birthday", label: "Birthday & private", icon: Cake, hint: "Up to ~80" },
  { id: "corporate", label: "Wedding · Conference", icon: Briefcase, hint: "50–500+" },
  { id: "at-home", label: "At-home experience", icon: Home, hint: "Bring it in" },
] as const;

type EventTypeId = typeof EVENT_TYPES[number]["id"];

export const QuickCreateForm = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<EventTypeId>("casual");
  const [guests, setGuests] = useState<number>(6);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [city, setCity] = useState("");

  const guestLabel = guests >= 500 ? "500+" : String(guests);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      type,
      guests: String(guests),
      city,
      ...(date ? { date: date.toISOString() } : {}),
    });
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border/60 bg-card/95 p-5 shadow-elevated backdrop-blur-md sm:p-7"
    >
      <p className="font-display text-lg font-semibold text-secondary sm:text-xl">
        What are you planning?
      </p>

      {/* Event type chips */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EVENT_TYPES.map((t) => {
          const Icon = t.icon;
          const active = type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all",
                active
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="text-sm font-semibold leading-tight text-foreground">{t.label}</span>
              <span className="text-xs text-muted-foreground">{t.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Guests */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4 text-primary" /> Guests
          </label>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {guestLabel}
          </span>
        </div>
        <Slider
          value={[guests]}
          onValueChange={(v) => setGuests(v[0])}
          min={2}
          max={500}
          step={guests < 50 ? 1 : 10}
          className="mt-3"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>2</span>
          <span>50</span>
          <span>200</span>
          <span>500+</span>
        </div>
      </div>

      {/* Date + City */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-12 w-full justify-start rounded-xl border-border bg-background text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {date ? format(date, "EEE, MMM d") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or neighborhood"
            className="h-12 rounded-xl pl-10"
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-5 h-12 w-full rounded-xl bg-gradient-sunset text-base font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.01] hover:opacity-95"
      >
        <Search className="h-5 w-5" />
        Find options
      </Button>
    </form>
  );
};
