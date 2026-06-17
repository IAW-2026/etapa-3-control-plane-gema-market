// Tags de invalidación y perfil de vida de caché del Control Plane.
//
// Estrategia: las lecturas se cachean con `use cache` (ver lib/services/cached.ts)
// y se etiquetan con estos tags; las Server Actions invalidan el tag afectado con
// `updateTag` (read-your-own-writes). El `cacheLife` es corto porque es un panel
// operativo: queremos datos casi frescos aun sin una mutación de por medio.

export const TAGS = {
  sellerStats: "seller:stats",
  sellerProductos: "seller:productos",
  sellerSellers: "seller:sellers",
  sellerCategorias: "seller:categorias",
  sellerUsuarios: "seller:usuarios",
  buyerStats: "buyer:stats",
  buyerOrdenes: "buyer:ordenes",
  shippingStats: "shipping:stats",
  shippingEnvios: "shipping:envios",
  shippingDrivers: "shipping:drivers",
  paymentsStats: "payments:stats",
  paymentsOrdenes: "payments:ordenes",
  usersConsolidated: "users:consolidated",
} as const;

// Perfil corto: sirve stale hasta 30s (mínimo que impone el router cliente),
// revalida en background al minuto, expira a los 5'. Las mutaciones lo cortan
// antes vía updateTag.
export const SHORT_LIFE = { stale: 30, revalidate: 60, expire: 300 } as const;
