import "server-only";
import { fetchJson } from "@/lib/http";
import { type BuyerStats, type Paginated, toQuery } from "./types";

// Cliente tipado del Buyer App.
//
// ⚠️ Estado real: `/api/buyer/admin/*` (stats, ordenes) hoy valida JWT de Clerk,
// NO x-api-key-hash, así que estas llamadas server-side degradan ("App no
// disponible") hasta que el plan 03 acepte API-key. El endpoint interno por id
// (`/api/buyer/:id`) sí valida INTERNAL_API_KEY y funciona.

export type BuyerOrden = {
  order_id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export type Buyer = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  address: string;
  created_at: string;
};

export const getStats = (params: { date_from?: string; date_to?: string } = {}) =>
  fetchJson<BuyerStats>("buyer", `/api/buyer/admin/stats${toQuery(params)}`);

export const listOrdenes = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<BuyerOrden>>(
    "buyer",
    `/api/buyer/admin/ordenes${toQuery(params)}`,
  );

// Detalle de una orden. ⚠️ Endpoint previsto por el plan 03, todavía no existe.
export const getOrden = (orderId: string) =>
  fetchJson<BuyerOrden>("buyer", `/api/buyer/admin/ordenes/${orderId}`);

// Cancelar orden. ⚠️ Endpoint previsto por el plan 03, todavía no existe.
export const cancelOrden = (orderId: string) =>
  fetchJson<BuyerOrden>("buyer", `/api/buyer/admin/ordenes/${orderId}`, {
    init: { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) },
  });

export const getBuyer = (buyerId: string) =>
  fetchJson<Buyer>("buyer", `/api/buyer/${buyerId}`);
