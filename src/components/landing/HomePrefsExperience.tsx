import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS } from "@/types/community";
import { listLocalities, nearestLocality } from "@/services/localities";
import type { CitySuggestion } from "@/services/places";
import {
  AGE_BAND_OPTIONS,
  MARITAL_OPTIONS,
  interestLabel,
  savePendingPrefs,
  type MaritalStatus,
} from "@/lib/pendingPrefs";

const encouragement = (opts: {
  ageBand: string;
  marital: MaritalStatus | "";
  city: string;
  interests: string[];
}): string => {
  const { ageBand, marital, city, interests } = opts;
  if (!ageBand) return "Tell us a little about you — we’ll match neighbours and activities that fit.";
  if (!marital) {
    if (ageBand === "under-50") return "Caregivers are welcome. Help someone you love stay connected.";
    return "Great decade to meet people who get your jokes.";
  }
  if (!city) {
    if (marital === "widowed") return "New company, at your pace. Where should we look first?";
    if (marital === "married" || marital === "partnered") return "Bring a partner — or make a morning just for you. Where do you live?";
    return "Your city is full of friendly faces. Where should we start?";
  }
  if (interests.length === 0) return `${city} is waking up. Tap a few things you enjoy — pick at least three.`;
  if (interests.length < 3) return `Nice — ${interests.length} so far. Two more and we can personalise your feed.`;
  const sample = interests.slice(0, 2).map(interestLabel).join(" & ");
  return `${sample} in ${city}? You’re going to like who’s nearby.`;
};

export const HomePrefsExperience = () => {
  const navigate = useNavigate();
  const [ageBand, setAgeBand] = useState("");
  const [marital, setMarital] = useState<MaritalStatus | "">("");
  const [city, setCity] = useState("");
  const [localityId, setLocalityId] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const localitiesQ = useQuery({ queryKey: ["localities"], queryFn: listLocalities });

  const message = useMemo(
    () => encouragement({ ageBand, marital, city, interests }),
    [ageBand, marital, city, interests],
  );

  const ready = Boolean(ageBand && marital && city.trim() && interests.length >= 3);

  const onCityChange = (value: string, suggestion?: CitySuggestion) => {
    setCity(value);
    const localities = localitiesQ.data ?? [];
    if (suggestion?.lat != null && suggestion?.lng != null) {
      const near = nearestLocality(localities, suggestion.lat, suggestion.lng);
      if (near) setLocalityId(near.id);
      return;
    }
    const match = localities.find(
      (l) =>
        l.name.toLowerCase() === value.toLowerCase() ||
        (l.city && l.city.toLowerCase() === value.toLowerCase()),
    );
    setLocalityId(match?.id ?? null);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  const continueToSignup = () => {
    if (!ready) return;
    savePendingPrefs({
      ageBand,
      maritalStatus: marital || undefined,
      city: city.trim(),
      localityId,
      interests,
    });
    navigate("/auth?mode=signup&next=/onboarding");
  };

  return (
    <section
      aria-labelledby="home-prefs-title"
      className="rounded-3xl border-2 border-border bg-card p-5 shadow-elevated sm:p-8"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          aria-hidden
        >
          <Sparkles className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-primary">About you</p>
          <h2 id="home-prefs-title" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Shape your neighbourhood
          </h2>
        </div>
      </div>

      <p
        className="mt-4 rounded-2xl border-2 border-primary/30 bg-muted px-4 py-3 text-base font-medium text-foreground"
        aria-live="polite"
        role="status"
      >
        {message}
      </p>

      <fieldset className="mt-8 space-y-3">
        <legend className="text-lg font-bold text-foreground">Your age</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Age band">
          {AGE_BAND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cn("pref-bubble", ageBand === opt.id && "is-selected")}
              aria-pressed={ageBand === opt.id}
              onClick={() => setAgeBand(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-3" disabled={!ageBand}>
        <legend className="text-lg font-bold text-foreground">Marital status</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Marital status">
          {MARITAL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={cn("pref-bubble", marital === opt.id && "is-selected")}
              aria-pressed={marital === opt.id}
              onClick={() => setMarital(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 space-y-3" disabled={!marital}>
        <legend className="text-lg font-bold text-foreground">Where you live</legend>
        <label htmlFor="home-city" className="sr-only">
          City or neighbourhood
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-foreground" aria-hidden />
          <CityAutocomplete
            id="home-city"
            value={city}
            onChange={onCityChange}
            placeholder="Neighbourhood or city"
            className="w-full"
            inputClassName="h-14 rounded-2xl border-2 border-border bg-background pl-11 text-lg font-medium text-foreground"
          />
        </div>
        {(localitiesQ.data?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested localities">
            {(localitiesQ.data ?? []).slice(0, 8).map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={cn("pref-bubble text-sm", localityId === loc.id && "is-selected")}
                aria-pressed={localityId === loc.id}
                onClick={() => {
                  setLocalityId(loc.id);
                  setCity(loc.city ? `${loc.name}, ${loc.city}` : loc.name);
                }}
              >
                {loc.name}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="mt-8 space-y-3" disabled={!city.trim()}>
        <legend className="text-lg font-bold text-foreground">
          Interests <span className="font-medium text-muted-foreground">(pick at least 3)</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                className={cn("pref-bubble", selected && "is-selected")}
                aria-pressed={selected}
                onClick={() => toggleInterest(interest)}
              >
                {interestLabel(interest)}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {interests.length} selected
          {interests.length >= 3 ? " · ready to go" : ` · ${Math.max(0, 3 - interests.length)} more needed`}
        </p>
      </fieldset>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          size="lg"
          disabled={!ready}
          onClick={continueToSignup}
          className="h-14 min-w-[14rem] rounded-2xl bg-accent text-lg font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          See what’s near me <ArrowRight className="ml-1 h-5 w-5" aria-hidden />
        </Button>
        <p className="text-sm font-medium text-muted-foreground">
          Free to join. No password needed — Google, Facebook, or email link.
        </p>
      </div>
    </section>
  );
};
