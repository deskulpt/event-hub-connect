import { Bell, Search, Sparkles, ChevronsUpDown, LogOut, User as UserIcon, Settings as SettingsIcon, Check, PartyPopper, Briefcase, Building2, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickCreate } from "./QuickCreate";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
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

export const TopBar = () => {
  const { profile, signOut } = useAuth();
  const { activeRole, roles, setActiveRole, hasMultipleRoles } = useActiveRole();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const initials = (profile?.full_name || profile?.email || "U").slice(0, 2).toUpperCase();
  const ActiveIcon = metaFor(activeRole).icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/40 bg-background/60 px-3 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="hover:bg-muted/60" />
      {hasMultipleRoles ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden h-9 gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 text-xs backdrop-blur md:inline-flex">
              <ActiveIcon className="h-3.5 w-3.5 text-primary" />
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
        <Button variant="ghost" size="sm" className="hidden h-9 gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 text-xs md:inline-flex" disabled>
          <ActiveIcon className="h-3.5 w-3.5 text-primary" />
          {metaFor(activeRole).label}
        </Button>
      )}
      <button
        onClick={() => setAiOpen(true)}
        className="group relative ml-2 hidden max-w-md flex-1 items-center md:flex"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          readOnly
          placeholder="Search or ask AI…"
          className="h-9 cursor-pointer rounded-full border-border/60 bg-card/60 pl-10 pr-20 backdrop-blur transition-colors group-hover:border-primary/40 group-hover:bg-card"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full border border-primary/30 bg-gradient-sunset/10 px-3 text-primary hover:bg-gradient-sunset/20" onClick={() => setAiOpen(true)}>
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
        </Button>
        <QuickCreate />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full ring-1 ring-border/60 hover:ring-primary/40">
              <Avatar className="h-8 w-8">
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

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI command bar
            </DialogTitle>
            <DialogDescription>
              Try: "Plan my event", "Find best-fit venues", "Call top 5 and confirm availability". Coming soon.
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="What do you want to do?" disabled />
        </DialogContent>
      </Dialog>
    </header>
  );
};
