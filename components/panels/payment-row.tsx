"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { fmtARS, fmtDate } from "@/lib/ui/format";
import type { OrdenDePago, PaymentStatus } from "@/lib/services/payments";
import type { PillTone } from "@/types/ui";

const STATUS_TONE: Record<PaymentStatus, PillTone> = {
  pending: "warn",
  in_process: "warn",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
  refunded: "sand",
  charged_back: "danger",
  in_mediation: "warn",
};

// Fila de orden de pago con detalle expandible (estados MP + desglose por orden).
// El botón Refund queda deshabilitado: el endpoint está fuera de alcance.
export function PaymentRow({ payment }: { payment: OrdenDePago }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-cream transition-colors cursor-pointer"
      >
        <Icon
          name="chevronRight"
          size={16}
          className={`text-ink-3 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[12px] text-ink-2 truncate">{payment.payment_id}</div>
          <div className="text-[11px] text-ink-3 mt-0.5">{fmtDate(payment.created_at)}</div>
        </div>
        <div className="text-sm font-semibold tabular-nums shrink-0">
          {fmtARS(payment.total_amount)}
        </div>
        <Pill tone={STATUS_TONE[payment.status]} size="sm">
          {payment.status}
        </Pill>
      </button>

      {open && (
        <div className="px-5 pb-4 pt-1 bg-cream/40">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <Field label="Comprador" value={payment.buyer_id} mono />
            <Field label="Pago MP" value={payment.mp_payment_id ?? "—"} mono />
            <Field label="Detalle MP" value={payment.mp_status_detail ?? "—"} />
            <Field label="Acreditado" value={fmtDate(payment.paid_at)} />
          </div>

          <div className="rounded-r2 border border-line bg-paper overflow-hidden">
            <div className="px-3 py-2 text-[10.5px] font-mono uppercase tracking-[0.06em] text-ink-3 bg-cream">
              Órdenes ({payment.orders.length})
            </div>
            <ul className="divide-y divide-line">
              {payment.orders.map((o) => (
                <li key={o.order_id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{o.product_name ?? o.product_id}</div>
                    <div className="text-[11px] text-ink-3 font-mono truncate">{o.order_id}</div>
                  </div>
                  <div className="font-semibold tabular-nums shrink-0">{fmtARS(o.amount)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end mt-3">
            <Button variant="secondary" size="sm" icon="refresh" disabled title="Refund fuera de alcance">
              Refund (no disponible)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-paper border border-line rounded-r2 px-3 py-2">
      <div className="text-[10px] text-ink-3 uppercase tracking-[0.06em]">{label}</div>
      <div className={`text-[13px] truncate ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
