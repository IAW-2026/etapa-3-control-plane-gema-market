"use server";

import { updateTag } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/role";
import { ApiError } from "@/lib/http";
import {
  createCategoria,
  deleteCategoria,
  patchCategoria,
} from "@/lib/services/seller";
import { TAGS } from "@/lib/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

function invalidate() {
  updateTag(TAGS.sellerCategorias);
  updateTag(TAGS.sellerStats);
}

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 1) return "El nombre no puede estar vacío.";
  if (trimmed.length > 60) return "El nombre es demasiado largo (máx. 60).";
  return null;
}

export async function createCategoriaAction(name: string): Promise<ActionResult> {
  await requireSuperadmin();
  const err = validateName(name);
  if (err) return { ok: false, error: err };
  try {
    await createCategoria(name.trim());
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFor(e) };
  }
}

export async function updateCategoriaAction(
  id: string,
  name: string,
): Promise<ActionResult> {
  await requireSuperadmin();
  const err = validateName(name);
  if (err) return { ok: false, error: err };
  try {
    await patchCategoria(id, name.trim());
    invalidate();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFor(e) };
  }
}

export async function deleteCategoriaAction(id: string): Promise<ActionResult> {
  await requireSuperadmin();
  try {
    await deleteCategoria(id);
    invalidate();
    return { ok: true };
  } catch (e) {
    // 409: categoría con productos asociados.
    if (e instanceof ApiError && e.status === 409) {
      return {
        ok: false,
        error: "No se puede borrar: tiene productos asociados.",
      };
    }
    return { ok: false, error: messageFor(e) };
  }
}

function messageFor(e: unknown): string {
  return e instanceof Error ? e.message : "Error inesperado.";
}
