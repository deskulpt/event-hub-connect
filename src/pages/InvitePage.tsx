import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Sparkles, CalendarDays, MapPin, Users, MessageCircle, Copy } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BentoCard, GradientOrb } from "@/components/shell/Bento";
import { getInviteBySlug } from "@/services/invites";
import { supabase } from "@/integrations/supabase/client";

export default function InvitePage() {
  const { slug } = useParams<{ slug: string }>();

  const inviteQ = useQuery({
    queryKey: ["invite", slug],
    queryFn: () => getInviteBySlug(slug!),
    enabled: !!slug,
  });

  const eventQ = useQuery({
    queryKey: ["invite-event", inviteQ.data?.event_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("title,event_date,city,guest_count,event_type,vibe").eq("id", inviteQ.data!.event_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!inviteQ.data?.event_id,
  });

  if (inviteQ.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading invite…</div>;
  }

  const invite = inviteQ.data;
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-xl">Invite not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This invite link may have been removed.</p>
          <Button asChild className="mt-4"><Link to="/">Home</Link></Button>
        </div>
      </div>
    );
  }

  const event = eventQ.data;
  const link = window.location.href;
  const shareText = `${invite.headline ?? ""}\n${invite.copy ?? ""}\n${link}`;
  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => { await navigator.clipboard.writeText(link); toast.success("Link copied"); };

  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh px-4 py-10">
      <div className="orb left-[-15%] top-[-10%] h-[480px] w-[480px] bg-gradient-sunset opacity-30" />
      <div className="orb bottom-[-20%] right-[-10%] h-[520px] w-[520px] bg-gradient-aurora opacity-25" />

      <div className="relative mx-auto max-w-2xl">
        <BentoCard className="overflow-hidden p-0">
          {invite.image_url && (
            <img src={invite.image_url} alt="" className="h-72 w-full object-cover" />
          )}
          <div className="relative space-y-4 p-6">
            <GradientOrb color="primary" className="-top-10 -right-10 h-40 w-40" />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3 w-3" /> You're invited
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">{invite.headline ?? "You're invited"}</h1>
              {invite.copy && <p className="mt-3 text-base leading-relaxed text-foreground/90">{invite.copy}</p>}

              {event && (
                <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
                  {event.event_date && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/40 p-2.5">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="tabular-nums">{format(parseISO(event.event_date), "EEE, MMM d")}</span>
                    </div>
                  )}
                  {event.city && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/40 p-2.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.city}</span>
                    </div>
                  )}
                  {event.guest_count != null && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/40 p-2.5">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{event.guest_count} guests</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={whatsapp}><MessageCircle className="mr-1 h-4 w-4" /> Share on WhatsApp</Button>
                <Button variant="outline" onClick={copyLink}><Copy className="mr-1 h-4 w-4" /> Copy link</Button>
              </div>
            </div>
          </div>
        </BentoCard>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <Link to="/" className="text-primary hover:underline">Vibely</Link>
        </p>
      </div>
    </div>
  );
}
