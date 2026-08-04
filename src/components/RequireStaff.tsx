import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, MODERATOR_ROLES, STAFF_ROLES } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface RequireStaffProps {
  children: ReactNode;
  strict?: boolean;
}

export const RequireStaff = ({ children, strict = false }: RequireStaffProps) => {
  const { roles, loading } = useAuth();
  const allowed = strict ? STAFF_ROLES : MODERATOR_ROLES;

  if (loading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!roles.some((role) => allowed.includes(role))) return <Navigate to="/app" replace />;
  return <>{children}</>;
};
