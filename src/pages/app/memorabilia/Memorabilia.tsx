import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store, Plus } from "lucide-react";
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
import { createMemorabilia, listMemorabilia, withdrawMemorabilia } from "@/services/perks";

const formatPrice = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100,
  );

export const Memorabilia = () => {
  const { user } = useAuth();
  const { localityId } = usePreferences();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [localityOnly, setLocalityOnly] = useState(Boolean(localityId));

  const listingsQuery = useQuery({
    queryKey: ["memorabilia", localityOnly ? localityId : "all"],
    queryFn: () => listMemorabilia(localityOnly ? localityId : null),
  });

  const create = useMutation({
    mutationFn: () =>
      createMemorabilia(
        {
          title,
          description,
          price_cents: Math.round(Number(price || 0) * 100),
          locality_id: localityId,
        },
        user!.id,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memorabilia"] });
      setOpen(false);
      setTitle("");
      setDescription("");
      setPrice("");
      toast.success("Listing published");
    },
    onError: () => toast.error("Could not publish the listing. Please try again."),
  });

  const withdraw = useMutation({
    mutationFn: (id: string) => withdrawMemorabilia(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["memorabilia"] });
      toast.success("Listing withdrawn");
    },
    onError: () => toast.error("Could not withdraw the listing. Please try again."),
  });

  const listings = listingsQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Community market"
        title="Memorabilia"
        subtitle="Pass on books, instruments and keepsakes to neighbours who will use them."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4" /> List an item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>List an item</DialogTitle>
                <DialogDescription>Only members in your area will see this listing.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Item name" aria-label="Item name" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Condition and details" aria-label="Item details" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input
                  type="number"
                  min="0"
                  placeholder="Price"
                  aria-label="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button className="rounded-full" disabled={!title.trim() || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending ? "Publishing…" : "Publish listing"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {localityId && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setLocalityOnly(false)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              !localityOnly ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
            }`}
          >
            All areas
          </button>
          <button
            type="button"
            onClick={() => setLocalityOnly(true)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              localityOnly ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
            }`}
          >
            My locality
          </button>
        </div>
      )}

      {listingsQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {listingsQuery.isError && (
        <EmptyState
          title="We could not load listings"
          description="Something went wrong while fetching the community market."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => listingsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {listingsQuery.isSuccess && listings.length === 0 && (
        <EmptyState
          icon={<Store className="h-6 w-6 text-primary-foreground" />}
          title="Nothing listed yet"
          description="Be the first to pass something on to a neighbour."
          action={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              List an item
            </Button>
          }
        />
      )}

      {listings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="rounded-2xl border-border/60 bg-card/70 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{listing.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0 rounded-full tab-num text-[10px]">
                    {formatPrice(listing.price_cents, listing.currency)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-muted-foreground">{listing.description}</p>
                {user?.id === listing.owner_id && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    disabled={withdraw.isPending}
                    onClick={() => withdraw.mutate(listing.id)}
                  >
                    Withdraw listing
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};
