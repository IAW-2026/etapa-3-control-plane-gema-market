import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SHORT_LIFE, TAGS } from "@/lib/cache";
import * as seller from "./seller";
import * as buyer from "./buyer";
import * as shipping from "./shipping";
import * as payments from "./payments";
import { listConsolidatedUsers, type ConsolidatedUsersResult } from "./users";
import type { OrdenDePago } from "./payments";

// Wrappers cacheados de las lecturas. Cada uno marca su scope con `use cache`,
// fija un `cacheLife` corto y un `cacheTag` para invalidación on-demand desde las
// Server Actions (updateTag). Los args (params) entran al cache key.
//
// Importante: dentro de `use cache` no se pueden usar APIs de request
// (cookies/headers/searchParams). Estas funciones solo reciben primitivos y leen
// env + hacen fetch, así que cumplen la restricción.

type Params = Record<string, string | number | undefined>;

// ── Overview (stats) ────────────────────────────────────────────────────────
export async function sellerStats() {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.sellerStats);
  return seller.getStats();
}

export async function buyerStats() {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.buyerStats);
  return buyer.getStats();
}

export async function shippingStats() {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.shippingStats);
  return shipping.getStats();
}

export async function paymentsStats() {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.paymentsStats);
  return payments.getStats();
}

// ── Seller ──────────────────────────────────────────────────────────────────
export async function productos(params: Params) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.sellerProductos);
  return seller.listProductos(params);
}

export async function categorias() {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.sellerCategorias);
  return seller.listCategorias();
}

// ── Payments ────────────────────────────────────────────────────────────────
export async function ordenesDePago(params: Params) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.paymentsOrdenes);
  return payments.listOrdenesDePago(params);
}

// Busca el pago que contiene un order_id entre los pagos recientes (no hay
// lookup directo por order_id en Payments).
export async function paymentByOrder(orderId: string): Promise<OrdenDePago | null> {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.paymentsOrdenes);
  const res = await payments.listOrdenesDePago({ page_size: 100 });
  return res.items.find((p) => p.orders.some((o) => o.order_id === orderId)) ?? null;
}

// ── Buyer ───────────────────────────────────────────────────────────────────
export async function ordenes(params: Params) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.buyerOrdenes);
  return buyer.listOrdenes(params);
}

export async function orden(orderId: string) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.buyerOrdenes);
  return buyer.getOrden(orderId);
}

// ── Shipping ────────────────────────────────────────────────────────────────
export async function envios(params: Params) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.shippingEnvios);
  return shipping.listEnvios(params);
}

export async function drivers(params: Params) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.shippingDrivers);
  return shipping.listDrivers(params);
}

export async function envioByOrder(orderId: string) {
  "use cache";
  cacheLife(SHORT_LIFE);
  cacheTag(TAGS.shippingEnvios);
  return shipping.getEnvioByOrder(orderId);
}

// ── Usuarios (consolidado) ──────────────────────────────────────────────────
export async function consolidatedUsers(params: {
  query?: string;
  page: number;
  pageSize: number;
}): Promise<ConsolidatedUsersResult> {
  "use cache";
  cacheLife(SHORT_LIFE);
  // Depende de Clerk + Seller(usuarios) + Shipping(drivers): se invalida también
  // cuando se suspende un vendedor o se banea un courier.
  cacheTag(TAGS.usersConsolidated);
  return listConsolidatedUsers(params);
}
