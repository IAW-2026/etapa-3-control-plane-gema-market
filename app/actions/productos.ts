"use server";

import { updateTag } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/role";
import { patchProducto } from "@/lib/services/seller";
import { TAGS } from "@/lib/cache";

function invalidate() {
  updateTag(TAGS.sellerProductos);
  updateTag(TAGS.sellerStats);
}

// Ocultar/mostrar un producto del catálogo (moderación). Reversible.
export async function setProductoHiddenAction(
  productId: string,
  hidden: boolean,
): Promise<void> {
  await requireSuperadmin();
  await patchProducto(productId, { hidden_by_admin: hidden });
  invalidate();
}

// Pausar/activar un producto.
export async function setProductoStatusAction(
  productId: string,
  status: "active" | "paused",
): Promise<void> {
  await requireSuperadmin();
  await patchProducto(productId, { status });
  invalidate();
}
