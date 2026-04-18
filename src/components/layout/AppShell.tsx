import { ReactNode } from "react";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
