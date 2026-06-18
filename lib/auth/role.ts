import "server-only";
import { auth } from "@clerk/nextjs/server";

export const SUPERADMIN_ROLE = "superadmin";

type RoleClaims = {
  metadata?: { role?: string };
  publicMetadata?: { role?: string };
};

export function isSuperadmin(claims: unknown): boolean {
  const c = claims as RoleClaims | null | undefined;
  const role = c?.metadata?.role ?? c?.publicMetadata?.role;
  return role === SUPERADMIN_ROLE;
}

// Defensa en profundidad: el middleware ya bloquea el acceso a la UI, pero cada
// Server Action revalida el rol antes de mutar. Lanza si no es superadmin.
export async function requireSuperadmin(): Promise<void> {
  const { userId, sessionClaims } = await auth();
  if (!userId || !isSuperadmin(sessionClaims)) {
    throw new Error("No autorizado: se requiere rol superadmin.");
  }
}
