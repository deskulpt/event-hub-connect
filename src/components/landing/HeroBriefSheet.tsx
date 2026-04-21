import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, ArrowRight, PartyPopper, Cake, Briefcase, Heart, Mic, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { savePendingBrief } from "@/lib/pendingBrief";
import { CityAutocomplete } from "@/components/CityAutocomplete";

const EVENT_CHIPS = [
  { id: "casual", label: "Casual", icon: PartyPopper },
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "wedding", label: "Wedding", icon: Heart },
  { id: "corporate", label: "Offsite", icon: Briefcase },
  { id: "conference", label: "Conference", icon: Mic },
  { id: "dinner", label: "Dinner party", icon: Utensils },
] as const;

export const HeroBriefSheet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState("");
  const [type, setType] = useState<string>("casual");
  const [guests, setGuests] = useState<number>(12);
  const [date, setDate] = useState<Date | undefined>();
  const [city, setCity] = useState("");

  const guestLabel = guests >= 500 ? "500+" : String(guests);

  const handleStart = (presetType?: string) => {
    if (presetType) setType(presetType);
    setOpen(true);
  };

  const handleSubmit = () => {
    const brief = {
      type,
      guests,
      date: date?.toISOString(),
      city: city.trim(),
      title: intent.trim() || undefined,
    };
    savePendingBrief(brief);
    setOpen(false);
    if (user) navigate("/onboarding");
    else navigate("/auth?mode=signup&next=/onboarding");
  };

  return (
    <>
      {/* Hero search pill */}
      <div className="relative mt-7 max-w-2xl">
        <div className="glass flex items-center gap-2 rounded-full p-2 shadow-elevated">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-sunset">
            <PartyPopper className="h-5 w-5 text-primary-foreground" />
          </div>
          <Input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="What are you planning?"
            className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          <Button
            size="lg"
            onClick={() => handleStart()}
            className="h-12 rounded-full bg-gradient-sunset px-6 font-semibold text-primary-foreground shadow-soft hover:opacity-95"
          >
            Start planning
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Suggestion chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {EVENT_CHIPS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleStart(c.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-md transition-all hover:bg-white/20"
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl sm:max-w-2xl sm:left-1/2 sm:-translate-x-1/2 sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Tell us a bit more</SheetTitle>
          </SheetHeader>

          <div className="mt-5 space-y-5">
            {/* Type chips */}
            <div>
              <p className="mb-2 text-sm font-medium">What kind of event?</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {EVENT_CHIPS.map((c) => {
                  const Icon = c.icon;
                  const active = type === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setType(c.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs font-medium transition-all",
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-soft"
                          : "border-border bg-background hover:border-primary/40",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guests */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" /> Guests
                </label>
                <span className="tab-num rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {guestLabel}
                </span>
              </div>
              <Slider
                value={[guests]}
                onValueChange={(v) => setGuests(v[0])}
                min={2}
                max={500}
                step={guests < 50 ? 1 : 10}
              />
            </div>

            {/* Date + City */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("h-11 w-full justify-start rounded-xl", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, "EEE, MMM d") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              <CityAutocomplete
                id="hero-city"
                value={city}
                onChange={(v) => setCity(v)}
                placeholder="City"
                inputClassName="h-11 rounded-xl"
              />
            </div>

            <Button
              size="lg"
              onClick={handleSubmit}
              className="h-12 w-full rounded-xl bg-gradient-sunset font-semibold text-primary-foreground hover:opacity-95"
            >
              {user ? "Create my event" : "Continue — sign up takes 10s"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">No credit card. Cancel anytime.</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
