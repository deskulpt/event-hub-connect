import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, PartyPopper, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const roleOptions: { id: AppRole; title: string; desc: string; icon: React.ElementType }[] = [
  { id: "host", title: "I'm a Host", desc: "Plan events for myself, my family, or my company.", icon: PartyPopper },
  { id: "pro", title: "I'm a Pro", desc: "Independent artist, chef, photographer, planner, DJ.", icon: Briefcase },
  { id: "business", title: "I'm a Business", desc: "Venue, vendor, supplier, or multi-location operator.", icon: Building2 },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<AppRole[]>(["host"]);
  const [active, setActive] = useState<AppRole>("host");
  const [loading, setLoading] = useState(false);

  const toggle = (r: AppRole) => {
    setSelected((s) => {
      const has = s.includes(r);
      const next = has ? s.filter((x) => x !== r) : [...s, r];
      if (next.length === 0) return s;
      if (has && active === r) setActive(next[0]);
      return next;
    });
  };

  const finish = async () => {
    if (!user) return;
    setLoading(true);
    const rows = selected.map((role) => ({ user_id: user.id, role }));
    const { error: rolesErr } = await supabase.from("user_roles").upsert(rows, { onConflict: "user_id,role" });
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ active_role: active, onboarded: true })
      .eq("id", user.id);
    setLoading(false);
    if (rolesErr || profErr) return toast.error((rolesErr || profErr)!.message);
    await refreshProfile();
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/40 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-sunset shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">How will you use Vibely?</h1>
          <p className="mt-2 text-muted-foreground">Pick one or more — you can switch any time. Your default sets your home dashboard.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {roleOptions.map((r) => {
            const isSel = selected.includes(r.id);
            const isActive = active === r.id;
            return (
              <Card
                key={r.id}
                onClick={() => toggle(r.id)}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSel ? "border-primary ring-2 ring-primary/30" : "border-border",
                )}
              >
                <CardContent className="p-5">
                  <r.icon className="mb-3 h-6 w-6 text-primary" />
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                  {isSel && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActive(r.id); }}
                      className={cn(
                        "mt-3 w-full rounded-md border px-2 py-1 text-xs",
                        isActive ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      )}
                    >
                      {isActive ? "Default home" : "Make default"}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={finish} disabled={loading || selected.length === 0}>
            {loading ? "Setting up…" : "Enter Vibely"}
          </Button>
        </div>
      </div>
    </div>
  );
}
