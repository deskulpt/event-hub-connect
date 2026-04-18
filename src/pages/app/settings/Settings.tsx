import { Settings } from "lucide-react";
import { PlaceholderShell } from "@/components/shell/PlaceholderShell";

export default function Settings() {
  return (
    <PlaceholderShell
      title='Settings'
      subtitle='Configure your profile, workspace, team, integrations, and AI preferences.'
      ctaLabel='Save settings'
      emptyTitle='All set'
      emptyDesc='Pick a settings section from the sidebar to configure.'
      icon={Settings}
    />
  );
}
