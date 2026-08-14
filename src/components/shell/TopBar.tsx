import { ChevronsUpDown, LogOut, User as UserIcon, Settings as SettingsIcon, Check, PartyPopper, Briefcase, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickCreate } from "./QuickCreate";
import { AccessibilityMenu, LanguageMenu } from "./PreferencesMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useActiveRole } from "@/hooks/useActiveRole";

const roleMeta: Partial<Record<AppRole, { label: string; icon: typeof PartyPopper }>> = {
  host: { label: "Host", icon: PartyPopper },
  member: { label: "Member", icon: PartyPopper },
  volunteer_host: { label: "Volunteer host", icon: PartyPopper },
  pro: { label: "Pro", icon: Briefcase },
  professional: { label: "Professional", icon: Briefcase },
  sponsor: { label: "Sponsor", icon: Building2 },
  business: { label: "Business", icon: Building2 },
  org_admin: { label: "Org admin", icon: Building2 },
  moderator: { label: "Moderator", icon: Sparkles },
  admin: { label: "Admin", icon: Sparkles },
  ops_admin: { label: "Ops admin", icon: Sparkles },
  super_admin: { label: "Super admin", icon: Sparkles },
};

const metaFor = (role: AppRole) => roleMeta[role] ?? { label: "Member", icon: PartyPopper };

const MEMBER_ROLES: AppRole[] = ["member", "host", "volunteer_host"];

export const TopBar = () => {
  const { profile, signOut } = useAuth();
  const { activeRole, roles, setActiveRole, hasMultipleRoles } = useActiveRole();
  const navigate = useNavigate();
  const initials = (profile?.full_name || profile?.email || "U").slice(0, 2).toUpperCase();
  const ActiveIcon = metaFor(activeRole).icon;
  const showQuickCreate = !MEMBER_ROLES.includes(activeRole) || hasMultipleRoles;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/40 bg-background/60 px-3 backdrop-blur-xl md:h-16 md:px-6">
      <SidebarTrigger className="hover:bg-muted/60" />
      {hasMultipleRoles ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden h-10 gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 text-sm backdrop-blur md:inline-flex">
              <ActiveIcon className="h-4 w-4 text-primary" />
              {metaFor(activeRole).label}
              <ChevronsUpDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((r) => {
              const Meta = metaFor(r);
              const Icon = Meta.icon;
              return (
                <DropdownMenuItem key={r} onClick={() => setActiveRole(r).then(() => navigate("/app"))}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="flex-1">{Meta.label}</span>
                  {r === activeRole && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="hidden text-sm font-medium text-muted-foreground md:inline">
          {metaFor(activeRole).label}
        </span>
      )}
      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <LanguageMenu />
        <AccessibilityMenu />
        {showQuickCreate && <QuickCreate />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full ring-1 ring-border/60 hover:ring-primary/40">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-sunset text-xs text-primary-foreground font-semibold">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{profile?.full_name || profile?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/settings")}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/settings")}><SettingsIcon className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut().then(() => navigate("/"))}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
