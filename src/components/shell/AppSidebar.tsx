import {
  Home, CalendarDays, Users, Calendar, Wallet, ShieldCheck, Inbox, BarChart3, Settings,
  Bookmark, MessageSquare, ClipboardList, Sparkles, Gift, Vote, Building2, Store, SlidersHorizontal,
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
import { useAuth, MODERATOR_ROLES, type AppRole } from "@/contexts/AuthContext";

type NavItem = { title: string; url: string; icon: typeof Home; end?: boolean };

const communityNav: NavItem[] = [
  { title: "Home", url: "/app", icon: Home, end: true },
  { title: "Activities", url: "/app/events", icon: CalendarDays },
  { title: "Proposals", url: "/app/proposals", icon: Vote },
  { title: "Circles", url: "/app/circles", icon: Users },
  { title: "Perks", url: "/app/perks", icon: Gift },
  { title: "Memorabilia", url: "/app/memorabilia", icon: Store },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Inbox", url: "/app/inbox", icon: Inbox },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

const professionalNav: NavItem[] = [
  { title: "Home", url: "/app", icon: Home, end: true },
  { title: "Leads", url: "/app/crm/inquiries", icon: MessageSquare },
  { title: "Bookings", url: "/app/crm/bookings", icon: Bookmark },
  { title: "Activities", url: "/app/events", icon: CalendarDays },
  { title: "Calendar", url: "/app/calendar", icon: Calendar },
  { title: "Perks I offer", url: "/app/perks/manage", icon: Gift },
  { title: "Billing", url: "/app/finance", icon: Wallet },
  { title: "Trust", url: "/app/trust", icon: ShieldCheck },
  { title: "Inbox", url: "/app/inbox", icon: Inbox },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

const orgNav: NavItem[] = [
  { title: "Home", url: "/app", icon: Home, end: true },
  { title: "Orgs", url: "/app/orgs", icon: Building2 },
  { title: "Activities", url: "/app/events", icon: CalendarDays },
  { title: "Circles", url: "/app/circles", icon: Users },
  { title: "Perks I offer", url: "/app/perks/manage", icon: Gift },
  { title: "Operations", url: "/app/crm/tasks", icon: ClipboardList },
  { title: "Billing", url: "/app/finance", icon: Wallet },
  { title: "Insights", url: "/app/insights", icon: BarChart3 },
  { title: "Inbox", url: "/app/inbox", icon: Inbox },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

const navByRole: Partial<Record<AppRole, NavItem[]>> = {
  member: communityNav,
  host: communityNav,
  volunteer_host: communityNav,
  pro: professionalNav,
  professional: professionalNav,
  sponsor: orgNav,
  business: orgNav,
  org_admin: orgNav,
  moderator: orgNav,
  admin: orgNav,
  ops_admin: orgNav,
  super_admin: orgNav,
};

const labelByRole: Partial<Record<AppRole, string>> = {
  member: "Community",
  host: "Community",
  volunteer_host: "Volunteer host",
  pro: "Professional",
  professional: "Professional",
  sponsor: "Sponsor",
  business: "Business",
  org_admin: "Organisation",
  moderator: "Moderation",
  admin: "Admin",
  ops_admin: "Admin",
  super_admin: "Admin",
};

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { activeRole } = useActiveRole();
  const { roles } = useAuth();
  const items = navByRole[activeRole] ?? communityNav;
  const workspaceLabel = labelByRole[activeRole] ?? "Community";
  const canModerate = roles.some((role) => MODERATOR_ROLES.includes(role));
  const navItems = canModerate
    ? [...items.filter((i) => i.url !== "/app/settings"),
       { title: "Admin", url: "/app/admin", icon: SlidersHorizontal } as NavItem,
       { title: "Settings", url: "/app/settings", icon: Settings } as NavItem]
    : items;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarContent className="bg-sidebar/60 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-2.5 px-4">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-sunset shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-2xl bg-gradient-sunset opacity-50 blur-md -z-10" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">Vibely</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {workspaceLabel}
              </span>
            </div>
          )}
        </div>
        <SidebarGroup className="px-2">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
              Navigate
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.url
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="group relative h-9 rounded-xl text-sm font-medium transition-all data-[active=true]:bg-gradient-sunset/10 data-[active=true]:text-primary data-[active=true]:shadow-soft"
                    >
                      <NavLink to={item.url} end={item.end}>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-sunset" />
                        )}
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
        {!collapsed && (
          <div className="mt-auto px-3 pb-4">
            <div className="rounded-2xl border border-primary/20 bg-gradient-sunset/5 p-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="font-display text-xs font-semibold">Vibely AI</p>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Neighbours, ideas, votes — turned into real local activities.
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
