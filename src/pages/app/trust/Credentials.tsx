import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { listOwnVendors } from "@/services/listings";
import { createCredential, listMyCredentials } from "@/services/credentials";
import { TrustBadge } from "@/components/trust/TrustBadge";

const KINDS = ["license", "insurance", "background check", "qualification", "other"];

export const Credentials = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const vendorsQuery = useQuery({
    queryKey: ["own-vendors", user?.id],
    queryFn: () => listOwnVendors(user!.id),
    enabled: Boolean(user),
  });
  const credsQuery = useQuery({
    queryKey: ["my-credentials", user?.id],
    queryFn: () => listMyCredentials(user!.id),
    enabled: Boolean(user),
  });

  const create = useMutation({
    mutationFn: () =>
      createCredential({
        vendor_id: vendorId,
        owner_id: user!.id,
        kind,
        title,
        document_url: documentUrl || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-credentials"] });
      setOpen(false);
      setTitle("");
      setDocumentUrl("");
      toast.success("Credential submitted for review");
    },
    onError: () => toast.error("Could not submit credential"),
  });

  const vendors = vendorsQuery.data ?? [];
  const creds = credsQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Trust"
        title="Professional credentials"
        subtitle="Upload licences and checks so hosts know you are verified."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" disabled={vendors.length === 0}>
                <Plus className="h-4 w-4" /> Upload credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload credential</DialogTitle>
                <DialogDescription>
                  Attach a document URL for staff to review. Status updates appear here.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger aria-label="Professional profile">
                    <SelectValue placeholder="Select your pro profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Input
                  placeholder="Credential title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-label="Credential title"
                />
                <Input
                  placeholder="Document URL"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  aria-label="Document URL"
                />
              </div>
              <DialogFooter>
                <Button
                  className="rounded-full"
                  disabled={!vendorId || !title.trim() || create.isPending}
                  onClick={() => create.mutate()}
                >
                  {create.isPending ? "Submitting…" : "Submit for review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {vendors.length === 0 && !vendorsQuery.isLoading && (
        <EmptyState
          icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
          title="Create a pro profile first"
          description="Credentials attach to a professional listing in Marketplace."
        />
      )}

      {credsQuery.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}

      {credsQuery.isSuccess && creds.length === 0 && vendors.length > 0 && (
        <EmptyState
          icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
          title="No credentials yet"
          description="Upload a licence or background check to unlock the verified badge."
          action={
            <Button className="rounded-full" onClick={() => setOpen(true)}>
              Upload credential
            </Button>
          }
        />
      )}

      {creds.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {creds.map((cred) => (
            <Card key={cred.id} className="rounded-2xl border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{cred.title}</CardTitle>
                  <TrustBadge state={cred.state} />
                </div>
                <p className="text-xs capitalize text-muted-foreground">{cred.kind}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {cred.document_url && (
                  <a
                    href={cred.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View document
                  </a>
                )}
                {cred.reviewer_note && <p>Reviewer note: {cred.reviewer_note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};
