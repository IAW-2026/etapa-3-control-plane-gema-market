"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { CONTROL_NAV } from "@/lib/ui/nav";

type ControlNavProps = {
  variant: "sidebar" | "bottom-tab";
};

const ROOT = "/";

function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || (href !== ROOT && pathname.startsWith(href));
}

export function ControlNav({ variant }: ControlNavProps) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-0.5" aria-label="Navegación Control Plane">
        {CONTROL_NAV.map((item) => {
          const isActive = isActiveHref(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left ${isActive ? "bg-bone text-cocoa font-semibold" : "bg-transparent text-ink-2 font-medium"}`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="flex lgx:hidden fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-[12px] border-t border-line justify-around px-1 pt-2 pb-3 z-40"
      aria-label="Navegación Control Plane"
    >
      {CONTROL_NAV.map((item) => {
        const isActive = isActiveHref(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-[3px] px-1 py-1.5 rounded-[10px] relative flex-1 min-w-0 ${isActive ? "text-cocoa" : "text-ink-3"}`}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[9px] font-medium max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {item.label}
            </span>
            {isActive && (
              <div className="absolute top-0 w-3.5 h-0.5 bg-cocoa rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
