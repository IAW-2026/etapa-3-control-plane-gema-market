import "server-only";
import { createClerkClient } from "@clerk/backend";

// Cliente de Clerk Backend API. El ban global usa CLERK_SECRET_KEY (la misma
// instancia de Clerk que comparten las 4 apps), por lo que banear acá deja al
// usuario fuera en todas.
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function banUserGlobal(clerkUserId: string): Promise<void> {
  await clerk.users.banUser(clerkUserId);
}

export async function unbanUserGlobal(clerkUserId: string): Promise<void> {
  await clerk.users.unbanUser(clerkUserId);
}

export type ClerkUserLite = {
  id: string;
  email: string;
  full_name: string;
  role: string | null;
  banned: boolean;
};

export type ClerkUserPage = {
  items: ClerkUserLite[];
  total: number;
};

// Lista global de usuarios de Clerk (fuente primaria de /usuarios). Soporta
// búsqueda (`query` matchea email/nombre) y paginación por offset.
export async function listClerkUsers(params: {
  query?: string;
  limit: number;
  offset: number;
}): Promise<ClerkUserPage> {
  const { data, totalCount } = await clerk.users.getUserList({
    query: params.query || undefined,
    limit: params.limit,
    offset: params.offset,
    orderBy: "-created_at",
  });

  const items: ClerkUserLite[] = data.map((u) => {
    const email =
      u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
        ?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      "—";
    const role =
      (u.publicMetadata as { role?: string } | null)?.role ?? null;
    return {
      id: u.id,
      email,
      full_name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      role,
      banned: u.banned,
    };
  });

  return { items, total: totalCount };
}
