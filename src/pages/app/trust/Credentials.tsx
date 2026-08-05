import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { listCredentials, createCredential } from "@/services/credentials";
import { listOwnVendors } from "@/services/listings";

const KINDS = ["licence", "certification", "insurance", "background check", "training"];

export const Credentials = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [expiresOn, setExpiresOn] = useState("");

  const credentialsQuery = useQuery({
    queryKey: ["my-credentials", user?.id],
    queryFn: () => listCredentials(user!.id),
    enabled: Boolean(user),
  });

  const vendorsQuery = useQuery({
    queryKey: ["my-vendors", user?.id],
    queryFn: () => listOwnVendors(user!.id),
    enabled: Boolean(user),
  });

  const create = useMutation({
    mutationFn: () =>
      createCredential(
        {
          vendor_id: vendorId,
          kind,
          title,
          document_url: documentUrl || null,
          expires_on: expiresOn || null,
        },
        user!.id,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-credentials"] });
      setOpen(false);
      setTitle("");
      setDocumentUrl("");
      setExpiresOn("");
      toast.success("Credential submitted for review");
    },
    onError: () => toast.error("Could not submit the credential. Please try again."),
  });

  const credentials = credentialsQuery.data ?? [];
  const vendors = vendorsQuery.data ?? [];

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Professional tools"
        title="My credentials"
        subtitle="Upload licences and certificates so members can see you are verified."
        primaryCta={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full" disabled={vendors.length === 0}>
                <Plus className="h-4 w-4" /> Add credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add credential</DialogTitle>
                <DialogDescription>Our team reviews documents within two business days.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="credential-service">Service profile</Label>
                  <Select value={vendorId} onValueChange={setVendorId}>
                    <SelectTrigger id="credential-service"><SelectValue placeholder="Choose a profile" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credential-kind">Type</Label>
                  <Select value={kind} onValueChange={setKind}>
                    <SelectTrigger id="credential-kind"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KINDS.map((option) => (
                        <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credential-title">Title</Label>
                  <Input id="credential-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Food safety licence" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credential-url">Document link</Label>
                  <Input id="credential-url" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="credential-expiry">Expires on</Label>
                  <Input id="credential-expiry" type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="rounded-full"
                  disabled={!vendorId || !title || create.isPending}
                  onClick={() => create.mutate()}
                >
                  Submit credential
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {credentialsQuery.isLoading && <Skeleton className="h-56 w-full rounded-2xl" />}

      {credentialsQuery.isError && (
        <EmptyState
          icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
          title="Could not load credentials"
          description="Refresh the page to try again."
        />
      )}

      {!credentialsQuery.isLoading && !credentialsQuery.isError && credentials.length === 0 && (
        <EmptyState
          icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
          title={vendors.length === 0 ? "Create a service profile first" : "No credentials yet"}
          description={
            vendors.length === 0
              ? "Add a service profile in the marketplace, then upload your documents here."
              : "Upload a licence or certificate to earn a verified badge."
          }
        />
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {credentials.map((credential) => (
          <Card key={credential.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-sm">{credential.title}</CardTitle>
                <Badge variant={credential.state === "verified" ? "default" : "outline"} className="capitalize">
                  {credential.state}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p className="capitalize">{credential.kind}</p>
              {credential.expires_on && <p className="tabular-nums">Expires {credential.expires_on}</p>}
              {credential.reviewer_note && <p>Reviewer note: {credential.reviewer_note}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};
