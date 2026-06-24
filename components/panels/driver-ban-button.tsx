"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import { setDriverBannedAction } from "@/app/actions/usuarios";

export function DriverBanButton({
  userId,
  name,
  banned,
}: {
  userId: string;
  name: string;
  banned: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const { isPending, error, run } = useActionFeedback();

  const toggle = () =>
    run(
      async () => {
        await setDriverBannedAction(userId, !banned);
        router.refresh();
      },
      { onSuccess: () => { setOpen(false); push(banned ? "Courier desbaneado" : "Courier baneado"); } },
    );

  if (banned) {
    return (
      <Button variant="success" size="sm" icon="refresh" onClick={toggle} disabled={isPending}>
        {isPending ? "…" : "Desbanear"}
      </Button>
    );
  }

  return (
    <>
      <Button variant="danger" size="sm" icon="lock" onClick={() => setOpen(true)}>
        Banear
      </Button>
      <ConfirmDialog
        open={open}
        tone="danger"
        title="Banear courier"
        description={
          <>
            ¿Banear a <strong>{name}</strong>? No podrá tomar nuevos envíos.
            {error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">{error}</div>
            )}
          </>
        }
        confirmLabel="Banear"
        pendingLabel="Baneando…"
        confirmIcon="lock"
        isPending={isPending}
        onConfirm={toggle}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
