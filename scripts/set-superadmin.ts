/**
 * Asigna el rol `superadmin` a un usuario de Clerk por email.
 *
 * Uso:
 *   npx tsx scripts/set-superadmin.ts operador@unihousing.com
 *
 * Lee CLERK_SECRET_KEY de .env.local (o del entorno). Esto cubre el Paso 1
 * (publicMetadata.role). El Paso 2 — exponer el claim en el session token — se
 * hace en el dashboard de Clerk (ver README / docs).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClerkClient } from "@clerk/backend";

// Carga mínima de .env.local sin dependencias extra: solo si la var no está ya
// en el entorno. Soporta comillas y comentarios.
function loadEnvLocal(): void {
  if (process.env.CLERK_SECRET_KEY) return;
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local opcional: si no existe, usamos el entorno tal cual.
  }
}

async function main(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    console.error("Falta el email.\n  npx tsx scripts/set-superadmin.ts <email>");
    process.exit(1);
  }

  loadEnvLocal();
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY no está definida (ni en .env.local ni en el entorno).");
    process.exit(1);
  }

  const clerk = createClerkClient({ secretKey });

  const { data: users } = await clerk.users.getUserList({
    emailAddress: [email],
  });
  const user = users[0];
  if (!user) {
    console.error(`No se encontró ningún usuario con el email ${email}.`);
    process.exit(1);
  }

  await clerk.users.updateUserMetadata(user.id, {
    publicMetadata: { ...user.publicMetadata, role: "superadmin" },
  });

  console.log(`✓ ${email} (${user.id}) ahora tiene publicMetadata.role = "superadmin".`);
  console.log("  Recordá el Paso 2 en el dashboard (Customize session token) y");
  console.log("  cerrar/abrir sesión para refrescar el token.");
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
