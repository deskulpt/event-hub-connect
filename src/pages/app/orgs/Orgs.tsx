import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
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
import { createOrganization, listOrganizations } from "@/services/organizations";

const KINDS = ["ngo", "resident association", "senior club", "care provider", "business"];

export const Orgs = () => {
  const { user } = useAuth();
  const { localityId } = usePreferences();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const orgsQuery = useQuery({ queryKey: ["organizations"], queryFn: listOrganizations });

  const create = useMutation({
    mutationFn: () =>
      createOrganization(
        { name, kind, description, contact_email: contactEmail, locality_id: localityId },
        user!.id,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setOpen(false);
      setName("");
      setDescription("");
      setContactEmail("");
      toast.success("Organisation submitted for verification");
    },
    onError: () => toast.error("Could not create the organisation. Please try again."),
  });

  const orgs = orgsQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Partners"
        title="Organisations"
        subtitle="NGOs, resident associations and care partners running activities in your area."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4" /> Register organisation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register organisation</DialogTitle>
                <DialogDescription>Our team verifies each organisation before it goes live.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Organisation name" aria-label="Organisation name" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setKind(option)}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                        kind === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <Textarea placeholder="What does the organisation do?" aria-label="Organisation description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input type="email" placeholder="Contact email" aria-label="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <DialogFooter>
                <Button className="rounded-full" disabled={!name.trim() || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending ? "Submitting…" : "Submit for verification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {orgsQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      )}

      {orgsQuery.isError && (
        <EmptyState
          title="We could not load organisations"
          description="Something went wrong while fetching partners."
          action={
            <Button variant="outline" className="rounded-full" onClick={() => orgsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {orgsQuery.isSuccess && orgs.length === 0 && (
        <EmptyState
          icon={<Building2 className="h-6 w-6 text-primary-foreground" />}
          title="No organisations yet"
          description="Register the first partner organisation for your area."
          action={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              Register organisation
            </Button>
          }
        />
      )}

      {orgs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orgs.map((org) => (
            <Card
              key={org.id}
              className="cursor-pointer rounded-2xl border-border/60 bg-card/70 backdrop-blur transition-shadow hover:shadow-soft"
              onClick={() => navigate(`/app/orgs/${org.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{org.name}</CardTitle>
                  <Badge variant="outline" className="shrink-0 rounded-full text-[10px] capitalize">
                    {org.status}
                  </Badge>
                </div>
                <p className="text-xs capitalize text-muted-foreground">{org.kind}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="line-clamp-3 text-sm text-muted-foreground">{org.description}</p>
                {org.contact_email && (
                  <span className="text-xs text-primary underline">{org.contact_email}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};
