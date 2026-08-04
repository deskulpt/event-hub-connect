import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminListLocalities,
  createCommissionRule,
  createLocality,
  listAiSettings,
  listAuditLog,
  listCommissionRules,
  listFeatureFlags,
  listGenerationRules,
  listLanguages,
  listModerationSettings,
  listPendingCredentials,
  listPendingOrganizations,
  listProposalRuns,
  listSponsorshipPackages,
  recordAudit,
  reviewCredential,
  setFeatureFlag,
  setSponsorshipPackageActive,
  updateAiSetting,
  updateLanguage,
  updateLocalityActive,
  upsertModerationSetting,
} from "@/services/adminConfig";
import { decideReport, listReports, setOrganizationStatus, triageReport } from "@/services/organizations";
import { generateProposals } from "@/services/proposals";
import { TrustBadge } from "@/components/trust/TrustBadge";

export const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localityName, setLocalityName] = useState("");
  const [commissionCategory, setCommissionCategory] = useState("default");
  const [commissionRate, setCommissionRate] = useState("10");
  const [genLocalityId, setGenLocalityId] = useState("");

  const flagsQ = useQuery({ queryKey: ["admin-flags"], queryFn: listFeatureFlags });
  const aiQ = useQuery({ queryKey: ["admin-ai"], queryFn: listAiSettings });
  const langsQ = useQuery({ queryKey: ["admin-langs"], queryFn: listLanguages });
  const reportsQ = useQuery({ queryKey: ["admin-reports"], queryFn: listReports });
  const localitiesQ = useQuery({ queryKey: ["admin-localities"], queryFn: adminListLocalities });
  const rulesQ = useQuery({ queryKey: ["admin-rules"], queryFn: listGenerationRules });
  const commissionQ = useQuery({ queryKey: ["admin-commission"], queryFn: listCommissionRules });
  const packagesQ = useQuery({ queryKey: ["admin-packages"], queryFn: listSponsorshipPackages });
  const orgsQ = useQuery({ queryKey: ["admin-pending-orgs"], queryFn: listPendingOrganizations });
  const credsQ = useQuery({ queryKey: ["admin-pending-creds"], queryFn: listPendingCredentials });
  const runsQ = useQuery({ queryKey: ["admin-runs"], queryFn: listProposalRuns });
  const auditQ = useQuery({ queryKey: ["admin-audit"], queryFn: listAuditLog });
  const modQ = useQuery({ queryKey: ["admin-mod-settings"], queryFn: listModerationSettings });

  const audit = async (domain: string, action: string, targetId?: string) => {
    if (!user) return;
    await recordAudit({ actor_id: user.id, domain, action, target_id: targetId });
    void queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
  };

  const toggleFlag = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      await setFeatureFlag(key, enabled);
      await audit("feature_flags", enabled ? "enable" : "disable", key);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-flags"] });
      toast.success("Feature flag updated");
    },
    onError: () => toast.error("Could not update flag"),
  });

  const toggleLang = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await updateLanguage(id, { enabled });
      await audit("localization", enabled ? "enable" : "disable", id);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-langs"] }),
  });

  const toggleAi = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await updateAiSetting(id, { enabled });
      await audit("ai_provider", enabled ? "enable" : "disable", id);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-ai"] }),
  });

  const reportAction = useMutation({
    mutationFn: async ({
      id,
      status,
      decision,
    }: {
      id: string;
      status: "actioned" | "dismissed" | "triaged";
      decision: string;
    }) => {
      await decideReport(id, status, decision, user!.id);
      await audit("moderation", status, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report updated");
    },
  });

  const runTriage = useMutation({
    mutationFn: (id: string) => triageReport(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("AI triage complete");
    },
    onError: () => toast.error("Triage failed"),
  });

  const orgReview = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "verified" | "rejected" }) => {
      await setOrganizationStatus(id, status);
      await audit("organizations", status, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pending-orgs"] });
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Organisation updated");
    },
  });

  const credReview = useMutation({
    mutationFn: async ({
      id,
      state,
    }: {
      id: string;
      state: "verified" | "rejected";
    }) => {
      await reviewCredential(id, state);
      await audit("credentials", state, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pending-creds"] });
      toast.success("Credential reviewed");
    },
  });

  const addLocality = useMutation({
    mutationFn: () => createLocality({ name: localityName.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-localities"] });
      setLocalityName("");
      toast.success("Locality created");
    },
    onError: () => toast.error("Could not create locality"),
  });

  const addCommission = useMutation({
    mutationFn: () =>
      createCommissionRule({
        category: commissionCategory,
        rate_percent: Number(commissionRate) || 10,
        created_by: user?.id,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-commission"] });
      toast.success("Commission rule added");
    },
  });

  const runProposals = useMutation({
    mutationFn: () => generateProposals(genLocalityId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-runs"] });
      void queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success(`Created ${data.created} proposals`);
    },
    onError: () => toast.error("Proposal generation failed"),
  });

  const saveMod = useMutation({
    mutationFn: () => upsertModerationSetting("auto_triage", { enabled: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-mod-settings"] });
      toast.success("Moderation setting saved");
    },
  });

  return (
    <PageLayout>
      <PageHeader
        eyebrow="Staff"
        title="Admin console"
        subtitle="Feature flags, AI, moderation, localities, economics and audit."
      />

      <Tabs defaultValue="flags" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="i18n">Languages</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="localities">Localities</TabsTrigger>
          <TabsTrigger value="rules">Generation</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="packages">Sponsorships</TabsTrigger>
          <TabsTrigger value="orgs">Org queue</TabsTrigger>
          <TabsTrigger value="creds">Credentials</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-3">
          {flagsQ.isLoading && <Skeleton className="h-32 w-full" />}
          {(flagsQ.data ?? []).map((flag) => (
            <Card key={flag.key} className="rounded-2xl">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{flag.label ?? flag.key}</p>
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(enabled) => toggleFlag.mutate({ key: flag.key, enabled })}
                />
              </CardContent>
            </Card>
          ))}
          {flagsQ.isSuccess && (flagsQ.data ?? []).length === 0 && (
            <EmptyState title="No feature flags" description="Flags will appear when seeded." />
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-3">
          {(aiQ.data ?? []).map((row) => (
            <Card key={row.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{row.feature}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.primary_provider}/{row.primary_model}
                    {row.fallback_provider ? ` · fallback ${row.fallback_provider}` : ""}
                  </p>
                </div>
                <Switch
                  checked={row.enabled}
                  onCheckedChange={(enabled) => toggleAi.mutate({ id: row.id, enabled })}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="i18n" className="space-y-3">
          {(langsQ.data ?? []).map((lang) => (
            <Card key={lang.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {lang.label} {lang.native_label ? `(${lang.native_label})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground tab-num">
                    {lang.language_code} · {lang.coverage_percent}% coverage
                    {lang.is_default ? " · default" : ""}
                  </p>
                </div>
                <Switch
                  checked={lang.enabled}
                  onCheckedChange={(enabled) => toggleLang.mutate({ id: lang.id, enabled })}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Moderation settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(modQ.data ?? []).map((s) => (
                <p key={s.id} className="text-sm text-muted-foreground">
                  {s.key}: {JSON.stringify(s.value)}
                </p>
              ))}
              <Button size="sm" className="rounded-full" onClick={() => saveMod.mutate()}>
                Enable auto-triage
              </Button>
            </CardContent>
          </Card>
          {(reportsQ.data ?? []).slice(0, 30).map((report) => (
            <Card key={report.id} className="rounded-2xl">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full capitalize">
                    {report.status}
                  </Badge>
                  <span className="text-sm font-medium">{report.reason}</span>
                  <span className="text-xs text-muted-foreground">
                    {report.subject_table}/{report.subject_id.slice(0, 8)}
                  </span>
                </div>
                {report.details && <p className="text-sm text-muted-foreground">{report.details}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => runTriage.mutate(report.id)}>
                    AI triage
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      reportAction.mutate({ id: report.id, status: "actioned", decision: "actioned" })
                    }
                  >
                    Action
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      reportAction.mutate({ id: report.id, status: "dismissed", decision: "dismissed" })
                    }
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="localities" className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="New locality name"
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
            />
            <Button
              className="rounded-full"
              disabled={!localityName.trim() || addLocality.isPending}
              onClick={() => addLocality.mutate()}
            >
              Add
            </Button>
          </div>
          {(localitiesQ.data ?? []).map((loc) => (
            <Card key={loc.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{loc.name}</p>
                  <p className="text-xs text-muted-foreground tab-num">
                    {loc.city ?? "—"} · {loc.radius_miles} mi · {loc.member_count} members
                  </p>
                </div>
                <Switch
                  checked={loc.active}
                  onCheckedChange={(active) =>
                    updateLocalityActive(loc.id, active).then(() => {
                      void queryClient.invalidateQueries({ queryKey: ["admin-localities"] });
                    })
                  }
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="space-y-3">
          {(rulesQ.data ?? []).map((rule) => (
            <Card key={rule.id} className="rounded-2xl">
              <CardContent className="p-4 text-sm">
                <p className="font-medium">Locality {rule.locality_id?.slice(0, 8) ?? "global"}</p>
                <p className="text-muted-foreground tab-num">
                  slate {rule.slate_size} · min threshold {rule.min_threshold} · multiplier{" "}
                  {rule.threshold_multiplier} · window {rule.voting_window_days}d
                </p>
              </CardContent>
            </Card>
          ))}
          {rulesQ.isSuccess && (rulesQ.data ?? []).length === 0 && (
            <EmptyState title="No generation rules" description="Rules appear per locality when configured." />
          )}
        </TabsContent>

        <TabsContent value="commission" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Category"
              value={commissionCategory}
              onChange={(e) => setCommissionCategory(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Rate %"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-28"
            />
            <Button className="rounded-full" onClick={() => addCommission.mutate()}>
              Add rule
            </Button>
          </div>
          {(commissionQ.data ?? []).map((rule) => (
            <Card key={rule.id} className="rounded-2xl">
              <CardContent className="p-4 text-sm">
                <p className="font-medium capitalize">{rule.category}</p>
                <p className="text-muted-foreground tab-num">
                  {rule.rate_percent}% · floor {(rule.floor_cents / 100).toFixed(0)}
                  {rule.cap_cents != null ? ` · cap ${(rule.cap_cents / 100).toFixed(0)}` : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="packages" className="space-y-3">
          {(packagesQ.data ?? []).map((pkg) => (
            <Card key={pkg.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground tab-num">
                    {(pkg.price_cents / 100).toLocaleString()} {pkg.currency} · {pkg.duration_days}d
                  </p>
                </div>
                <Switch
                  checked={pkg.active}
                  onCheckedChange={(active) =>
                    setSponsorshipPackageActive(pkg.id, active).then(() =>
                      queryClient.invalidateQueries({ queryKey: ["admin-packages"] }),
                    )
                  }
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orgs" className="space-y-3">
          {(orgsQ.data ?? []).map((org) => (
            <Card key={org.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{org.kind}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => orgReview.mutate({ id: org.id, status: "verified" })}>
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => orgReview.mutate({ id: org.id, status: "rejected" })}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {orgsQ.isSuccess && (orgsQ.data ?? []).length === 0 && (
            <EmptyState title="Org queue empty" description="Pending organisations appear here." />
          )}
        </TabsContent>

        <TabsContent value="creds" className="space-y-3">
          {(credsQ.data ?? []).map((cred) => (
            <Card key={cred.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{cred.title}</p>
                    <TrustBadge state={cred.state} />
                  </div>
                  <p className="text-xs capitalize text-muted-foreground">{cred.kind}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => credReview.mutate({ id: cred.id, state: "verified" })}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => credReview.mutate({ id: cred.id, state: "rejected" })}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {credsQ.isSuccess && (credsQ.data ?? []).length === 0 && (
            <EmptyState title="Credential queue empty" description="Pending credentials appear here." />
          )}
        </TabsContent>

        <TabsContent value="runs" className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Locality id to generate"
              value={genLocalityId}
              onChange={(e) => setGenLocalityId(e.target.value)}
            />
            <Button
              className="rounded-full"
              disabled={!genLocalityId.trim() || runProposals.isPending}
              onClick={() => runProposals.mutate()}
            >
              {runProposals.isPending ? "Generating…" : "Generate proposals"}
            </Button>
          </div>
          {(runsQ.data ?? []).map((run) => (
            <Card key={run.id} className="rounded-2xl">
              <CardContent className="p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full capitalize">
                    {run.status}
                  </Badge>
                  <span className="font-medium">{run.period}</span>
                  <span className="text-xs text-muted-foreground tab-num">
                    {run.proposals_created} created · {run.model ?? "model n/a"}
                  </span>
                </div>
                <pre className="mt-2 max-h-32 overflow-auto rounded-xl bg-muted/40 p-2 text-[10px]">
                  {JSON.stringify(run.diagnostics ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-2">
          {(auditQ.data ?? []).map((entry) => (
            <Card key={String((entry as { id: string }).id)} className="rounded-2xl">
              <CardContent className="p-3 text-sm">
                <p className="font-medium">
                  {(entry as { domain: string }).domain} · {(entry as { action: string }).action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(entry as { target_id?: string }).target_id ?? "—"} ·{" "}
                  {(entry as { created_at: string }).created_at}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};
