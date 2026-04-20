import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  rightRail?: ReactNode;
  footer?: ReactNode;
}

export const PageLayout = ({ children, rightRail, footer }: PageLayoutProps) => (
  <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 animate-fade-in">
    <div className={rightRail ? "grid gap-6 lg:grid-cols-[1fr_340px]" : ""}>
      <div className="min-w-0 space-y-5">{children}</div>
      {rightRail && <aside className="space-y-4">{rightRail}</aside>}
    </div>
    {footer}
  </div>
);
