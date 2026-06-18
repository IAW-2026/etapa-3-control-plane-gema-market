import "server-only";
import { listClerkUsers, type ClerkUserLite } from "@/lib/clerk";
import { settle } from "@/lib/http";
import { listUsuarios as listSellerUsuarios } from "./seller";
import { listDrivers } from "./shipping";

// Usuario consolidado: Clerk (fuente primaria) cruzado con la presencia/estado
// en cada app. `seller`/`shipping` quedan undefined si el usuario no aparece ahí
// o si esa app no respondió (degradación independiente por fuente).
export type ConsolidatedUser = ClerkUserLite & {
  seller?: { seller_id: string; suspended: boolean };
  shipping?: { user_id: string; banned: boolean };
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
  const [sellerRes, driverRes] = await Promise.all([
    settle(listSellerUsuarios({ page_size: 100 })),
    settle(listDrivers({ page_size: 100 })),
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
  if (driverRes.ok) {
    for (const d of driverRes.data.items) {
      driverById.set(d.user_id, { user_id: d.user_id, banned: d.banned });
    }
  } else {
    degraded.push("Shipping");
  }

  const items: ConsolidatedUser[] = clerkPage.items.map((u) => ({
    ...u,
    seller: sellerByClerkId.get(u.id) ?? sellerByEmail.get(u.email.toLowerCase()),
    shipping: driverById.get(u.id),
  }));

  return { items, total: clerkPage.total, degraded };
}
