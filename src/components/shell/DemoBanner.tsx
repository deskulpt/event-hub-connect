import { Presentation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const DemoBanner = () => {
  const { demoMode } = useAuth();
  if (!demoMode) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 border-b border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
      <Presentation className="h-3.5 w-3.5" />
      Demo mode — all workspaces unlocked with sample data. Turn it off from your profile menu.
    </div>
  );
};
