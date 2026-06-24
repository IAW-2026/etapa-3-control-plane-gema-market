// Formas de respuesta de los endpoints `/admin/stats` de cada app. Mapean 1:1 a
// lo que devuelven Seller y Payments hoy; Buyer existe pero exige JWT (degrada),
// y Shipping aún no expone stats (degrada). Ver docs/05b-control-plane-build.md.

export type SellerStats = {
  total_products: number;
  products_by_status: { active: number; paused: number };
  hidden_products: number;
  total_sales: number;
  total_revenue: number;
  currency: string;
  top_categories: { category_id: string; name: string; count: number }[];
  top_sellers: { seller_id: string; shop_name: string; revenue: number }[];
};

export type BuyerStats = {
  total_orders: number;
  orders_by_status: Record<string, number>;
  average_ticket: number;
  currency: string;
};

export type PaymentsStats = {
  total_payments: number;
  payments_by_status: Record<string, number>;
  total_volume: number;
  currency: string;
  approval_rate: number;
};

// Shipping — GET /api/shipping/admin/stats. La API devuelve un objeto granular en
// shipments_by_status sin un campo raíz `in_transit`. El overview calcula "envíos
// activos" desde acá (pending_pickup + picked_up + in_transit).
export type ShippingStats = {
  total_shipments: number;
  shipments_by_status: {
    waiting_for_courier: number;
    pending_pickup: number;
    picked_up: number;
    in_transit: number;
    delivered: number;
  };
  average_delivery_hours: number;
  on_time_rate: number;
};

// Sobre de paginación común a los listados admin de todas las apps.
export type Paginated<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  sort_by?: string;
  order?: "asc" | "desc";
};

export type ListParams = {
  q?: string;
  page?: number;
  page_size?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  order?: "asc" | "desc";
};

// Convierte params a querystring omitiendo undefined/empty.
export function toQuery(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
