import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

const pickDefaultRole = (profileRole: AppRole | undefined, roles: AppRole[]): AppRole => {
  if (profileRole && roles.includes(profileRole)) return profileRole;
  if (roles.includes("member")) return "member";
  if (roles.includes("host") || roles.includes("volunteer_host")) return "host";
  if (roles[0]) return roles[0];
  return "member";
};

export const useActiveRole = () => {
  const { user, profile, roles, refreshProfile } = useAuth();
  const activeRole: AppRole = pickDefaultRole(profile?.active_role, roles);

  const setActiveRole = useCallback(
    async (role: AppRole) => {
      if (!user) return;
      if (!roles.includes(role)) return;
      const { error } = await supabase.from("profiles").update({ active_role: role }).eq("id", user.id);
      if (error) {
        toast.error(error.message || "Could not switch role");
        return;
      }
      await refreshProfile();
    },
    [user, roles, refreshProfile],
  );

  return { activeRole, roles, setActiveRole, hasMultipleRoles: roles.length > 1 };
};
