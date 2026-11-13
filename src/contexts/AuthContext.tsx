import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useDemoStore } from "@/stores/use-demo-store";

export type AppRole =
  | "host"
  | "pro"
  | "business"
  | "admin"
  | "member"
  | "volunteer_host"
  | "professional"
  | "sponsor"
  | "org_admin"
  | "moderator"
  | "ops_admin"
  | "super_admin";

export const STAFF_ROLES: AppRole[] = ["admin", "ops_admin", "super_admin"];
export const MODERATOR_ROLES: AppRole[] = [...STAFF_ROLES, "moderator"];
export const ALL_ROLES: AppRole[] = ["host", "member", "volunteer_host", "pro", "professional", "business", "sponsor", "org_admin", "moderator", "admin", "ops_admin", "super_admin"];

/** The only account allowed to turn on demo mode. */
export const DEMO_OWNER_EMAIL = "anand2064@gmail.com";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  active_role: AppRole;
  onboarded: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  /** True for the demo owner account when it is also staff. */
  canUseDemo: boolean;
  demoMode: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const demoEnabled = useDemoStore((st) => st.enabled);
  const canUseDemo =
    (user?.email ?? "").toLowerCase() === DEMO_OWNER_EMAIL && roles.some((r) => STAFF_ROLES.includes(r));
  const demoMode = canUseDemo && demoEnabled;
  const effectiveRoles = demoMode ? ALL_ROLES : roles;

  return (
    <AuthContext.Provider
      value={{ user, session, profile, roles: effectiveRoles, canUseDemo, demoMode, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
