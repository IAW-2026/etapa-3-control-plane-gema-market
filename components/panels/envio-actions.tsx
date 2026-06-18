"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { patchEnvioAction } from "@/app/actions/envios";

// Acciones sobre un envío: reasignar courier (logistics_id) y cancelar.
export function EnvioActions({
  shippingId,
  status,
}: {
  shippingId: string;
  status: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const cancelFb = useActionFeedback();
  const reassignFb = useActionFeedback();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [logisticsId, setLogisticsId] = useState("");

  const cancel = () =>
    cancelFb.run(
      async () => {
        await patchEnvioAction(shippingId, { status: "cancelled" });
        router.refresh();
      },
      { onSuccess: () => { setConfirmCancel(false); push("Envío cancelado"); } },
    );

  const reassign = () =>
    reassignFb.run(
      async () => {
        await patchEnvioAction(shippingId, { logistics_id: logisticsId.trim() });
        router.refresh();
      },
      { onSuccess: () => { setReassignOpen(false); setLogisticsId(""); push("Courier reasignado"); } },
    );

  const cancelled = status === "cancelled";

  return (
    <div className="flex gap-2 justify-end">
      <Button size="sm" variant="secondary" icon="refresh" onClick={() => setReassignOpen(true)} disabled={cancelled}>
        <span className="hidden lgx:inline">Reasignar</span>
      </Button>
      <Button size="sm" variant="danger" icon="close" onClick={() => setConfirmCancel(true)} disabled={cancelled}>
        <span className="hidden lgx:inline">Cancelar</span>
      </Button>

      <ConfirmDialog
        open={confirmCancel}
        tone="danger"
        title="Cancelar envío"
        description={
          <>
            ¿Cancelar el envío <strong>{shippingId}</strong>?
            {cancelFb.error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">{cancelFb.error}</div>
            )}
          </>
        }
        confirmLabel="Cancelar envío"
        pendingLabel="Cancelando…"
        confirmIcon="close"
        isPending={cancelFb.isPending}
        onConfirm={cancel}
        onClose={() => setConfirmCancel(false)}
      />

      <ConfirmDialog
        open={reassignOpen}
        tone="neutral"
        title="Reasignar courier"
        description={
          <div>
            <p className="mb-2">Indicá el nuevo <code>logistics_id</code> para el envío {shippingId}.</p>
            <Input
              value={logisticsId}
              onChange={(e) => setLogisticsId(e.target.value)}
              placeholder="logistics_id…"
              aria-label="Nuevo logistics_id"
            />
            {reassignFb.error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">{reassignFb.error}</div>
            )}
          </div>
        }
        confirmLabel="Reasignar"
        pendingLabel="Reasignando…"
        confirmIcon="check"
        isPending={reassignFb.isPending}
        onConfirm={reassign}
        onClose={() => setReassignOpen(false)}
      />
    </div>
  );
}
