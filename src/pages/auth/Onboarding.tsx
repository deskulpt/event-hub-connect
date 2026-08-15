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
  Calendar as CalendarIcon, Users, Heart, Languages,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { readPendingBrief, clearPendingBrief, briefToTitle, briefToEventTypeSlug } from "@/lib/pendingBrief";
import {
  readPendingPrefs,
  clearPendingPrefs,
  interestLabel,
  MARITAL_OPTIONS,
  type MaritalStatus,
} from "@/lib/pendingPrefs";
import { createEvent } from "@/services/events";
import { listLocalities, nearestLocality } from "@/services/localities";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { SUPPORTED_LANGUAGES, translate, type LanguageCode } from "@/lib/i18n";
import { INTEREST_OPTIONS, type AccessibilityPrefs } from "@/types/community";
import type { CitySuggestion } from "@/services/places";

const AGE_BANDS = ["50-54", "55-59", "60-64", "65-69", "70-74", "75+", "under-50"] as const;

/** Steps match PRD §3.1: language → age → prefs → role/confirm */
const STEPS = ["language", "age", "prefs", "role"] as const;

const roleOptions: { id: AppRole; title: string; desc: string; icon: React.ElementType; solid: string }[] = [
  { id: "member", title: "I'm a Member", desc: "Discover nearby activities, vote, and join circles.", icon: Heart, solid: "bg-success" },
  { id: "host", title: "I'm a Host", desc: "Plan activities for family, friends, or a group.", icon: PartyPopper, solid: "bg-primary" },
  { id: "pro", title: "I'm a Pro", desc: "Instructor, guide, therapist, musician, or trainer.", icon: Briefcase, solid: "bg-secondary" },
  { id: "business", title: "I'm a Business", desc: "Venue, sponsor, NGO, or multi-location operator.", icon: Building2, solid: "bg-tertiary" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const brief = useMemo(() => readPendingBrief(), []);
  const pending = useMemo(() => readPendingPrefs(), []);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<AppRole[]>(["member"]);
  const [active, setActive] = useState<AppRole>("member");
  const [eventTitle, setEventTitle] = useState<string>(brief ? briefToTitle(brief) : "");
  const [ageBand, setAgeBand] = useState(pending?.ageBand ?? "");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | "">(pending?.maritalStatus ?? "");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [city, setCity] = useState(pending?.city ?? brief?.city ?? "");
  const [localityId, setLocalityId] = useState<string | null>(pending?.localityId ?? null);
  const [interests, setInterests] = useState<string[]>(pending?.interests ?? []);
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [accessibility, setAccessibility] = useState<AccessibilityPrefs>({
    textScale: "large",
    contrast: "high",
    reduceMotion: false,
    readAloud: false,
  });
  const [voiceFirst, setVoiceFirst] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (key: string) => translate(language, key);
  const localitiesQ = useQuery({ queryKey: ["localities"], queryFn: listLocalities });

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", language === "ur" ? "rtl" : "ltr");
  }, [language]);

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
      toast.error(t("onboarding.ageRequired"));
      setStep(1);
      return;
    }
    if (interests.length < 3) {
      toast.error(t("onboarding.interestsMin"));
      setStep(2);
      return;
    }
    if (!localityId) {
      toast.error("Pick a locality near you so we can show nearby activities.");
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      for (const role of selected) {
        const { error: rolesErr } = await supabase.rpc("claim_self_service_role", { _role: role });
        if (rolesErr) throw rolesErr;
      }

      const prefsPayload = {
        ...accessibility,
        caregiverName: caregiverName.trim() || undefined,
        caregiverPhone: caregiverPhone.trim() || undefined,
      };

      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          active_role: active,
          onboarded: true,
          age_band: ageBand,
          marital_status: maritalStatus || null,
          preferred_language: language,
          locality_id: localityId,
          interests,
          accessibility_prefs: prefsPayload,
          voice_first_enabled: voiceFirst,
        })
        .eq("id", user.id);
      if (profErr) throw profErr;

      await refreshProfile();

      if (active === "host") {
        const title = eventTitle.trim() || "My first activity";
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
        clearPendingPrefs();
        navigate(`/app/events/${ev.id}`);
        return;
      }

      clearPendingBrief();
      clearPendingPrefs();
      navigate("/app");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canLeaveLanguage = Boolean(language);
  const canLeaveAge = Boolean(ageBand);
  const canLeavePrefs = interests.length >= 3;
  const canFinish =
    selected.length > 0 &&
    (active !== "host" || eventTitle.trim().length >= 2);

  return (
    <div className="relative min-h-screen bg-background px-4 py-12">
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {step === 0 && <>{t("onboarding.langTitle")}</>}
            {step === 1 && <>{t("onboarding.ageTitle")}</>}
            {step === 2 && <>{t("onboarding.prefsTitle")}</>}
            {step === 3 && <>{t("onboarding.roleTitle")} <span className="text-primary">Vibely</span>?</>}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {step === 0 && t("onboarding.langSubtitle")}
            {step === 1 && t("onboarding.ageSubtitle")}
            {step === 2 && t("onboarding.prefsSubtitle")}
            {step === 3 && t("onboarding.roleSubtitle")}
          </p>
          <div className="mt-4 flex justify-center gap-2" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={STEPS[i]}
                className={cn("h-2 w-10 rounded-full", i <= step ? "bg-primary" : "bg-border")}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="bento space-y-6 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-primary">
              <Languages className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wider">{t("onboarding.language")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-colors",
                    language === lang.code
                      ? "border-primary bg-primary/10 ring-2 ring-primary"
                      : "border-border/60 hover:bg-muted/50",
                  )}
                >
                  <p className="font-display text-lg font-semibold">{lang.native}</p>
                  <p className="text-xs text-muted-foreground">{lang.label}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                size="lg"
                disabled={!canLeaveLanguage}
                onClick={() => setStep(1)}
                className="h-12 rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
              >
                {t("common.continue")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bento space-y-6 p-6 sm:p-8">
            <p className="text-base font-bold text-foreground">{t("onboarding.ageBand")}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("onboarding.ageBand")}>
              {AGE_BANDS.map((band) => (
                <button
                  key={band}
                  type="button"
                  onClick={() => setAgeBand(band)}
                  className={cn("pref-bubble", ageBand === band && "is-selected")}
                  aria-pressed={ageBand === band}
                >
                  {band === "under-50" ? t("onboarding.under50") : band}
                </button>
              ))}
            </div>
            {ageBand === "under-50" && (
              <p className="rounded-2xl border-2 border-border bg-muted p-4 text-base text-foreground">
                {t("onboarding.caregiverPath")}
              </p>
            )}
            <p className="text-base font-bold text-foreground">Marital status</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Marital status">
              {MARITAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMaritalStatus(opt.id)}
                  className={cn("pref-bubble", maritalStatus === opt.id && "is-selected")}
                  aria-pressed={maritalStatus === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>{t("common.back")}</Button>
              <Button
                size="lg"
                disabled={!canLeaveAge}
                onClick={() => setStep(2)}
                className="h-12 rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
              >
                {t("common.continue")} <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bento space-y-6 p-6 sm:p-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{t("onboarding.locality")}</p>
              <CityAutocomplete value={city} onChange={onCityChange} placeholder={t("onboarding.cityPlaceholder")} />
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
                        "min-h-10 rounded-full border px-3 py-1 text-xs transition-colors",
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                {t("onboarding.interests")} ({interests.length}/3+)
              </p>
              <div className="flex flex-wrap gap-2">
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
                      className={cn("pref-bubble", selectedInterest && "is-selected")}
                      aria-pressed={selectedInterest}
                    >
                      {interestLabel(interest)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{t("onboarding.accessibility")}</p>
              <div className="flex flex-wrap gap-1.5">
                {(["normal", "large", "xlarge"] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setAccessibility((a) => ({ ...a, textScale: scale }))}
                    className={cn(
                      "min-h-10 rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
                      accessibility.textScale === scale
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {t(`a11y.text.${scale}`)}
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
                    "min-h-10 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    accessibility.contrast === "high"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {t("a11y.highContrast")}
                </button>
                <button
                  type="button"
                  onClick={() => setAccessibility((a) => ({ ...a, reduceMotion: !a.reduceMotion }))}
                  className={cn(
                    "min-h-10 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    accessibility.reduceMotion
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {t("a11y.reduceMotion")}
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceFirst((v) => !v)}
                  className={cn(
                    "min-h-10 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    voiceFirst
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {t("a11y.voiceFirst")}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                {t("onboarding.caregiverOptional")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder={t("onboarding.caregiverName")}
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="h-11 rounded-xl"
                  aria-label={t("onboarding.caregiverName")}
                />
                <Input
                  placeholder={t("onboarding.caregiverPhone")}
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  className="h-11 rounded-xl"
                  aria-label={t("onboarding.caregiverPhone")}
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>{t("common.back")}</Button>
              <Button
                size="lg"
                disabled={!canLeavePrefs}
                onClick={() => setStep(3)}
                className="h-12 rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
              >
                {t("common.continue")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
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
                      <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-soft", r.solid)}>
                        <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                      </div>
                      {isSel && (
                        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                          <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                        </div>
                      )}
                      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{r.title}</h3>
                      <p className="mt-1 text-base text-muted-foreground">{r.desc}</p>
                      {isSel && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActive(r.id); }}
                          className={cn(
                            "mt-4 min-h-10 w-full rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                            isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                          )}
                        >
                          {isActive ? t("onboarding.defaultHome") : t("onboarding.makeDefault")}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {active === "host" && (
              <div className="bento mt-6 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("onboarding.firstActivity")}</p>
                <div className="mt-4">
                  <Input
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder={t("onboarding.activityName")}
                    className="h-11 rounded-xl"
                  />
                </div>
                {brief && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brief.guests && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        <Users className="h-3.5 w-3.5 text-primary" /> {brief.guests}
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

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>{t("common.back")}</Button>
              <Button
                size="lg"
                onClick={finish}
                disabled={loading || !canFinish}
                className="h-12 rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
              >
                {loading
                  ? t("common.loading")
                  : active === "host"
                    ? t("onboarding.createActivity")
                    : t("onboarding.enter")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
