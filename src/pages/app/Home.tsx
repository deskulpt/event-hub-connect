import { useActiveRole } from "@/hooks/useActiveRole";
import { HostHome } from "./home/HostHome";
import { ProHome } from "./home/ProHome";
import { BusinessHome } from "./home/BusinessHome";

export default function Home() {
  const { activeRole } = useActiveRole();
  if (activeRole === "pro") return <ProHome />;
  if (activeRole === "business") return <BusinessHome />;
  return <HostHome />;
}
