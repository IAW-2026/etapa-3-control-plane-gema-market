import "server-only";
import { z } from "zod";
import type { AppId } from "@/types/domain";

// Config de integración con las 4 apps. NO se valida al importar (un Vercel sin
// las keys de una app no debe tumbar el Control Plane entero): cada panel pide
// su config con `appConfig(app)` y, si falta, se lanza un error tipado que
// `settle()` convierte en "App no disponible".
//
// Las keys de Clerk (CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) las
// lee el SDK directamente; no se declaran acá.
const ENV_SCHEMA = z.object({
  SELLER_API_URL: z.string().url().optional(),
  BUYER_API_URL: z.string().url().optional(),
  SHIPPING_API_URL: z.string().url().optional(),
  PAYMENTS_API_URL: z.string().url().optional(),
  INTERNAL_API_KEY: z.string().min(1).optional(),
  SELLER_INTERNAL_API_KEY: z.string().min(1).optional(),
});

const parsed = ENV_SCHEMA.parse({
  SELLER_API_URL: process.env.SELLER_API_URL,
  BUYER_API_URL: process.env.BUYER_API_URL,
  SHIPPING_API_URL: process.env.SHIPPING_API_URL,
  PAYMENTS_API_URL: process.env.PAYMENTS_API_URL,
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  SELLER_INTERNAL_API_KEY: process.env.SELLER_INTERNAL_API_KEY,
});

export class AppNotConfiguredError extends Error {
  constructor(app: AppId) {
    super(`La app "${app}" no está configurada (falta URL o API key).`);
    this.name = "AppNotConfiguredError";
  }
}

export type AppConfig = { baseUrl: string; apiKey: string };

// Devuelve {baseUrl, apiKey} para una app. Seller usa SELLER_INTERNAL_API_KEY;
// Buyer/Shipping/Payments comparten INTERNAL_API_KEY (ver plan, nota de keys).
export function appConfig(app: AppId): AppConfig {
  const map: Record<AppId, { url?: string; key?: string }> = {
    seller: { url: parsed.SELLER_API_URL, key: parsed.SELLER_INTERNAL_API_KEY },
    buyer: { url: parsed.BUYER_API_URL, key: parsed.INTERNAL_API_KEY },
    shipping: { url: parsed.SHIPPING_API_URL, key: parsed.INTERNAL_API_KEY },
    payments: { url: parsed.PAYMENTS_API_URL, key: parsed.INTERNAL_API_KEY },
  };
  const { url, key } = map[app];
  if (!url || !key) throw new AppNotConfiguredError(app);
  return { baseUrl: url.replace(/\/$/, ""), apiKey: key };
}
