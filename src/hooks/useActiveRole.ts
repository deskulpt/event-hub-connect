import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

export const useActiveRole = () => {
  const { user, profile, roles, refreshProfile } = useAuth();
  const activeRole: AppRole = profile?.active_role ?? "host";

  const setActiveRole = useCallback(
    async (role: AppRole) => {
      if (!user) return;
      if (!roles.includes(role)) return;
      await supabase.from("profiles").update({ active_role: role }).eq("id", user.id);
      await refreshProfile();
    },
    [user, roles, refreshProfile],
  );

  return { activeRole, roles, setActiveRole, hasMultipleRoles: roles.length > 1 };
};
