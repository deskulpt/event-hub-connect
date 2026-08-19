import {
  Plus, CalendarPlus, MessageSquarePlus, BookmarkPlus, UserPlus, ListChecks, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useActiveRole } from "@/hooks/useActiveRole";
import type { AppRole } from "@/contexts/AuthContext";

type QuickItem = { label: string; icon: typeof Plus; to: string };

const memberItems: QuickItem[] = [
  { label: "Create activity", icon: CalendarPlus, to: "/app/events/new" },
  { label: "Start a circle", icon: UserPlus, to: "/app/circles" },
  { label: "Vote on proposals", icon: Sparkles, to: "/app/proposals" },
];

const itemsByRole: Partial<Record<AppRole, QuickItem[]>> = {
  member: memberItems,
  host: memberItems,
  volunteer_host: memberItems,
  pro: [
    { label: "View leads", icon: MessageSquarePlus, to: "/app/crm/inquiries" },
    { label: "Bookings", icon: BookmarkPlus, to: "/app/crm/bookings" },
    { label: "New activity", icon: CalendarPlus, to: "/app/events/new" },
  ],
  professional: [
    { label: "View leads", icon: MessageSquarePlus, to: "/app/crm/inquiries" },
    { label: "Bookings", icon: BookmarkPlus, to: "/app/crm/bookings" },
    { label: "New activity", icon: CalendarPlus, to: "/app/events/new" },
  ],
  business: [
    { label: "New booking", icon: BookmarkPlus, to: "/app/crm/bookings" },
    { label: "New contact", icon: UserPlus, to: "/app/crm/contacts" },
    { label: "Tasks", icon: ListChecks, to: "/app/crm/tasks" },
  ],
  sponsor: [
    { label: "Sponsorships", icon: BookmarkPlus, to: "/app/orgs/sponsorships" },
    { label: "Orgs", icon: UserPlus, to: "/app/orgs" },
  ],
  org_admin: [
    { label: "Sponsorships", icon: BookmarkPlus, to: "/app/orgs/sponsorships" },
    { label: "Tasks", icon: ListChecks, to: "/app/crm/tasks" },
  ],
  admin: [
    { label: "Admin", icon: ListChecks, to: "/app/admin" },
  ],
};

export const QuickCreate = () => {
  const navigate = useNavigate();
  const { activeRole } = useActiveRole();
  const items = itemsByRole[activeRole] ?? memberItems;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Quick actions">
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem key={item.label} onClick={() => navigate(item.to)}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
