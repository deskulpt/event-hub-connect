import { useActiveRole } from "@/hooks/useActiveRole";
import { HostHome } from "./home/HostHome";
import { ProHome } from "./home/ProHome";
import { BusinessHome } from "./home/BusinessHome";
import { MemberHome } from "./home/MemberHome";

export default function Home() {
  const { activeRole } = useActiveRole();
  if (activeRole === "member" || activeRole === "volunteer_host") return <MemberHome />;
  if (activeRole === "pro" || activeRole === "professional") return <ProHome />;
  if (
    activeRole === "business" ||
    activeRole === "sponsor" ||
    activeRole === "org_admin"
  ) {
    return <BusinessHome />;
  }
  // host and staff default to host workspace (staff can switch)
  if (activeRole === "host") return <HostHome />;
  if (
    activeRole === "moderator" ||
    activeRole === "admin" ||
    activeRole === "ops_admin" ||
    activeRole === "super_admin"
  ) {
    return <MemberHome />;
  }
  return <HostHome />;
}
