import "server-only";
import { listClerkUsers, type ClerkUserLite } from "@/lib/clerk";
import { settle } from "@/lib/http";
import { listUsuarios as listSellerUsuarios } from "./seller";
import { listDrivers } from "./shipping";
import { listOrdenes as listBuyerOrdenes } from "./buyer";
import { listOrdenesDePago } from "./payments";

// Usuario consolidado: Clerk (fuente primaria) cruzado con la presencia/estado
// en cada app. `seller`/`shipping` quedan undefined si el usuario no aparece ahí
// o si esa app no respondió (degradación independiente por fuente).
export type ConsolidatedUser = ClerkUserLite & {
  seller?: { seller_id: string; suspended: boolean };
  shipping?: { user_id: string; banned: boolean };
  buyer?: { user_id: string };
  payments?: { user_id: string };
};

export type ConsolidatedUsersResult = {
  items: ConsolidatedUser[];
  total: number;
  // Fuentes que no respondieron, para avisar en la UI que la vista es parcial.
  degraded: string[];
};

export async function listConsolidatedUsers(params: {
  query?: string;
  page: number;
  pageSize: number;
}): Promise<ConsolidatedUsersResult> {
  const offset = (params.page - 1) * params.pageSize;

  // Clerk es la fuente primaria; si falla, no hay lista que mostrar.
  const clerkPage = await listClerkUsers({
    query: params.query,
    limit: params.pageSize,
    offset,
  });

  // Enriquecimiento por app (no bloqueante).
  const [sellerRes, driverRes, buyerRes, paymentsRes] = await Promise.all([
    settle(listSellerUsuarios({ page_size: 100 })),
    settle(listDrivers({ page_size: 100 })),
    settle(listBuyerOrdenes({ page_size: 100 })),
    settle(listOrdenesDePago({ page_size: 100 })),
  ]);

  const degraded: string[] = [];
  const sellerByClerkId = new Map<string, { seller_id: string; suspended: boolean }>();
  const sellerByEmail = new Map<string, { seller_id: string; suspended: boolean }>();
  if (sellerRes.ok) {
    for (const s of sellerRes.data.items) {
      const entry = { seller_id: s.user_id, suspended: s.suspended };
      sellerByClerkId.set(s.clerk_user_id, entry);
      sellerByEmail.set(s.email.toLowerCase(), entry);
    }
  } else {
    degraded.push("Seller");
  }

  const driverById = new Map<string, { user_id: string; banned: boolean }>();
  const driverByEmail = new Map<string, { user_id: string; banned: boolean }>();
  if (driverRes.ok) {
    for (const d of driverRes.data.items) {
      const entry = { user_id: d.user_id, banned: d.banned };
      driverById.set(d.user_id, entry);
      driverByEmail.set(d.email.toLowerCase(), entry);
    }
  } else {
    degraded.push("Shipping");
  }

  const buyerByClerkId = new Set<string>();
  const buyerByEmail = new Set<string>();
  if (buyerRes.ok) {
    for (const o of buyerRes.data.items) {
      buyerByClerkId.add(o.buyer_id);
      // buyer_id might not be clerk id; also try matching by email if available
      // Note: BuyerOrden doesn't have email, so we only have buyer_id
    }
  } else {
    degraded.push("Buyer");
  }

  const paymentsByClerkId = new Set<string>();
  const paymentsByEmail = new Set<string>();
  if (paymentsRes.ok) {
    for (const p of paymentsRes.data.items) {
      paymentsByClerkId.add(p.buyer_id);
    }
  } else {
    degraded.push("Payments");
  }

  const items: ConsolidatedUser[] = clerkPage.items.map((u) => ({
    ...u,
    seller: sellerByClerkId.get(u.id) ?? sellerByEmail.get(u.email.toLowerCase()),
    shipping: driverById.get(u.id) ?? driverByEmail.get(u.email.toLowerCase()),
    buyer: buyerByClerkId.has(u.id) ? { user_id: u.id } : undefined,
    payments: paymentsByClerkId.has(u.id) ? { user_id: u.id } : undefined,
  }));

  return { items, total: clerkPage.total, degraded };
}
