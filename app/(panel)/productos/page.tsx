import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { SearchBar } from "@/components/shell/search-bar";
import { FilterPills } from "@/components/shell/filter-pills";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ProductActions } from "@/components/panels/product-actions";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import { fmtARS } from "@/lib/ui/format";
import { DEFAULT_PAGE_SIZE } from "@/types/domain";

export const metadata: Metadata = { title: "Productos" };

type SearchParams = Promise<Record<string, string | undefined>>;

const VISIBILITY = [
  { value: null, label: "Todos" },
  { value: "false", label: "Visibles" },
  { value: "true", label: "Ocultos" },
];

const STATUS = [
  { value: null, label: "Cualquier estado" },
  { value: "active", label: "Activos" },
  { value: "paused", label: "Pausados" },
];

export default function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageHeader subtitle="Moderación · Seller" title="Productos" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<div className="mb-4 h-[46px]" />}>
          <Filters searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <ProductsTable searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return (
    <>
      <SearchBar
        initialQuery={p.q ?? ""}
        placeholder="Buscar por producto o tienda…"
        ariaLabel="Buscar productos"
      />
      <FilterPills paramKey="hidden" active={p.hidden ?? null} options={VISIBILITY} />
      <FilterPills paramKey="status" active={p.status ?? null} options={STATUS} />
    </>
  );
}

async function ProductsTable({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(
    cached.productos({
      q: p.q,
      status: p.status,
      hidden: p.hidden,
      category_id: p.category_id,
      seller_id: p.seller_id,
      page,
      page_size: pageSize,
    }),
  );

  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState title="Seller App no disponible" body={res.error} />
      </Card>
    );
  }

  const { items, total } = res.data;

  return (
    <Card padding={0}>
      <div className="overflow-x-auto hidden lgx:block">
        <table className="w-full border-collapse text-[13px] min-w-[720px]">
          <thead className="bg-cream">
            <tr className="text-left text-ink-3 font-mono text-[11px] uppercase tracking-[0.06em]">
              <th className="py-2.5 px-5">Producto</th>
              <th className="py-2.5 px-3">Tienda</th>
              <th className="py-2.5 px-3 w-28 text-right">Precio</th>
              <th className="py-2.5 px-3 w-28">Estado</th>
              <th className="py-2.5 px-5 w-44"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((prod) => (
              <tr key={prod.product_id} className="border-b border-line">
                <td className="py-3.5 px-5">
                  <div className="font-medium truncate">{prod.title}</div>
                  <div className="text-[11px] text-ink-3">{prod.category_name}</div>
                </td>
                <td className="py-3.5 px-3 text-ink-2 truncate">{prod.seller_name}</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums">
                  {fmtARS(prod.price)}
                </td>
                <td className="py-3.5 px-3">
                  <StatusPill hidden={prod.hidden_by_admin} status={prod.status} />
                </td>
                <td className="py-3.5 px-5">
                  <ProductActions
                    productId={prod.product_id}
                    hidden={prod.hidden_by_admin}
                    status={prod.status}
                  />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12">
                  <EmptyState title="Sin productos" body="No hay productos para estos filtros." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lgx:hidden">
        {items.map((prod) => (
          <div key={prod.product_id} className="bg-paper border border-line rounded-2xl p-3">
            <div className="flex justify-between gap-2.5 items-start mb-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{prod.title}</div>
                <div className="text-[11px] text-ink-3 mt-[3px]">{prod.seller_name}</div>
              </div>
              <StatusPill hidden={prod.hidden_by_admin} status={prod.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold tabular-nums">{fmtARS(prod.price)}</div>
              <ProductActions
                productId={prod.product_id}
                hidden={prod.hidden_by_admin}
                status={prod.status}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <EmptyState title="Sin productos" body="No hay productos para estos filtros." />
        )}
      </div>

      <Pager page={page} pageSize={pageSize} total={total} basePath="/productos" />
    </Card>
  );
}

function StatusPill({ hidden, status }: { hidden: boolean; status: "active" | "paused" }) {
  if (hidden) return <Pill tone="danger" size="sm">Oculto</Pill>;
  return (
    <Pill tone={status === "active" ? "success" : "warn"} size="sm">
      {status === "active" ? "Activo" : "Pausado"}
    </Pill>
  );
}

function TableSkeleton() {
  return (
    <Card padding={0}>
      <div className="p-4 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} rounded="r2" className="h-12" />
        ))}
      </div>
    </Card>
  );
}
