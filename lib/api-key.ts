import "server-only";
import { createHash } from "node:crypto";

// Las 4 apps downstream validan `x-api-key-hash: <sha256(key) hex MAYÚSCULAS>`
// (ver lib/api-auth.ts de Seller, hmac.ts de Buyer, etc.). digest('hex')
// devuelve lowercase, por eso el toUpperCase().
export const hashApiKey = (key: string): string =>
  createHash("sha256").update(key).digest("hex").toUpperCase();

export const apiKeyHeader = (key: string): Record<string, string> => ({
  "x-api-key-hash": hashApiKey(key),
});
