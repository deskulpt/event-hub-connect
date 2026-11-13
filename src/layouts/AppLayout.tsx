import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { TopBar } from "@/components/shell/TopBar";
import { DemoBanner } from "@/components/shell/DemoBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const AppLayout = () => (
  <ProtectedRoute>
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-mesh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DemoBanner />
          <TopBar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </ProtectedRoute>
);
