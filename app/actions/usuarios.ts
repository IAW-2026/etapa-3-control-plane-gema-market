"use server";

import { updateTag } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/role";
import { banUserGlobal, unbanUserGlobal } from "@/lib/clerk";
import { patchSeller } from "@/lib/services/seller";
import { patchDriver } from "@/lib/services/shipping";
import { TAGS } from "@/lib/cache";

// Activar/desactivar GLOBAL vía Clerk (afecta a todas las apps).
export async function setUserBannedAction(
  clerkUserId: string,
  banned: boolean,
): Promise<void> {
  await requireSuperadmin();
  if (banned) await banUserGlobal(clerkUserId);
  else await unbanUserGlobal(clerkUserId);
  updateTag(TAGS.usersConsolidated);
}

// Suspender/activar VENDEDOR (Seller App).
export async function setSellerSuspendedAction(
  sellerId: string,
  suspended: boolean,
): Promise<void> {
  await requireSuperadmin();
  await patchSeller(sellerId, { suspended });
  updateTag(TAGS.sellerSellers);
  updateTag(TAGS.sellerStats);
  updateTag(TAGS.usersConsolidated);
}

// Banear/desbanear COURIER (Shipping App).
export async function setDriverBannedAction(
  userId: string,
  banned: boolean,
): Promise<void> {
  await requireSuperadmin();
  await patchDriver(userId, { banned });
  updateTag(TAGS.shippingDrivers);
  updateTag(TAGS.usersConsolidated);
}
