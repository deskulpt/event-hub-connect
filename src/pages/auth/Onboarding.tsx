import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, PartyPopper, Briefcase, Building2, Check, ArrowRight, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { readPendingBrief, clearPendingBrief, briefToTitle, briefToEventTypeSlug } from "@/lib/pendingBrief";
import { createEvent } from "@/services/events";

const roleOptions: { id: AppRole; title: string; desc: string; icon: React.ElementType; gradient: string }[] = [
  { id: "host", title: "I'm a Host", desc: "Plan events for myself, my family, or my company.", icon: PartyPopper, gradient: "bg-gradient-sunset" },
  { id: "pro", title: "I'm a Pro", desc: "Independent artist, chef, photographer, planner, DJ.", icon: Briefcase, gradient: "bg-gradient-aurora" },
  { id: "business", title: "I'm a Business", desc: "Venue, vendor, supplier, or multi-location operator.", icon: Building2, gradient: "bg-gradient-ocean" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const brief = useMemo(() => readPendingBrief(), []);
  const [selected, setSelected] = useState<AppRole[]>(["host"]);
  const [active, setActive] = useState<AppRole>("host");
  const [eventTitle, setEventTitle] = useState<string>(brief ? briefToTitle(brief) : "");
  const [loading, setLoading] = useState(false);

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

  const finish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      for (const role of selected) {
        const { error: rolesErr } = await supabase.rpc("claim_self_service_role", { _role: role });
        if (rolesErr) throw rolesErr;
      }


      const { error: profErr } = await supabase
        .from("profiles")
        .update({ active_role: active, onboarded: true })
        .eq("id", user.id);
      if (profErr) throw profErr;

      await refreshProfile();

      // Create first event for hosts
      if (active === "host") {
        const title = eventTitle.trim() || "My first event";
        const ev = await createEvent(
          {
            title,
            event_type: briefToEventTypeSlug(brief?.type) as never,
            event_date: brief?.date ? brief.date.slice(0, 10) : "",
            city: brief?.city ?? "",
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh px-4 py-12">
      <div className="orb left-[-10%] top-[-10%] h-96 w-96 bg-gradient-sunset opacity-40" />
      <div className="orb right-[-15%] bottom-[-10%] h-[420px] w-[420px] bg-gradient-aurora opacity-30" />

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-sunset shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-secondary sm:text-5xl">
            How will you use <span className="text-gradient">Vibely</span>?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pick one or more — you can switch any time. Your default sets your home dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roleOptions.map((r) => {
            const isSel = selected.includes(r.id);
            const isActive = active === r.id && isSel;
            const Icon = r.icon;
            return (
              <Card
                key={r.id}
                onClick={() => toggle(r.id)}
                className={cn(
                  "bento relative cursor-pointer transition-all",
                  isSel ? "ring-2 ring-primary" : "",
                )}
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
                        isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
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

        {/* Confirm + first event */}
        {active === "host" && (
          <div className="bento mt-8 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step 2 · Your first event</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-secondary">
              {brief ? "Looks great — let's lock it in." : "Name your first event"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Event name</label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Sarah's 30th birthday"
                  className="h-11 rounded-xl"
                />
              </div>
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
                {brief.city && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {brief.city}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            onClick={finish}
            disabled={loading || selected.length === 0 || (active === "host" && eventTitle.trim().length < 2)}
            className="h-12 rounded-full bg-gradient-sunset px-8 font-semibold text-primary-foreground hover:opacity-95"
          >
            {loading ? "Setting up…" : active === "host" ? "Create my event" : "Enter Vibely"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
