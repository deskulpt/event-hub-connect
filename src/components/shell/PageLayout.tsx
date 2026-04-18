import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  rightRail?: ReactNode;
  footer?: ReactNode;
}

export const PageLayout = ({ children, rightRail, footer }: PageLayoutProps) => (
  <div className="flex flex-col gap-6">
    <div className={rightRail ? "grid gap-6 lg:grid-cols-[1fr_320px]" : ""}>
      <div className="min-w-0 space-y-4">{children}</div>
      {rightRail && <aside className="space-y-4">{rightRail}</aside>}
    </div>
    {footer}
  </div>
);
