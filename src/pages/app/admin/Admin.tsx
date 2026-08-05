import { PageLayout } from "@/components/shell/PageLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureFlagsPanel } from "@/components/admin/FeatureFlagsPanel";
import { AiSettingsPanel } from "@/components/admin/AiSettingsPanel";
import { LocalizationPanel } from "@/components/admin/LocalizationPanel";
import { ModerationPanel } from "@/components/admin/ModerationPanel";
import { VerificationQueuePanel } from "@/components/admin/VerificationQueuePanel";
import { CommercePanel } from "@/components/admin/CommercePanel";
import { OperationsPanel } from "@/components/admin/OperationsPanel";

export const Admin = () => (
  <PageLayout>
    <PageHeader
      eyebrow="Staff only"
      title="Admin console"
      subtitle="Manage flags, AI settings, languages, safety and commerce for the whole community."
    />
    <Tabs defaultValue="flags" className="mt-4">
      <TabsList className="flex w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="flags">Flags</TabsTrigger>
        <TabsTrigger value="ai">AI</TabsTrigger>
        <TabsTrigger value="localization">Languages</TabsTrigger>
        <TabsTrigger value="safety">Safety</TabsTrigger>
        <TabsTrigger value="verification">Verification</TabsTrigger>
        <TabsTrigger value="commerce">Commerce</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
      </TabsList>
      <TabsContent value="flags" className="mt-4"><FeatureFlagsPanel /></TabsContent>
      <TabsContent value="ai" className="mt-4"><AiSettingsPanel /></TabsContent>
      <TabsContent value="localization" className="mt-4"><LocalizationPanel /></TabsContent>
      <TabsContent value="safety" className="mt-4"><ModerationPanel /></TabsContent>
      <TabsContent value="verification" className="mt-4"><VerificationQueuePanel /></TabsContent>
      <TabsContent value="commerce" className="mt-4"><CommercePanel /></TabsContent>
      <TabsContent value="operations" className="mt-4"><OperationsPanel /></TabsContent>
    </Tabs>
  </PageLayout>
);
