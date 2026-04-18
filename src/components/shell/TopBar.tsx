import { Bell, Search, Sparkles, ChevronsUpDown, LogOut, User as UserIcon, Settings as SettingsIcon, Check, PartyPopper, Briefcase, Building2 } from "lucide-react";
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

const roleMeta: Record<AppRole, { label: string; icon: typeof PartyPopper }> = {
  host: { label: "Host workspace", icon: PartyPopper },
  pro: { label: "Pro workspace", icon: Briefcase },
  business: { label: "Business workspace", icon: Building2 },
  admin: { label: "Admin workspace", icon: ShieldIcon },
};

// fallback for admin icon import — reuse Sparkles
const ShieldIcon = Sparkles;

export const TopBar = () => {
  const { profile, signOut } = useAuth();
  const { activeRole, roles, setActiveRole, hasMultipleRoles } = useActiveRole();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const initials = (profile?.full_name || profile?.email || "U").slice(0, 2).toUpperCase();
  const ActiveIcon = roleMeta[activeRole].icon;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-md">
      <SidebarTrigger />
      {hasMultipleRoles ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden gap-1.5 text-xs md:inline-flex">
              <ActiveIcon className="h-3.5 w-3.5 text-primary" />
              {roleMeta[activeRole].label}
              <ChevronsUpDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((r) => {
              const Meta = roleMeta[r];
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
        <Button variant="ghost" size="sm" className="hidden gap-1.5 text-xs md:inline-flex" disabled>
          <ActiveIcon className="h-3.5 w-3.5 text-primary" />
          {roleMeta[activeRole].label}
        </Button>
      )}
      <div className="relative ml-2 hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events, vendors, contacts…" className="h-9 pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAiOpen(true)}>
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <QuickCreate />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
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
            <DialogTitle>AI command bar</DialogTitle>
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
