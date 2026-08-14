import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
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
import Settings from "./pages/app/settings/Settings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireStaff } from "./components/RequireStaff";
import { Circles } from "./pages/app/circles/Circles";
import { CircleDetail } from "./pages/app/circles/CircleDetail";
import { Proposals } from "./pages/app/proposals/Proposals";
import { Perks } from "./pages/app/perks/Perks";
import { ManagePerks } from "./pages/app/perks/ManagePerks";
import { Orgs } from "./pages/app/orgs/Orgs";
import { OrgDetail } from "./pages/app/orgs/OrgDetail";
import { Sponsorships } from "./pages/app/orgs/Sponsorships";
import { Admin } from "./pages/app/admin/Admin";
import { Credentials } from "./pages/app/trust/Credentials";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PreferencesProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/i/:slug" element={<InvitePage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="circles" element={<Circles />} />
                <Route path="circles/:id" element={<CircleDetail />} />
                <Route path="proposals" element={<Proposals />} />
                <Route path="perks" element={<Perks />} />
                <Route path="perks/manage" element={<ManagePerks />} />
                <Route path="orgs" element={<Orgs />} />
                <Route path="orgs/sponsorships" element={<Sponsorships />} />
                <Route path="orgs/:id" element={<OrgDetail />} />
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
                {/* Placeholder shells hidden — redirect seniors to Home */}
                <Route path="calendar" element={<Navigate to="/app" replace />} />
                <Route path="calendar/*" element={<Navigate to="/app" replace />} />
                <Route path="finance" element={<Navigate to="/app" replace />} />
                <Route path="finance/*" element={<Navigate to="/app" replace />} />
                <Route path="trust" element={<Navigate to="/app" replace />} />
                <Route path="trust/credentials" element={<Credentials />} />
                <Route path="trust/*" element={<Navigate to="/app" replace />} />
                <Route path="inbox" element={<Navigate to="/app" replace />} />
                <Route path="insights" element={<Navigate to="/app" replace />} />
                <Route path="memorabilia" element={<Navigate to="/app" replace />} />
                <Route
                  path="admin"
                  element={
                    <RequireStaff>
                      <Admin />
                    </RequireStaff>
                  }
                />
                <Route
                  path="admin/*"
                  element={
                    <RequireStaff>
                      <Admin />
                    </RequireStaff>
                  }
                />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/*" element={<Settings />} />
              </Route>

              <Route path="/app/*" element={<Navigate to="/app" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PreferencesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
