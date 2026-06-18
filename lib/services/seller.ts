import "server-only";
import { fetchJson } from "@/lib/http";
import {
  type Paginated,
  type SellerStats,
  toQuery,
} from "./types";

// Cliente tipado del Seller App. Todos los endpoints viven bajo
// `/api/seller/admin/*` y validan SELLER_INTERNAL_API_KEY vía x-api-key-hash.

export type SellerProducto = {
  product_id: string;
  seller_id: string;
  seller_name: string;
  title: string;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  category_id: string;
  category_name: string;
  status: "active" | "paused";
  condition: "nuevo" | "usado";
  stock: number;
  hidden_by_admin: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type SellerSeller = {
  seller_id: string;
  shop_name: string;
  email: string;
  phone: string;
  city: string;
  suspended: boolean;
  total_products: number;
  created_at: string;
};

export type SellerCategoria = {
  category_id: string;
  name: string;
  product_count: number;
};

export type SellerUsuario = {
  user_id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  shop_name: string;
  role: "seller";
  suspended: boolean;
  created_at: string;
};

export type SellerVenta = {
  venta_id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string;
  amount: number;
  fee: number;
  status: "paid" | "shipping" | "delivered" | "shipping_failed";
  tracking_code: string | null;
  created_at: string;
};

export const getStats = (params: { date_from?: string; date_to?: string } = {}) =>
  fetchJson<SellerStats>("seller", `/api/seller/admin/stats${toQuery(params)}`);

export const listProductos = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<SellerProducto>>(
    "seller",
    `/api/seller/admin/productos${toQuery(params)}`,
  );

export const patchProducto = (
  productId: string,
  body: { hidden_by_admin?: boolean; status?: "active" | "paused" },
) =>
  fetchJson<{ product_id: string; status: string; hidden_by_admin: boolean }>(
    "seller",
    `/api/seller/admin/productos/${productId}`,
    { init: { method: "PATCH", body: JSON.stringify(body) } },
  );

export const listSellers = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<SellerSeller>>(
    "seller",
    `/api/seller/admin/sellers${toQuery(params)}`,
  );

export const patchSeller = (sellerId: string, body: { suspended: boolean }) =>
  fetchJson<{ seller_id: string; suspended: boolean }>(
    "seller",
    `/api/seller/admin/sellers/${sellerId}`,
    { init: { method: "PATCH", body: JSON.stringify(body) } },
  );

export const listUsuarios = (params: { page?: number; page_size?: number } = {}) =>
  fetchJson<Paginated<SellerUsuario>>(
    "seller",
    `/api/seller/admin/usuarios${toQuery(params)}`,
  );

export const listVentas = (
  params: Record<string, string | number | undefined> = {},
) =>
  fetchJson<Paginated<SellerVenta>>(
    "seller",
    `/api/seller/admin/ventas${toQuery(params)}`,
  );

export const listCategorias = () =>
  fetchJson<SellerCategoria[]>("seller", `/api/seller/admin/categorias`);

export const createCategoria = (name: string) =>
  fetchJson<{ category_id: string; name: string }>(
    "seller",
    `/api/seller/admin/categorias`,
    { init: { method: "POST", body: JSON.stringify({ name }) } },
  );

export const patchCategoria = (id: string, name: string) =>
  fetchJson<{ category_id: string; name: string }>(
    "seller",
    `/api/seller/admin/categorias/${id}`,
    { init: { method: "PATCH", body: JSON.stringify({ name }) } },
  );

export const deleteCategoria = (id: string) =>
  fetchJson<{ ok: true }>("seller", `/api/seller/admin/categorias/${id}`, {
    init: { method: "DELETE" },
  });
