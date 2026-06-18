import "server-only";
import type { AppId } from "@/types/domain";
import { apiKeyHeader } from "./api-key";
import { appConfig } from "./env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly app: AppId,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

export type FetchOptions = {
  init?: RequestInit;
  timeoutMs?: number;
};

// Llama server-side a una app downstream agregando `x-api-key-hash`. El cacheo lo
// gobiernan los wrappers `use cache` de lib/services/cached.ts (Cache Components);
// acá no se fija `cache`. Aborta a los 10s y lanza ApiError tipado (con status y
// app) ante timeout o respuesta no-2xx.
export async function fetchJson<T>(
  app: AppId,
  path: string,
  { init = {}, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchOptions = {},
): Promise<T> {
  const { baseUrl, apiKey } = appConfig(app);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Con Cache Components, el fetch es dinámico por defecto (no se cachea) salvo
    // que ocurra dentro de un scope `use cache`. Por eso NO forzamos `no-store`:
    // las lecturas se cachean vía los wrappers de lib/services/cached.ts y las
    // mutaciones (PATCH/POST) nunca se cachean por ser non-GET.
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...apiKeyHeader(apiKey),
        ...init.headers,
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new ApiError(
        `${app} respondió ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
        res.status,
        app,
      );
    }

    // 204 No Content: no hay body que parsear.
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(`${app} no respondió a tiempo (timeout)`, 504, app);
    }
    throw new ApiError(
      err instanceof Error ? err.message : `Error contactando a ${app}`,
      0,
      app,
    );
  } finally {
    clearTimeout(timer);
  }
}

export type Settled<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Envuelve una promesa para que un fallo no propague: devuelve {ok,data} o
// {ok,error}. Pensado para combinar varias fuentes con Promise.all sin que una
// caída tumbe al resto (patrón allSettled del plan).
export async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, data: await promise };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
