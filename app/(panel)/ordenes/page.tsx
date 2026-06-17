import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { SearchBar } from "@/components/shell/search-bar";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Icon } from "@/components/ui/icon";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import { fmtARS, fmtDate } from "@/lib/ui/format";
import { DEFAULT_PAGE_SIZE } from "@/types/domain";

export const metadata: Metadata = { title: "Órdenes" };

type SearchParams = Promise<Record<string, string | undefined>>;

export default function OrdenesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader subtitle="Correlación · Buyer" title="Órdenes" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<div className="mb-4 h-[46px]" />}>
          <Filters searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <OrdersTable searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Filters({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return (
    <SearchBar
      initialQuery={p.buyer_id ?? ""}
      paramKey="buyer_id"
      placeholder="Filtrar por buyer_id…"
      ariaLabel="Filtrar por comprador"
    />
  );
}

async function OrdersTable({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(
    cached.ordenes({
      buyer_id: p.buyer_id,
      seller_id: p.seller_id,
      status: p.status,
      page,
      page_size: pageSize,
    }),
  );

  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState
          title="Buyer App no disponible"
          body={`${res.error}. El admin de Buyer aún valida JWT en vez de API-key (ver plan 03).`}
        />
      </Card>
    );
  }

  const { items, total } = res.data;

  return (
    <Card padding={0}>
      <div className="overflow-x-auto hidden lgx:block">
        <table className="w-full border-collapse text-[13px] min-w-[680px]">
          <thead className="bg-cream">
            <tr className="text-left text-ink-3 font-mono text-[11px] uppercase tracking-[0.06em]">
              <th className="py-2.5 px-5">Orden</th>
              <th className="py-2.5 px-3">Comprador</th>
              <th className="py-2.5 px-3 w-28 text-right">Total</th>
              <th className="py-2.5 px-3 w-32">Estado</th>
              <th className="py-2.5 px-5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.order_id} className="border-b border-line hover:bg-cream transition-colors">
                <td className="py-3.5 px-5">
                  <Link href={`/ordenes/${o.order_id}`} className="font-mono text-[12px] text-cocoa hover:underline">
                    {o.order_id}
                  </Link>
                  <div className="text-[11px] text-ink-3">{fmtDate(o.created_at)}</div>
                </td>
                <td className="py-3.5 px-3 font-mono text-[12px] text-ink-2 truncate">{o.buyer_id}</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums">{fmtARS(o.total_amount)}</td>
                <td className="py-3.5 px-3"><Pill tone="neutral" size="sm">{o.status}</Pill></td>
                <td className="py-3.5 px-5">
                  <Link href={`/ordenes/${o.order_id}`} aria-label="Ver detalle" className="text-ink-3 hover:text-ink">
                    <Icon name="chevronRight" size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12">
                  <EmptyState icon="cart" title="Sin órdenes" body="No hay órdenes para estos filtros." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lgx:hidden">
        {items.map((o) => (
          <Link
            key={o.order_id}
            href={`/ordenes/${o.order_id}`}
            className="block bg-paper border border-line rounded-2xl p-3"
          >
            <div className="flex justify-between gap-2.5 items-start mb-2">
              <div className="min-w-0">
                <div className="font-mono text-[12px] text-cocoa truncate">{o.order_id}</div>
                <div className="text-[11px] text-ink-3">{fmtDate(o.created_at)}</div>
              </div>
              <Pill tone="neutral" size="sm">{o.status}</Pill>
            </div>
            <div className="text-sm font-bold tabular-nums">{fmtARS(o.total_amount)}</div>
          </Link>
        ))}
        {items.length === 0 && (
          <EmptyState icon="cart" title="Sin órdenes" body="No hay órdenes para estos filtros." />
        )}
      </div>

      <Pager page={page} pageSize={pageSize} total={total} basePath="/ordenes" />
    </Card>
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
