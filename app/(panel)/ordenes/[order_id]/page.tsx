import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { CancelOrderButton } from "@/components/panels/cancel-order-button";
import { settle } from "@/lib/http";
import * as cached from "@/lib/services/cached";
import { fmtARS, fmtDate, fmtAddress } from "@/lib/ui/format";

export const metadata: Metadata = { title: "Detalle de orden" };

type Params = Promise<{ order_id: string }>;

// El `params` se consume dentro de cada bloque (que está en Suspense) para no
// volver dinámica la página entera: el header/back-link prerenderizan y los
// bloques correlacionados streamean (PPR).
export default function OrderDetailPage({ params }: { params: Params }) {
  return (
    <>
      <PageHeader subtitle="Orden correlacionada" title="Detalle de orden" />
      <div className="p-4 pb-20 lgx:px-7 lgx:py-6">
        <Link href="/ordenes" className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-4">
          <Icon name="arrowLeft" size={15} /> Volver a órdenes
        </Link>
        <div className="grid gap-3 lgx:grid-cols-3">
          <Suspense fallback={<BlockSkeleton title="Orden" />}>
            <OrderBlock params={params} />
          </Suspense>
          <Suspense fallback={<BlockSkeleton title="Pago" />}>
            <PaymentBlock params={params} />
          </Suspense>
          <Suspense fallback={<BlockSkeleton title="Envío" />}>
            <ShipmentBlock params={params} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

function Block({ title, icon, children }: { title: string; icon: Parameters<typeof Icon>[0]["name"]; children: React.ReactNode }) {
  return (
    <Card padding={0} className="overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line">
        <Icon name={icon} size={17} className="text-olive" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-[12px] text-ink-3 shrink-0">{label}</span>
      <span className={`text-[13px] text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

async function OrderBlock({ params }: { params: Params }) {
  const { order_id } = await params;
  const res = await settle(cached.orden(order_id));
  return (
    <Block title="Orden" icon="cart">
      {res.ok ? (
        <>
          <Row label="Order ID" value={res.data.order_id} mono />
          <Row label="Comprador" value={res.data.buyer_id} mono />
          <Row label="Vendedor" value={res.data.seller_id} mono />
          <Row label="Total" value={fmtARS(res.data.total_amount)} />
          <Row label="Estado" value={res.data.status} />
          <Row label="Fecha" value={fmtDate(res.data.created_at)} />
          <div className="mt-4">
            <CancelOrderButton orderId={order_id} disabled={res.data.status === "cancelled"} />
          </div>
        </>
      ) : (
        <ErrorState title="Orden no disponible" body={`${res.error}. (Endpoint de detalle del plan 03.)`} />
      )}
    </Block>
  );
}

async function PaymentBlock({ params }: { params: Params }) {
  const { order_id } = await params;
  const res = await settle(cached.paymentByOrder(order_id));
  if (!res.ok) {
    return (
      <Block title="Pago" icon="wallet">
        <ErrorState title="Payments no disponible" body={res.error} />
      </Block>
    );
  }
  const payment = res.data;
  return (
    <Block title="Pago" icon="wallet">
      {payment ? (
        <>
          <Row label="Payment ID" value={payment.payment_id} mono />
          <Row label="Estado" value={payment.status} />
          <Row label="Total" value={fmtARS(payment.total_amount)} />
          <Row label="MP" value={payment.mp_payment_id ?? "—"} mono />
          <Row label="Detalle MP" value={payment.mp_status_detail ?? "—"} />
          <Row label="Acreditado" value={fmtDate(payment.paid_at)} />
          <div className="mt-2">
            <Pill tone="sage" size="sm">{payment.orders.length} orden(es) en este pago</Pill>
          </div>
        </>
      ) : (
        <div className="text-[13px] text-ink-3 py-6 text-center">
          No se encontró un pago que incluya esta orden entre los más recientes.
        </div>
      )}
    </Block>
  );
}

async function ShipmentBlock({ params }: { params: Params }) {
  const { order_id } = await params;
  const res = await settle(cached.envioByOrder(order_id));
  return (
    <Block title="Envío" icon="truck">
      {res.ok ? (
        <>
          <Row label="Shipping ID" value={res.data.shipping_id} mono />
          <Row label="Estado" value={res.data.status} />
          <Row label="Tracking" value={res.data.tracking_code} mono />
          <Row label="Origen" value={fmtAddress(res.data.pickup_address)} />
          <Row label="Destino" value={fmtAddress(res.data.delivery_address)} />
          <Row label="Retirado" value={fmtDate(res.data.picked_up_at)} />
          <Row label="Entregado" value={fmtDate(res.data.delivered_at)} />
        </>
      ) : (
        <ErrorState title="Sin envío" body={`${res.error}`} />
      )}
    </Block>
  );
}

function BlockSkeleton({ title }: { title: string }) {
  return (
    <Block title={title} icon="box">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} rounded="full" className="h-4" />
        ))}
      </div>
    </Block>
  );
}
