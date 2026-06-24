import type { ReactNode } from "react";
import { SignOutButton } from "./sign-out-button";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
};

// Header de página: barra centrada en mobile, header amplio en lgx+. Copia el
// patrón del Seller App para mantener consistencia visual.
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <>
      <div className="block lgx:hidden">
        <div className="sticky top-0 z-30 bg-paper/95 backdrop-blur-[12px] px-4 border-b border-line flex items-center justify-between min-h-[52px]">
          <div className="w-12 shrink-0" />
          <div className="text-center flex-1 px-3 min-w-0">
            {subtitle && (
              <div className="text-[9.5px] font-mono text-ink-3 uppercase tracking-[0.1em] leading-none">
                {subtitle}
              </div>
            )}
            <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              {title}
            </div>
          </div>
          <div className="w-12 shrink-0 flex justify-end">
            <SignOutButton variant="header-icon" />
          </div>
        </div>
      </div>

      <header className="hidden lgx:flex bg-paper border-b border-line px-7 py-5 justify-between items-end gap-4 flex-wrap">
        <div>
          {subtitle && (
            <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-ink-3 mb-1">
              {subtitle}
            </div>
          )}
          <h1 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">
            {title}
          </h1>
        </div>
        {action}
      </header>
    </>
  );
}
