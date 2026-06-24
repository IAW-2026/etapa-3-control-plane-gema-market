"use server";

import { updateTag } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/role";
import { patchEnvio } from "@/lib/services/shipping";
import { TAGS } from "@/lib/cache";

// Reasignar courier / cambiar estado de un envío (Shipping App). ⚠️ Endpoint
// previsto por el plan 02; degrada hasta que exista.
export async function patchEnvioAction(
  shippingId: string,
  body: { status?: string; logistics_id?: string },
): Promise<void> {
  await requireSuperadmin();
  await patchEnvio(shippingId, body);
  updateTag(TAGS.shippingEnvios);
  updateTag(TAGS.shippingStats);
}
