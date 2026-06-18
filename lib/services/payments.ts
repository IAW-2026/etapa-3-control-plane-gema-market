import "server-only";
import { fetchJson } from "@/lib/http";
import { type Paginated, type PaymentsStats, toQuery } from "./types";

// Cliente tipado del Payments App. `/api/payments/admin/*` valida
// INTERNAL_API_KEY vía x-api-key-hash.

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "in_mediation";

export type OrdenDePago = {
  payment_id: string;
  buyer_id: string;
  orders: {
    order_id: string;
    seller_id: string;
    product_id: string;
    product_name?: string;
    quantity?: number;
    quote_id?: string;
    amount: number;
  }[];
  total_amount: number;
  currency: string;
  status: PaymentStatus;
  mp_payment_id?: string | null;
  mp_status_detail?: string | null;
  created_at: string;
  paid_at?: string | null;
};

export const getStats = (params: { date_from?: string; date_to?: string } = {}) =>
  fetchJson<PaymentsStats>(
    "payments",
    `/api/payments/admin/stats${toQuery(params)}`,
  );

export const listOrdenesDePago = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<OrdenDePago>>(
    "payments",
    `/api/payments/admin/ordenes-de-pago${toQuery(params)}`,
  );

// Detalle por payment_id (endpoint no-admin, también con API-key). Se usa en la
// vista correlacionada de /ordenes/[order_id].
export const getOrdenDePago = (paymentId: string) =>
  fetchJson<OrdenDePago>(
    "payments",
    `/api/payments/ordenes-de-pago/${paymentId}`,
  );
