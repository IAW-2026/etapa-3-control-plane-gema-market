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
import { EnvioActions } from "@/components/panels/envio-actions";
import { DriverBanButton } from "@/components/panels/driver-ban-button";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import { fmtARS, fmtAddress } from "@/lib/ui/format";
import { DEFAULT_PAGE_SIZE } from "@/types/domain";

export const metadata: Metadata = { title: "Envíos" };

type SearchParams = Promise<Record<string, string | undefined>>;

const VIEWS = [
  { value: null, label: "Envíos" },
  { value: "couriers", label: "Couriers" },
];

export default function EnviosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader subtitle="Logística · Shipping" title="Envíos" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<div className="mb-4 h-9" />}>
          <ViewSwitch searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <ViewContent searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function ViewSwitch({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return <FilterPills paramKey="view" active={p.view ?? null} options={VIEWS} />;
}

async function ViewContent({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  return p.view === "couriers" ? (
    <CouriersTable searchParams={searchParams} />
  ) : (
    <EnviosTable searchParams={searchParams} />
  );
}

async function EnviosTable({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(
    cached.envios({ status: p.status, logistics_id: p.logistics_id, page, page_size: pageSize }),
  );

  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState
          title="Shipping App no disponible"
          body={`${res.error}. Los endpoints admin de Shipping los agrega el plan 02.`}
        />
      </Card>
    );
  }

  const { items, total } = res.data;

  return (
    <Card padding={0}>
      <div className="overflow-x-auto hidden lgx:block">
        <table className="w-full border-collapse text-[13px] min-w-[760px]">
          <thead className="bg-cream">
            <tr className="text-left text-ink-3 font-mono text-[11px] uppercase tracking-[0.06em]">
              <th className="py-2.5 px-5">Envío</th>
              <th className="py-2.5 px-3">Destino</th>
              <th className="py-2.5 px-3 w-24 text-right">Precio</th>
              <th className="py-2.5 px-3 w-28">Estado</th>
              <th className="py-2.5 px-5 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr key={e.shipping_id} className="border-b border-line">
                <td className="py-3.5 px-5">
                  <div className="font-mono text-[12px] truncate">{e.tracking_code}</div>
                  <div className="text-[11px] text-ink-3 font-mono">{e.order_id}</div>
                </td>
                <td className="py-3.5 px-3 text-ink-2 truncate">{fmtAddress(e.delivery_address)}</td>
                <td className="py-3.5 px-3 text-right font-semibold tabular-nums">{fmtARS(e.price)}</td>
                <td className="py-3.5 px-3"><Pill tone="neutral" size="sm">{e.status}</Pill></td>
                <td className="py-3.5 px-5"><EnvioActions shippingId={e.shipping_id} status={e.status} /></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12">
                  <EmptyState icon="truck" title="Sin envíos" body="No hay envíos para estos filtros." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lgx:hidden">
        {items.map((e) => (
          <div key={e.shipping_id} className="bg-paper border border-line rounded-2xl p-3">
            <div className="flex justify-between gap-2.5 items-start mb-2">
              <div className="min-w-0">
                <div className="font-mono text-[12px] truncate">{e.tracking_code}</div>
                <div className="text-[11px] text-ink-3 truncate">{fmtAddress(e.delivery_address)}</div>
              </div>
              <Pill tone="neutral" size="sm">{e.status}</Pill>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold tabular-nums">{fmtARS(e.price)}</span>
              <EnvioActions shippingId={e.shipping_id} status={e.status} />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <EmptyState icon="truck" title="Sin envíos" body="No hay envíos para estos filtros." />
        )}
      </div>

      <Pager page={page} pageSize={pageSize} total={total} basePath="/envios" />
    </Card>
  );
}

async function CouriersTable({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(cached.drivers({ page, page_size: pageSize }));

  if (!res.ok) {
    return (
      <>
        <SearchBar initialQuery={p.q ?? ""} placeholder="Buscar courier…" ariaLabel="Buscar courier" />
        <Card padding={0}>
          <ErrorState
            title="Shipping App no disponible"
            body={`${res.error}. El endpoint de drivers lo agrega el plan 02.`}
          />
        </Card>
      </>
    );
  }

  const { items, total } = res.data;

  return (
    <Card padding={0}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px] min-w-[560px]">
          <thead className="bg-cream">
            <tr className="text-left text-ink-3 font-mono text-[11px] uppercase tracking-[0.06em]">
              <th className="py-2.5 px-5">Courier</th>
              <th className="py-2.5 px-3 w-28">Estado</th>
              <th className="py-2.5 px-5 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.user_id} className="border-b border-line">
                <td className="py-3.5 px-5">
                  <div className="font-medium truncate">{d.full_name}</div>
                  <div className="text-[11px] text-ink-3 truncate">{d.email}</div>
                </td>
                <td className="py-3.5 px-3">
                  <Pill tone={d.banned ? "danger" : "success"} size="sm">
                    {d.banned ? "Baneado" : "Activo"}
                  </Pill>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <DriverBanButton userId={d.user_id} name={d.full_name} banned={d.banned} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12">
                  <EmptyState icon="helmet" title="Sin couriers" body="No hay couriers registrados." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={pageSize} total={total} basePath="/envios" />
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
