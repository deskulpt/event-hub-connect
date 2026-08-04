import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Plus } from "lucide-react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { createPerk, listMyPerks } from "@/services/perks";

export const ManagePerks = () => {
  const { user } = useAuth();
  const { localityId } = usePreferences();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [code, setCode] = useState("");
  const [terms, setTerms] = useState("");

  const perksQuery = useQuery({
    queryKey: ["my-perks", user?.id],
    queryFn: () => listMyPerks(user!.id),
    enabled: Boolean(user),
  });

  const create = useMutation({
    mutationFn: () =>
      createPerk(
        {
          title,
          description,
          discount_label: discountLabel,
          code,
          terms,
          locality_id: localityId,
        },
        user!.id,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-perks"] });
      setOpen(false);
      setTitle("");
      setDescription("");
      setDiscountLabel("");
      setCode("");
      setTerms("");
      toast.success("Perk submitted for review");
    },
    onError: () => toast.error("Could not create the perk. Please try again."),
  });

  const perks = perksQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Business tools"
        title="Perks I offer"
        subtitle="Publish member-only offers. Perks go live after a quick review."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4" /> Create perk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create perk</DialogTitle>
                <DialogDescription>Members claim this offer and show the code in store.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Offer title" aria-label="Offer title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="What is included?" aria-label="Offer description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Discount label, e.g. 20% off" aria-label="Discount label" value={discountLabel} onChange={(e) => setDiscountLabel(e.target.value)} />
                <Input placeholder="Redemption code" aria-label="Redemption code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Textarea placeholder="Terms and conditions" aria-label="Terms" value={terms} onChange={(e) => setTerms(e.target.value)} />
              </div>
              <DialogFooter>
                <Button className="rounded-full" disabled={!title.trim() || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending ? "Submitting…" : "Submit for review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {perksQuery.isLoading && <Skeleton className="h-40 rounded-2xl" />}

      {perksQuery.isError && (
        <EmptyState
          title="We could not load your perks"
          description="Something went wrong while fetching your offers."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => perksQuery.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {perksQuery.isSuccess && perks.length === 0 && (
        <EmptyState
          icon={<Gift className="h-6 w-6 text-primary-foreground" />}
          title="No perks yet"
          description="Create your first member offer to reach local members."
          action={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              Create perk
            </Button>
          }
        />
      )}

      {perks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {perks.map((perk) => (
            <Card key={perk.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{perk.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0 rounded-full text-[10px] capitalize">
                    {perk.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">{perk.description}</p>
                <p className="text-xs text-muted-foreground tab-num">
                  {perk.redemption_count} claimed
                  {perk.max_redemptions ? ` of ${perk.max_redemptions}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};
