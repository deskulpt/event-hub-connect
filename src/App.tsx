import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/auth/Auth";
import ResetPassword from "./pages/auth/ResetPassword";
import Onboarding from "./pages/auth/Onboarding";
import InvitePage from "./pages/InvitePage";
import { AppLayout } from "./layouts/AppLayout";

import Home from "./pages/app/Home";
import AllEvents from "./pages/app/events/AllEvents";
import EventDetail from "./pages/app/events/EventDetail";
import EventNew from "./pages/app/events/EventNew";
import Discover from "./pages/app/marketplace/Discover";
import Venues from "./pages/app/marketplace/Venues";
import Pros from "./pages/app/marketplace/Pros";
import Businesses from "./pages/app/marketplace/Businesses";
import Compare from "./pages/app/marketplace/Compare";
import Saved from "./pages/app/marketplace/Saved";
import ListingDetail from "./pages/app/marketplace/ListingDetail";
import Pipeline from "./pages/app/crm/Pipeline";
import Contacts from "./pages/app/crm/Contacts";
import Conversations from "./pages/app/crm/Conversations";
import Inquiries from "./pages/app/crm/Inquiries";
import Calls from "./pages/app/crm/Calls";
import Bookings from "./pages/app/crm/Bookings";
import Tasks from "./pages/app/crm/Tasks";
import MasterCalendar from "./pages/app/calendar/Master";
import Availability from "./pages/app/calendar/Availability";
import Scheduling from "./pages/app/calendar/Scheduling";
import FinanceOverview from "./pages/app/finance/Overview";
import Transactions from "./pages/app/finance/Transactions";
import Invoices from "./pages/app/finance/Invoices";
import Receipts from "./pages/app/finance/Receipts";
import Payouts from "./pages/app/finance/Payouts";
import Pnl from "./pages/app/finance/Pnl";
import Integrations from "./pages/app/finance/Integrations";
import Verification from "./pages/app/trust/Verification";
import Insurance from "./pages/app/trust/Insurance";
import Reviews from "./pages/app/trust/Reviews";
import Disputes from "./pages/app/trust/Disputes";
import Policies from "./pages/app/trust/Policies";
import Inbox from "./pages/app/Inbox";
import Insights from "./pages/app/Insights";
import Settings from "./pages/app/settings/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Circles } from "./pages/app/circles/Circles";
import { Proposals } from "./pages/app/proposals/Proposals";
import { Perks } from "./pages/app/perks/Perks";
import { ManagePerks } from "./pages/app/perks/ManagePerks";
import { Memorabilia } from "./pages/app/memorabilia/Memorabilia";
import { Orgs } from "./pages/app/orgs/Orgs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/i/:slug" element={<InvitePage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="circles" element={<Circles />} />
              <Route path="proposals" element={<Proposals />} />
              <Route path="perks" element={<Perks />} />
              <Route path="perks/manage" element={<ManagePerks />} />
              <Route path="memorabilia" element={<Memorabilia />} />
              <Route path="orgs" element={<Orgs />} />
              <Route path="events" element={<AllEvents />} />
              <Route path="events/new" element={<EventNew />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="marketplace" element={<Discover />} />
              <Route path="marketplace/venues" element={<Venues />} />
              <Route path="marketplace/pros" element={<Pros />} />
              <Route path="marketplace/businesses" element={<Businesses />} />
              <Route path="marketplace/compare" element={<Compare />} />
              <Route path="marketplace/saved" element={<Saved />} />
              <Route path="marketplace/:type/:id" element={<ListingDetail />} />
              <Route path="crm" element={<Pipeline />} />
              <Route path="crm/contacts" element={<Contacts />} />
              <Route path="crm/conversations" element={<Conversations />} />
              <Route path="crm/inquiries" element={<Inquiries />} />
              <Route path="crm/calls" element={<Calls />} />
              <Route path="crm/bookings" element={<Bookings />} />
              <Route path="crm/tasks" element={<Tasks />} />
              <Route path="calendar" element={<MasterCalendar />} />
              <Route path="calendar/availability" element={<Availability />} />
              <Route path="calendar/scheduling" element={<Scheduling />} />
              <Route path="finance" element={<FinanceOverview />} />
              <Route path="finance/transactions" element={<Transactions />} />
              <Route path="finance/invoices" element={<Invoices />} />
              <Route path="finance/receipts" element={<Receipts />} />
              <Route path="finance/payouts" element={<Payouts />} />
              <Route path="finance/pnl" element={<Pnl />} />
              <Route path="finance/integrations" element={<Integrations />} />
              <Route path="trust" element={<Verification />} />
              <Route path="trust/insurance" element={<Insurance />} />
              <Route path="trust/reviews" element={<Reviews />} />
              <Route path="trust/disputes" element={<Disputes />} />
              <Route path="trust/policies" element={<Policies />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="insights" element={<Insights />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/*" element={<Settings />} />
            </Route>

            <Route path="/app/*" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
