import {
  Home, CalendarDays, Store, Users, Calendar, Wallet, ShieldCheck, Inbox, BarChart3, Settings,
  Heart, Bookmark, MessageSquare, ClipboardList, Briefcase, Sparkles,
} from "lucide-react";
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
import { useActiveRole } from "@/hooks/useActiveRole";
import type { AppRole } from "@/contexts/AuthContext";

type NavItem = { title: string; url: string; icon: typeof Home; end?: boolean };

const navByRole: Record<AppRole, NavItem[]> = {
  host: [
    { title: "Home", url: "/app", icon: Home, end: true },
    { title: "My Events", url: "/app/events", icon: CalendarDays },
    { title: "Discover", url: "/app/marketplace/discover", icon: Store },
    { title: "Shortlists", url: "/app/marketplace/saved", icon: Heart },
    { title: "Calendar", url: "/app/calendar", icon: Calendar },
    { title: "Budget & Finance", url: "/app/finance", icon: Wallet },
    { title: "Inbox", url: "/app/inbox", icon: Inbox },
    { title: "Trust", url: "/app/trust", icon: ShieldCheck },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ],
  pro: [
    { title: "Home", url: "/app", icon: Home, end: true },
    { title: "Leads", url: "/app/crm/inquiries", icon: MessageSquare },
    { title: "Bookings", url: "/app/crm/bookings", icon: Bookmark },
    { title: "Calendar", url: "/app/calendar", icon: Calendar },
    { title: "Clients", url: "/app/crm/contacts", icon: Users },
    { title: "Earnings", url: "/app/finance/overview", icon: Wallet },
    { title: "Trust & Insurance", url: "/app/trust", icon: ShieldCheck },
    { title: "Inbox", url: "/app/inbox", icon: Inbox },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ],
  business: [
    { title: "Home", url: "/app", icon: Home, end: true },
    { title: "Bookings", url: "/app/crm/bookings", icon: Bookmark },
    { title: "Operations", url: "/app/crm/tasks", icon: ClipboardList },
    { title: "Calendar", url: "/app/calendar", icon: Calendar },
    { title: "CRM", url: "/app/crm", icon: Users },
    { title: "Finance", url: "/app/finance", icon: Wallet },
    { title: "Trust & Compliance", url: "/app/trust", icon: ShieldCheck },
    { title: "Insights", url: "/app/insights", icon: BarChart3 },
    { title: "Inbox", url: "/app/inbox", icon: Inbox },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ],
  admin: [
    { title: "Home", url: "/app", icon: Home, end: true },
    { title: "Trust", url: "/app/trust", icon: ShieldCheck },
    { title: "Finance", url: "/app/finance", icon: Wallet },
    { title: "Insights", url: "/app/insights", icon: BarChart3 },
    { title: "Inbox", url: "/app/inbox", icon: Inbox },
    { title: "Settings", url: "/app/settings", icon: Settings },
  ],
};

const labelByRole: Record<AppRole, string> = {
  host: "Host workspace",
  pro: "Pro workspace",
  business: "Business workspace",
  admin: "Admin workspace",
};

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { activeRole } = useActiveRole();
  const items = navByRole[activeRole];

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
          <SidebarGroupLabel>{labelByRole[activeRole]}</SidebarGroupLabel>
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
