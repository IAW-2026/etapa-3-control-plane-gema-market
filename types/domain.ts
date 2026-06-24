// Constantes de paginación compartidas por listados y por el componente Pager.
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

// Identificadores de las 4 apps downstream que el Control Plane agrega.
export type AppId = "seller" | "buyer" | "shipping" | "payments";
