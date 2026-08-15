import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, profileError, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  if (profileError && location.pathname !== "/onboarding") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-destructive">We could not load your profile. Please refresh or sign in again.</p>
        <a href="/auth" className="text-sm text-primary underline">
          Back to sign in
        </a>
      </div>
    );
  }

  // No profile row yet, or not onboarded → force onboarding (except when already there)
  const needsOnboarding = !profile || !profile.onboarded;
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
