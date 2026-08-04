import {
  Plus, CalendarPlus, MessageSquarePlus, BookmarkPlus, UserPlus, ListChecks, FileText,
  Receipt, ShieldCheck, PhoneCall, Sparkles, CalendarCheck,
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
  { label: "List memorabilia", icon: BookmarkPlus, to: "/app/memorabilia" },
];

const itemsByRole: Partial<Record<AppRole, QuickItem[]>> = {
  host: [
    { label: "New event", icon: CalendarPlus, to: "/app/events/new" },
    { label: "New inquiry", icon: MessageSquarePlus, to: "/app/crm/inquiries" },
    { label: "New shortlist", icon: BookmarkPlus, to: "/app/marketplace/saved" },
    { label: "New task", icon: ListChecks, to: "/app/crm/tasks" },
    { label: "New budget item", icon: Receipt, to: "/app/finance/overview" },
    { label: "New AI planning session", icon: Sparkles, to: "/app/events/new" },
  ],
  pro: [
    { label: "New quote", icon: FileText, to: "/app/finance/invoices" },
    { label: "Update availability", icon: CalendarCheck, to: "/app/calendar/availability" },
    { label: "New invoice", icon: FileText, to: "/app/finance/invoices" },
    { label: "New receipt", icon: Receipt, to: "/app/finance/receipts" },
    { label: "New client note", icon: UserPlus, to: "/app/crm/contacts" },
    { label: "New outbound follow-up call", icon: PhoneCall, to: "/app/crm/calls" },
  ],
  business: [
    { label: "New booking", icon: BookmarkPlus, to: "/app/crm/bookings" },
    { label: "New quote", icon: FileText, to: "/app/finance/invoices" },
    { label: "New contact", icon: UserPlus, to: "/app/crm/contacts" },
    { label: "New invoice", icon: FileText, to: "/app/finance/invoices" },
    { label: "New receipt", icon: Receipt, to: "/app/finance/receipts" },
    { label: "New staff assignment", icon: ListChecks, to: "/app/crm/tasks" },
    { label: "New outbound AI call", icon: PhoneCall, to: "/app/crm/calls" },
    { label: "New insurance request", icon: ShieldCheck, to: "/app/trust/insurance" },
  ],
  admin: [
    { label: "New task", icon: ListChecks, to: "/app/crm/tasks" },
  ],
};

export const QuickCreate = () => {
  const navigate = useNavigate();
  const { activeRole } = useActiveRole();
  const items = itemsByRole[activeRole];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((i) => (
          <DropdownMenuItem key={i.label} onClick={() => navigate(i.to)}>
            <i.icon className="mr-2 h-4 w-4" />
            {i.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
