import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shell/EmptyState";
import { listOrganizations, setOrganizationStatus } from "@/services/organizations";
import { listCredentials, reviewCredential } from "@/services/credentials";

export const VerificationQueuePanel = () => {
  const queryClient = useQueryClient();
  const orgsQuery = useQuery({ queryKey: ["admin-orgs"], queryFn: listOrganizations });
  const credentialsQuery = useQuery({ queryKey: ["admin-credentials"], queryFn: () => listCredentials() });

  const decideOrg = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "verified" | "rejected" }) =>
      setOrganizationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
      toast.success("Organisation updated");
    },
    onError: () => toast.error("Could not update the organisation. Please try again."),
  });

  const decideCredential = useMutation({
    mutationFn: ({ id, state, note }: { id: string; state: "verified" | "rejected"; note: string }) =>
      reviewCredential(id, state, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-credentials"] });
      toast.success("Credential reviewed");
    },
    onError: () => toast.error("Could not review the credential. Please try again."),
  });

  const orgs = (orgsQuery.data ?? []).filter((org) => org.status === "pending");
  const credentials = (credentialsQuery.data ?? []).filter((c) => c.state === "pending");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisations awaiting verification</CardTitle>
          <CardDescription>Approve trusted groups so they can publish activities and perks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {orgsQuery.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
          {orgsQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load organisations. Refresh to try again.</p>
          )}
          {!orgsQuery.isLoading && orgs.length === 0 && (
            <EmptyState
              icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
              title="Queue is clear"
              description="No organisations are waiting for review."
            />
          )}
          {orgs.map((org) => (
            <div key={org.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{org.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {org.kind}
                  {org.city ? ` · ${org.city}` : ""}
                  {org.registration_number ? ` · ${org.registration_number}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={decideOrg.isPending}
                  onClick={() => decideOrg.mutate({ id: org.id, status: "verified" })}
                >
                  Verify organisation
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  disabled={decideOrg.isPending}
                  onClick={() => decideOrg.mutate({ id: org.id, status: "rejected" })}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Professional credentials</CardTitle>
          <CardDescription>Review licences and certificates submitted by professionals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {credentialsQuery.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
          {credentialsQuery.isError && (
            <p className="text-sm text-muted-foreground">Could not load credentials. Refresh to try again.</p>
          )}
          {!credentialsQuery.isLoading && credentials.length === 0 && (
            <EmptyState
              icon={<BadgeCheck className="h-6 w-6 text-primary-foreground" />}
              title="Nothing to review"
              description="Submitted credentials will appear here."
            />
          )}
          {credentials.map((credential) => (
            <div key={credential.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{credential.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {credential.kind}
                  {credential.expires_on ? ` · expires ${credential.expires_on}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {credential.document_url && (
                  <a
                    href={credential.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline underline-offset-4"
                  >
                    View document
                  </a>
                )}
                <Badge variant="outline" className="capitalize">{credential.state}</Badge>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={decideCredential.isPending}
                  onClick={() =>
                    decideCredential.mutate({ id: credential.id, state: "verified", note: "Document verified" })
                  }
                >
                  Verify credential
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  disabled={decideCredential.isPending}
                  onClick={() =>
                    decideCredential.mutate({ id: credential.id, state: "rejected", note: "Document unclear" })
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
