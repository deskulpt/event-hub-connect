import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles, PartyPopper, Briefcase, Building2, Check, ArrowRight, MapPin,
  Calendar as CalendarIcon, Users, Heart,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { readPendingBrief, clearPendingBrief, briefToTitle, briefToEventTypeSlug } from "@/lib/pendingBrief";
import { createEvent } from "@/services/events";
import { listLocalities, nearestLocality } from "@/services/localities";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { INTEREST_OPTIONS, type AccessibilityPrefs } from "@/types/community";
import type { CitySuggestion } from "@/services/places";

const AGE_BANDS = ["50-54", "55-59", "60-64", "65-69", "70-74", "75+"] as const;

const roleOptions: { id: AppRole; title: string; desc: string; icon: React.ElementType; gradient: string }[] = [
  { id: "member", title: "I'm a Member", desc: "Discover nearby activities, vote, and join circles.", icon: Heart, gradient: "bg-gradient-mint" },
  { id: "host", title: "I'm a Host", desc: "Plan events for myself, my family, or my company.", icon: PartyPopper, gradient: "bg-gradient-sunset" },
  { id: "pro", title: "I'm a Pro", desc: "Independent artist, chef, photographer, planner, DJ.", icon: Briefcase, gradient: "bg-gradient-aurora" },
  { id: "business", title: "I'm a Business", desc: "Venue, vendor, supplier, or multi-location operator.", icon: Building2, gradient: "bg-gradient-ocean" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const brief = useMemo(() => readPendingBrief(), []);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<AppRole[]>(["member"]);
  const [active, setActive] = useState<AppRole>("member");
  const [eventTitle, setEventTitle] = useState<string>(brief ? briefToTitle(brief) : "");
  const [ageBand, setAgeBand] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [city, setCity] = useState(brief?.city ?? "");
  const [localityId, setLocalityId] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilityPrefs>({
    textScale: "normal",
    contrast: "normal",
    reduceMotion: false,
  });
  const [loading, setLoading] = useState(false);

  const localitiesQ = useQuery({ queryKey: ["localities"], queryFn: listLocalities });

  useEffect(() => {
    if (brief?.city && localitiesQ.data?.length) {
      const match = localitiesQ.data.find(
        (l) =>
          l.name.toLowerCase().includes(brief.city!.toLowerCase()) ||
          (l.city && l.city.toLowerCase().includes(brief.city!.toLowerCase())),
      );
      if (match) setLocalityId(match.id);
    }
  }, [brief?.city, localitiesQ.data]);

  const toggle = (r: AppRole) => {
    setSelected((s) => {
      const has = s.includes(r);
      const next = has ? s.filter((x) => x !== r) : [...s, r];
      if (next.length === 0) return s;
      if (has && active === r) setActive(next[0]);
      if (!has) setActive(r);
      return next;
    });
  };

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

  const finish = async () => {
    if (!user) return;
    if (!ageBand) {
      toast.error("Please choose your age band");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      for (const role of selected) {
        const { error: rolesErr } = await supabase.rpc("claim_self_service_role", { _role: role });
        if (rolesErr) throw rolesErr;
      }

      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          active_role: active,
          onboarded: true,
          age_band: ageBand,
          preferred_language: language,
          locality_id: localityId,
          interests,
          accessibility_prefs: accessibility,
        })
        .eq("id", user.id);
      if (profErr) throw profErr;

      await refreshProfile();

      if (active === "host") {
        const title = eventTitle.trim() || "My first event";
        const ev = await createEvent(
          {
            title,
            event_type: briefToEventTypeSlug(brief?.type) as never,
            event_date: brief?.date ? brief.date.slice(0, 10) : "",
            city: city || brief?.city || "",
            guest_count: brief?.guests ?? ("" as never),
            budget: "" as never,
            vibe: "",
            dietary_notes: "",
            accessibility_notes: "",
            status: "draft",
          },
          user.id,
        );
        clearPendingBrief();
        navigate(`/app/events/${ev.id}`);
        return;
      }

      clearPendingBrief();
      navigate("/app");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canContinueRole = selected.length > 0;
  const canContinuePrefs = Boolean(ageBand) && interests.length >= 1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh px-4 py-12">
      <div className="orb left-[-10%] top-[-10%] h-96 w-96 bg-gradient-sunset opacity-40" />
      <div className="orb right-[-15%] bottom-[-10%] h-[420px] w-[420px] bg-gradient-aurora opacity-30" />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-sunset shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-secondary sm:text-5xl">
            {step === 0 && <>How will you use <span className="text-gradient">Vibely</span>?</>}
            {step === 1 && <>Make it <span className="text-gradient">yours</span></>}
            {step === 2 && active === "host" && <>Your first <span className="text-gradient">activity</span></>}
            {step === 2 && active !== "host" && <>You're <span className="text-gradient">ready</span></>}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {step === 0 && "Pick one or more — you can switch any time."}
            {step === 1 && "Age band, locality, language, interests and accessibility."}
            {step === 2 && (active === "host" ? "Confirm your first activity and go." : "Enter your community home.")}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn("h-1.5 w-8 rounded-full", i <= step ? "bg-primary" : "bg-border")}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {roleOptions.map((r) => {
                const isSel = selected.includes(r.id);
                const isActive = active === r.id && isSel;
                const Icon = r.icon;
                return (
                  <Card
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className={cn("bento relative cursor-pointer transition-all", isSel ? "ring-2 ring-primary" : "")}
                  >
                    <CardContent className="relative p-6">
                      <div className={cn("orb -right-12 -top-12 h-40 w-40", r.gradient)} />
                      <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-soft", r.gradient)}>
                        <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.2} />
                      </div>
                      {isSel && (
                        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </div>
                      )}
                      <h3 className="mt-4 font-display text-lg font-semibold text-secondary">{r.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                      {isSel && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActive(r.id); }}
                          className={cn(
                            "mt-4 w-full rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                            isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                          )}
                        >
                          {isActive ? "✓ Default home" : "Make default"}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                disabled={!canContinueRole}
                onClick={() => setStep(1)}
                className="h-12 rounded-full bg-gradient-sunset px-8 font-semibold text-primary-foreground"
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="bento space-y-6 p-6 sm:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Age band</p>
              <div className="flex flex-wrap gap-1.5">
                {AGE_BANDS.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => setAgeBand(band)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs tab-num transition-colors",
                      ageBand === band
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Language</p>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      language === lang.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Locality</p>
              <CityAutocomplete value={city} onChange={onCityChange} placeholder="Your neighbourhood or city" />
              {(localitiesQ.data ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(localitiesQ.data ?? []).slice(0, 8).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setLocalityId(loc.id);
                        setCity(loc.name);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        localityId === loc.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Interests (pick at least 1)</p>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const selectedInterest = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        setInterests(
                          selectedInterest
                            ? interests.filter((i) => i !== interest)
                            : [...interests, interest],
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                        selectedInterest
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Accessibility</p>
              <div className="flex flex-wrap gap-1.5">
                {(["normal", "large", "xlarge"] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setAccessibility((a) => ({ ...a, textScale: scale }))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
                      accessibility.textScale === scale
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    Text {scale}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setAccessibility((a) => ({
                      ...a,
                      contrast: a.contrast === "high" ? "normal" : "high",
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    accessibility.contrast === "high"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  High contrast
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAccessibility((a) => ({ ...a, reduceMotion: !a.reduceMotion }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    accessibility.reduceMotion
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  Reduce motion
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
              <Button
                size="lg"
                disabled={!canContinuePrefs}
                onClick={() => setStep(2)}
                className="h-12 rounded-full bg-gradient-sunset px-8 font-semibold text-primary-foreground"
              >
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            {active === "host" && (
              <div className="bento p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your first activity</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-secondary">
                  {brief ? "Looks great — let's lock it in." : "Name your first activity"}
                </h2>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Activity name</label>
                  <Input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Morning walk club kickoff"
                    className="h-11 rounded-xl"
                  />
                </div>
                {brief && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brief.guests && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        <Users className="h-3.5 w-3.5 text-primary" /> {brief.guests} guests
                      </span>
                    )}
                    {brief.date && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {format(new Date(brief.date), "EEE, MMM d")}
                      </span>
                    )}
                    {(city || brief.city) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {city || brief.city}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {active !== "host" && (
              <div className="bento p-6 text-center sm:p-8">
                <p className="font-display text-xl font-semibold">
                  Language {language.toUpperCase()} · {ageBand} · {interests.length} interests
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {localityId ? "Locality saved." : "You can set locality later in Settings."}
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button
                size="lg"
                onClick={finish}
                disabled={loading || (active === "host" && eventTitle.trim().length < 2)}
                className="h-12 rounded-full bg-gradient-sunset px-8 font-semibold text-primary-foreground"
              >
                {loading ? "Setting up…" : active === "host" ? "Create my activity" : "Enter Vibely"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
