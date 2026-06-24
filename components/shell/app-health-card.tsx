import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/types/ui";

export type AppHealthCardProps = {
  name: string;
  icon: IconName;
  href: string;
  ok: boolean;
  // KPIs cuando ok; mensaje de error cuando no.
  children?: ReactNode;
  error?: string;
};

// Tarjeta de salud de una app downstream para el Overview. Indica OK / —no
// disponible y muestra sus KPIs o el motivo del fallo (resiliencia allSettled).
export function AppHealthCard({
  name,
  icon,
  href,
  ok,
  children,
  error,
}: AppHealthCardProps) {
  return (
    <div className="bg-paper border border-line rounded-r3 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-bone text-olive flex items-center justify-center">
            <Icon name={icon} size={18} />
          </div>
          <div className="text-sm font-semibold tracking-[-0.01em]">{name}</div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
            ok ? "bg-[#d8e3c8] text-success" : "bg-[#f0d9d1] text-danger"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-success" : "bg-danger"}`}
          />
          {ok ? "OK" : "No disponible"}
        </span>
      </div>

      <div className="px-5 py-4 flex-1">
        {ok ? (
          children
        ) : (
          <div className="text-[13px] text-ink-3 leading-relaxed">
            {error ?? "No pudimos contactar a esta app."}
          </div>
        )}
      </div>

      <Link
        href={href}
        className="flex items-center justify-between px-5 py-3 border-t border-line text-[13px] font-medium text-cocoa hover:bg-cream transition-colors"
      >
        Ir al panel
        <Icon name="arrowRight" size={15} />
      </Link>
    </div>
  );
}
