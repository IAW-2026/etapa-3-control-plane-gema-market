import "server-only";
import { fetchJson } from "@/lib/http";
import { type Paginated, type ShippingStats, toQuery } from "./types";

// Cliente tipado del Shipping App. Valida INTERNAL_API_KEY vía x-api-key-hash.
//
// ⚠️ Estado real: hoy solo existe `GET /api/shipping/envios/:order_id` (y el
// POST de creación). Los endpoints admin (stats, listado de envíos, drivers,
// reasignar/cancelar/banear) los agrega el plan 02 — hasta entonces degradan.

export type Address = {
  street: string;
  number: string;
  zip: string;
  city?: string;
  province?: string;
};

export type Envio = {
  shipping_id: string;
  order_id: string;
  status: string;
  tracking_code: string;
  tracking_url: string;
  pickup_address: Address;
  delivery_address: Address;
  price: number;
  picked_up_at: string | null;
  delivered_at: string | null;
};

export type Driver = {
  user_id: string;
  full_name: string;
  email: string;
  banned: boolean;
  logistics_id: string;
};

// Envío por order_id (endpoint real). Se usa en /ordenes/[order_id].
export const getEnvioByOrder = (orderId: string) =>
  fetchJson<Envio>("shipping", `/api/shipping/envios/${orderId}`);

export const getStats = (params: { date_from?: string; date_to?: string } = {}) =>
  fetchJson<ShippingStats>(
    "shipping",
    `/api/shipping/admin/stats${toQuery(params)}`,
  );

// ⚠️ Endpoints previstos por el plan 02, todavía no existen.
export const listEnvios = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<Envio>>(
    "shipping",
    `/api/shipping/admin/envios${toQuery(params)}`,
  );

export const patchEnvio = (
  shippingId: string,
  body: { status?: string; logistics_id?: string },
) =>
  fetchJson<Envio>("shipping", `/api/shipping/admin/envios/${shippingId}`, {
    init: { method: "PATCH", body: JSON.stringify(body) },
  });

export const listDrivers = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<Driver>>(
    "shipping",
    `/api/shipping/admin/drivers${toQuery(params)}`,
  );

export const patchDriver = (userId: string, body: { banned: boolean }) =>
  fetchJson<Driver>("shipping", `/api/shipping/admin/drivers/${userId}`, {
    init: { method: "PATCH", body: JSON.stringify(body) },
  });
