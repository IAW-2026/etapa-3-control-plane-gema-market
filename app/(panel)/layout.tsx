import type { ReactNode } from "react";
import { ControlChrome } from "@/components/shell/control-chrome";

// Layout de las páginas autenticadas. El middleware ya garantizó sesión +
// superadmin antes de llegar acá; este layout solo monta el chrome (SideNav +
// BottomNav). /sign-in y /unauthorized viven fuera del grupo y no lo usan.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return <ControlChrome>{children}</ControlChrome>;
}
