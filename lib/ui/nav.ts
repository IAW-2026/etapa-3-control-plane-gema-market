import type { IconName } from "@/types/ui";

export type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  href: string;
};

// Navegación del Control Plane. El item raíz es `/` (overview); el resto son los
// paneles cross-app. El orden sigue al plan: overview → usuarios → productos →
// envíos → órdenes → pagos → categorías.
export const CONTROL_NAV: ReadonlyArray<NavItem> = [
  { id: "overview", label: "Overview", icon: "chart", href: "/" },
  { id: "usuarios", label: "Usuarios", icon: "user", href: "/usuarios" },
  { id: "productos", label: "Productos", icon: "box", href: "/productos" },
  { id: "envios", label: "Envíos", icon: "truck", href: "/envios" },
  { id: "ordenes", label: "Órdenes", icon: "cart", href: "/ordenes" },
  { id: "pagos", label: "Pagos", icon: "wallet", href: "/pagos" },
  { id: "categorias", label: "Categorías", icon: "grid", href: "/categorias" },
];
