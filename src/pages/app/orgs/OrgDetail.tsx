import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  getOrganization,
  inviteOrgMember,
  listOrgMembers,
  removeOrgMember,
} from "@/services/organizations";

export const OrgDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const orgQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganization(id!),
    enabled: Boolean(id),
  });
  const membersQuery = useQuery({
    queryKey: ["org-members", id],
    queryFn: () => listOrgMembers(id!),
    enabled: Boolean(id),
  });

  const org = orgQuery.data;
  const members = membersQuery.data ?? [];
  const isOwner = Boolean(user && org?.owner_id === user.id);

  const invite = useMutation({
    mutationFn: () => inviteOrgMember(id!, inviteEmail.trim() || memberId.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org-members", id] });
      setMemberId("");
      setInviteEmail("");
      toast.success("Member added");
    },
    onError: (e: Error) => toast.error(e.message || "Could not add member. Check the email or user id."),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => removeOrgMember(id!, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["org-members", id] });
      toast.success("Member removed");
    },
    onError: () => toast.error("Could not remove member"),
  });

  if (orgQuery.isLoading) {
    return (
      <PageLayout>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageLayout>
    );
  }

  if (!org) {
    return (
      <PageLayout>
        <EmptyState
          icon={<Building2 className="h-6 w-6 text-primary-foreground" />}
          title="Organisation not found"
          action={
            <Button className="rounded-full" onClick={() => navigate("/app/orgs")}>
              Back to organisations
            </Button>
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/app/orgs">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to organisations
        </Link>
      </Button>
      <PageHeader
        eyebrow={org.kind}
        title={org.name}
        subtitle={org.description ?? "Partner organisation on Vibely."}
        primaryCta={
          <Badge variant="outline" className="rounded-full capitalize">
            {org.status}
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {org.city && <p>City: {org.city}</p>}
            {org.website && (
              <a href={org.website} className="text-primary underline" target="_blank" rel="noreferrer">
                Website
              </a>
            )}
            {org.contact_email && (
              <a href={`mailto:${org.contact_email}`} className="block text-primary underline">
                {org.contact_email}
              </a>
            )}
            {org.contact_phone && <p>{org.contact_phone}</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{m.user_id.slice(0, 8)}…</p>
                  <p className="text-xs capitalize text-muted-foreground">{m.org_role}</p>
                </div>
                {isOwner && m.user_id !== org.owner_id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(m.user_id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {isOwner && (
              <div className="space-y-2 pt-2">
                <Input
                  type="email"
                  placeholder="Member email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  aria-label="Member email"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Or paste user id (uuid)"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    aria-label="Member user id"
                  />
                  <Button
                    className="rounded-full"
                    disabled={!(inviteEmail.trim() || memberId.trim()) || invite.isPending}
                    onClick={() => invite.mutate()}
                  >
                    Invite
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
