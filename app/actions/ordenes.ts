"use server";

import { updateTag } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/role";
import { cancelOrden } from "@/lib/services/buyer";
import { TAGS } from "@/lib/cache";

// Cancelar una orden (Buyer App). ⚠️ El endpoint lo agrega el plan 03; mientras
// no exista, la acción degradará con error y el toast lo informará.
export async function cancelOrdenAction(orderId: string): Promise<void> {
  await requireSuperadmin();
  await cancelOrden(orderId);
  updateTag(TAGS.buyerOrdenes);
  updateTag(TAGS.buyerStats);
}
