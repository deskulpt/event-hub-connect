import { Plus, CalendarPlus, MessageSquarePlus, BookmarkPlus, UserPlus, ListChecks, FileText, Receipt, ShieldCheck, PhoneCall } from "lucide-react";
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

const items = [
  { label: "New event", icon: CalendarPlus, to: "/app/events/new" },
  { label: "New inquiry", icon: MessageSquarePlus, to: "/app/crm/inquiries" },
  { label: "New booking", icon: BookmarkPlus, to: "/app/crm/bookings" },
  { label: "New contact", icon: UserPlus, to: "/app/crm/contacts" },
  { label: "New task", icon: ListChecks, to: "/app/crm/tasks" },
  { label: "New invoice", icon: FileText, to: "/app/finance/invoices" },
  { label: "New receipt", icon: Receipt, to: "/app/finance/receipts" },
  { label: "New insurance request", icon: ShieldCheck, to: "/app/trust/insurance" },
  { label: "New outbound AI call", icon: PhoneCall, to: "/app/crm/calls" },
];

export const QuickCreate = () => {
  const navigate = useNavigate();
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
