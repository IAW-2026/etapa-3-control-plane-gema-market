import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { SearchBar } from "@/components/shell/search-bar";
import { FilterPills } from "@/components/shell/filter-pills";
import { Card } from "@/components/ui/card";
import { Pager } from "@/components/ui/pager";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PaymentRow } from "@/components/panels/payment-row";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import { DEFAULT_PAGE_SIZE } from "@/types/domain";

export const metadata: Metadata = { title: "Pagos" };

type SearchParams = Promise<Record<string, string | undefined>>;

const STATUS = [
  { value: null, label: "Todos" },
  { value: "approved", label: "Aprobados" },
  { value: "pending", label: "Pendientes" },
  { value: "rejected", label: "Rechazados" },
  { value: "refunded", label: "Reembolsados" },
];

export default function PagosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeader subtitle="Órdenes de pago · Payments" title="Pagos" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<div className="mb-4 h-[46px]" />}>
          <Filters searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ListSkeleton />}>
          <PaymentsList searchParams={searchParams} />
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
        initialQuery={p.seller_id ?? ""}
        paramKey="seller_id"
        placeholder="Filtrar por seller_id…"
        ariaLabel="Filtrar por seller"
      />
      <FilterPills paramKey="status" active={p.status ?? null} options={STATUS} />
    </>
  );
}

async function PaymentsList({ searchParams }: { searchParams: SearchParams }) {
  const p = await searchParams;
  const page = Number.parseInt(p.page ?? "1", 10) || 1;
  const pageSize = Number.parseInt(p.pageSize ?? "", 10) || DEFAULT_PAGE_SIZE;

  const res = await settle(
    cached.ordenesDePago({
      status: p.status,
      buyer_id: p.buyer_id,
      seller_id: p.seller_id,
      date_from: p.date_from,
      date_to: p.date_to,
      page,
      page_size: pageSize,
    }),
  );

  if (!res.ok) {
    return (
      <Card padding={0}>
        <ErrorState title="Payments App no disponible" body={res.error} />
      </Card>
    );
  }

  const { items, total } = res.data;

  return (
    <Card padding={0}>
      {items.length === 0 ? (
        <EmptyState icon="wallet" title="Sin pagos" body="No hay órdenes de pago para estos filtros." />
      ) : (
        <div>
          {items.map((payment) => (
            <PaymentRow key={payment.payment_id} payment={payment} />
          ))}
        </div>
      )}
      <Pager page={page} pageSize={pageSize} total={total} basePath="/pagos" />
    </Card>
  );
}

function ListSkeleton() {
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
