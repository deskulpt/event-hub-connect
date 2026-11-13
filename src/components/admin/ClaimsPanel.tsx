import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Mail, Inbox, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shell/EmptyState";
import { approveClaim, buildInviteMessage, listClaims, listUnclaimed, rejectClaim } from "@/services/claims";

export const ClaimsPanel = () => {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const claimsQ = useQuery({ queryKey: ["listing-claims"], queryFn: listClaims });
  const unclaimedQ = useQuery({ queryKey: ["unclaimed-listings"], queryFn: listUnclaimed });

  const decide = useMutation({
    mutationFn: ({ id, ok }: { id: string; ok: boolean }) => (ok ? approveClaim(id) : rejectClaim(id)),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["listing-claims"] });
      qc.invalidateQueries({ queryKey: ["unclaimed-listings"] });
      toast.success(v.ok ? "Claim approved — listing handed over" : "Claim rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () => (unclaimedQ.data ?? []).filter((l) => l.name.toLowerCase().includes(q.toLowerCase())),
    [unclaimedQ.data, q],
  );
  const pending = (claimsQ.data ?? []).filter((c) => c.status === "pending");

  const copyInvite = async (msg: string) => {
    await navigator.clipboard.writeText(msg);
    toast.success("Invite copied — paste it into email, LinkedIn or WhatsApp");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Claims to review <span className="tabular-nums text-muted-foreground">({pending.length})</span></CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {claimsQ.isLoading ? <Skeleton className="h-20 w-full" /> : claimsQ.isError ? (
            <p className="text-sm text-destructive">Could not load claims.</p>
          ) : pending.length === 0 ? (
            <EmptyState icon={<Inbox className="h-5 w-5 text-primary" />} title="No claims waiting" description="Send invites from the list on the right to get owners claiming." />
          ) : pending.map((c) => (
            <div key={c.id} className="space-y-2 rounded-md border border-border/60 p-3 text-sm">
              <div className="flex items-center gap-2"><span className="font-medium">{c.contact_name}</span><Badge variant="outline" className="text-[10px] capitalize">{c.listing_kind}</Badge></div>
              <p className="text-xs text-muted-foreground">{c.contact_email}{c.contact_phone ? ` · ${c.contact_phone}` : ""}{c.role_at_business ? ` · ${c.role_at_business}` : ""}</p>
              {c.proof_note && <p className="text-xs">{c.proof_note}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide.mutate({ id: c.id, ok: true })} disabled={decide.isPending}>Approve claim</Button>
                <Button size="sm" variant="ghost" onClick={() => decide.mutate({ id: c.id, ok: false })} disabled={decide.isPending}>Reject</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Invite owners <span className="tabular-nums text-muted-foreground">({unclaimedQ.data?.length ?? 0} unclaimed)</span></CardTitle>
          <Input placeholder="Search businesses…" value={q} onChange={(e) => setQ(e.target.value)} />
        </CardHeader>
        <CardContent className="max-h-[560px] space-y-2 overflow-y-auto">
          {unclaimedQ.isLoading ? <Skeleton className="h-20 w-full" /> : unclaimedQ.isError ? (
            <p className="text-sm text-destructive">Could not load listings.</p>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Store className="h-5 w-5 text-primary" />} title="Nothing to invite" description="Every listing has been claimed, or nothing matches your search." />
          ) : filtered.map((l) => {
            const msg = buildInviteMessage(l, window.location.origin);
            return (
              <div key={`${l.kind}-${l.id}`} className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.city ?? "—"}{l.phone ? ` · ${l.phone}` : ""}
                    {l.website && <> · <a href={l.website} target="_blank" rel="noreferrer" className="underline">website</a></>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" aria-label={`Copy invite for ${l.name}`} onClick={() => copyInvite(msg)}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" asChild aria-label={`Email invite to ${l.name}`}>
                    <a href={`mailto:?subject=${encodeURIComponent(`Claim ${l.name} on Vibely`)}&body=${encodeURIComponent(msg)}`}><Mail className="h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
