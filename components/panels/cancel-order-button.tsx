"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { cancelOrdenAction } from "@/app/actions/ordenes";

export function CancelOrderButton({
  orderId,
  disabled,
}: {
  orderId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const { isPending, error, run } = useActionFeedback();

  const cancel = () =>
    run(
      async () => {
        await cancelOrdenAction(orderId);
        router.refresh();
      },
      { onSuccess: () => { setOpen(false); push("Orden cancelada"); } },
    );

  return (
    <>
      <Button variant="danger" icon="close" onClick={() => setOpen(true)} disabled={disabled}>
        Cancelar orden
      </Button>
      <ConfirmDialog
        open={open}
        tone="danger"
        title="Cancelar orden"
        description={
          <>
            ¿Cancelar la orden <strong>{orderId}</strong>? Esta acción la marca como
            cancelada en Buyer.
            {error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">
                {error}
              </div>
            )}
          </>
        }
        confirmLabel="Cancelar orden"
        pendingLabel="Cancelando…"
        confirmIcon="close"
        isPending={isPending}
        onConfirm={cancel}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
