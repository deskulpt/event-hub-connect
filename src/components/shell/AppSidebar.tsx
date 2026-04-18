import { Home, CalendarDays, Store, Users, Calendar, Wallet, ShieldCheck, Inbox, BarChart3, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Sparkles } from "lucide-react";

const items = [
  { title: "Home", url: "/app", icon: Home, end: true },
  { title: "Events", url: "/app/events", icon: CalendarDays },
  { title: "Marketplace", url: "/app/marketplace", icon: Store },
  { title: "CRM", url: "/app/crm", icon: Users },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Finance", url: "/app/finance", icon: Wallet },
  { title: "Trust", url: "/app/trust", icon: ShieldCheck },
  { title: "Inbox", url: "/app/inbox", icon: Inbox },
  { title: "Insights", url: "/app/insights", icon: BarChart3 },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-sunset shadow-soft">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="font-display text-lg font-semibold text-secondary">Vibely</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.url
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url} end={item.end}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
