import {
  Home, CalendarDays, Users, Gift, Vote, Building2, Settings,
  MessageSquare, Bookmark, ShieldCheck, ClipboardList, Sparkles, SlidersHorizontal,
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
import { usePreferences } from "@/contexts/PreferencesContext";

type NavItem = { titleKey: string; fallback: string; url: string; icon: typeof Home; end?: boolean };

/** Senior-first: only flows that are wired and useful day-to-day. */
const communityNav: NavItem[] = [
  { titleKey: "nav.home", fallback: "Home", url: "/app", icon: Home, end: true },
  { titleKey: "nav.activities", fallback: "Activities", url: "/app/events", icon: CalendarDays },
  { titleKey: "nav.vote", fallback: "Vote", url: "/app/proposals", icon: Vote },
  { titleKey: "nav.circles", fallback: "Circles", url: "/app/circles", icon: Users },
  { titleKey: "nav.perks", fallback: "Perks", url: "/app/perks", icon: Gift },
  { titleKey: "nav.settings", fallback: "Settings", url: "/app/settings", icon: Settings },
];

/** Pros: working lead/booking tools only — no placeholder finance/calendar shells. */
const professionalNav: NavItem[] = [
  { titleKey: "nav.home", fallback: "Home", url: "/app", icon: Home, end: true },
  { titleKey: "nav.leads", fallback: "Leads", url: "/app/crm/inquiries", icon: MessageSquare },
  { titleKey: "nav.bookings", fallback: "Bookings", url: "/app/crm/bookings", icon: Bookmark },
  { titleKey: "nav.activities", fallback: "Activities", url: "/app/events", icon: CalendarDays },
  { titleKey: "nav.perksOffer", fallback: "Perks I offer", url: "/app/perks/manage", icon: Gift },
  { titleKey: "nav.credentials", fallback: "Credentials", url: "/app/trust/credentials", icon: ShieldCheck },
  { titleKey: "nav.settings", fallback: "Settings", url: "/app/settings", icon: Settings },
];

/** Orgs/sponsors: real org + sponsorship surfaces only. */
const orgNav: NavItem[] = [
  { titleKey: "nav.home", fallback: "Home", url: "/app", icon: Home, end: true },
  { titleKey: "nav.orgs", fallback: "Orgs", url: "/app/orgs", icon: Building2 },
  { titleKey: "nav.sponsorships", fallback: "Sponsorships", url: "/app/orgs/sponsorships", icon: Gift },
  { titleKey: "nav.activities", fallback: "Activities", url: "/app/events", icon: CalendarDays },
  { titleKey: "nav.circles", fallback: "Circles", url: "/app/circles", icon: Users },
  { titleKey: "nav.perksOffer", fallback: "Perks I offer", url: "/app/perks/manage", icon: Gift },
  { titleKey: "nav.tasks", fallback: "Tasks", url: "/app/crm/tasks", icon: ClipboardList },
  { titleKey: "nav.settings", fallback: "Settings", url: "/app/settings", icon: Settings },
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
  const { t } = usePreferences();
  const items = navByRole[activeRole] ?? communityNav;
  const workspaceLabel = labelByRole[activeRole] ?? "Community";
  const canModerate = roles.some((role) => MODERATOR_ROLES.includes(role));
  const navItems = canModerate
    ? [
        ...items.filter((i) => i.url !== "/app/settings"),
        { titleKey: "nav.admin", fallback: "Admin", url: "/app/admin", icon: SlidersHorizontal } as NavItem,
        { titleKey: "nav.settings", fallback: "Settings", url: "/app/settings", icon: Settings } as NavItem,
      ]
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
                const label = t(item.titleKey) !== item.titleKey ? t(item.titleKey) : item.fallback;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="group relative h-11 rounded-xl text-base font-medium transition-all data-[active=true]:bg-gradient-sunset/10 data-[active=true]:text-primary data-[active=true]:shadow-soft"
                    >
                      <NavLink to={item.url} end={item.end}>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-sunset" />
                        )}
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{label}</span>}
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
