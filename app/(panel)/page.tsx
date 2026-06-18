import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { AppHealthCard } from "@/components/shell/app-health-card";
import { Skeleton } from "@/components/ui/skeleton";
import { settle } from "@/lib/http";
import { fmtARS } from "@/lib/ui/format";
import * as cached from "@/lib/services/cached";

export const metadata: Metadata = { title: "Overview" };

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-ink-3">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

async function HealthGrid() {
  // Las 4 llamadas en paralelo; un fallo no tumba al resto (allSettled).
  const [s, b, sh, p] = await Promise.all([
    settle(cached.sellerStats()),
    settle(cached.buyerStats()),
    settle(cached.shippingStats()),
    settle(cached.paymentsStats()),
  ]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lgx:grid-cols-2 xl:grid-cols-4">
      <AppHealthCard
        name="Seller"
        icon="box"
        href="/productos"
        ok={s.ok}
        error={s.ok ? undefined : s.error}
      >
        {s.ok && (
          <>
            <Kpi label="Productos activos" value={String(s.data.products_by_status.active)} />
            <Kpi label="Ocultos" value={String(s.data.hidden_products)} />
            <Kpi label="Ventas" value={String(s.data.total_sales)} />
            <Kpi label="Ingresos" value={fmtARS(s.data.total_revenue)} />
          </>
        )}
      </AppHealthCard>

      <AppHealthCard
        name="Buyer"
        icon="cart"
        href="/ordenes"
        ok={b.ok}
        error={b.ok ? undefined : b.error}
      >
        {b.ok && (
          <>
            <Kpi label="Órdenes" value={String(b.data.total_orders)} />
            <Kpi label="Ticket promedio" value={fmtARS(b.data.average_ticket)} />
          </>
        )}
      </AppHealthCard>

      <AppHealthCard
        name="Shipping"
        icon="truck"
        href="/envios"
        ok={sh.ok}
        error={sh.ok ? undefined : sh.error}
      >
        {sh.ok && (
          <>
            <Kpi label="Envíos" value={String(sh.data.total_shipments)} />
            <Kpi label="En tránsito" value={String(sh.data.in_transit)} />
          </>
        )}
      </AppHealthCard>

      <AppHealthCard
        name="Payments"
        icon="wallet"
        href="/pagos"
        ok={p.ok}
        error={p.ok ? undefined : p.error}
      >
        {p.ok && (
          <>
            <Kpi label="Pagos" value={String(p.data.total_payments)} />
            <Kpi label="Aprobación" value={`${Math.round(p.data.approval_rate * 100)}%`} />
            <Kpi label="Volumen" value={fmtARS(p.data.total_volume)} />
          </>
        )}
      </AppHealthCard>
    </div>
  );
}

function HealthGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} rounded="r3" className="h-[260px]" />
      ))}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <>
      <PageHeader subtitle="Superadministración" title="Overview" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Suspense fallback={<HealthGridSkeleton />}>
          <HealthGrid />
        </Suspense>
      </div>
    </>
  );
}
