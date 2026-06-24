"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "./icon";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "@/types/domain";

export type PagerProps = {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
};

// Paginador con tamaño de página configurable. Sincroniza el estado con la URL
// (`?page=&pageSize=`) vía router.replace para que los listados server-side
// re-fetcheen sin perder el resto de filtros.
export function Pager({ page, pageSize, total, basePath }: PagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  useEffect(() => {
    if (!isSizeOpen) return;
    const handler = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setIsSizeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSizeOpen]);

  const navigate = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    if (clamped === page) return;
    navigate({ page: clamped === 1 ? null : String(clamped) });
  };

  const onPageSizeChange = (next: number) => {
    navigate({
      pageSize: next === DEFAULT_PAGE_SIZE ? null : String(next),
      page: null,
    });
    setIsSizeOpen(false);
  };

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-line text-[12.5px] text-ink-3">
      <div className="font-mono">
        {total === 0 ? "Sin resultados" : `${from}–${to} de ${total}`}
      </div>
      <div className="flex items-center gap-2">
        <div ref={sizeRef} className="relative">
          <button
            type="button"
            onClick={() => setIsSizeOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={isSizeOpen}
            aria-label="Resultados por página"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-paper border border-line-2 text-xs font-medium text-ink cursor-pointer hover:border-ink-3 transition-colors"
          >
            <span className="text-[11px] uppercase tracking-[0.06em] font-mono text-ink-3">
              Por página
            </span>
            <span className="tabular-nums">{pageSize}</span>
            <Icon name="chevronDown" size={12} className="text-ink-3" />
          </button>

          {isSizeOpen && (
            <div
              role="listbox"
              className="absolute right-0 bottom-full mb-2 z-50 bg-paper border border-line rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 min-w-[120px]"
            >
              {PAGE_SIZES.map((size) => {
                const isActive = size === pageSize;
                return (
                  <button
                    key={size}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => onPageSizeChange(size)}
                    className={`w-full text-left text-[13px] flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors tabular-nums ${
                      isActive
                        ? "bg-bone text-cocoa font-semibold"
                        : "text-ink hover:bg-cream"
                    }`}
                  >
                    <span className="w-3.5 shrink-0">
                      {isActive && <Icon name="check" size={13} />}
                    </span>
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={prevDisabled}
            aria-label="Página anterior"
            className="w-8 h-8 rounded-full bg-paper border border-line-2 inline-flex items-center justify-center text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="chevronLeft" size={14} />
          </button>
          <span className="px-2 text-ink font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={nextDisabled}
            aria-label="Página siguiente"
            className="w-8 h-8 rounded-full bg-paper border border-line-2 inline-flex items-center justify-center text-ink disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="chevronRight" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
