"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import {
  setDriverBannedAction,
  setSellerSuspendedAction,
  setUserBannedAction,
} from "@/app/actions/usuarios";
import type { ConsolidatedUser } from "@/lib/services/users";

// Acciones cross-app sobre un usuario consolidado: activar/desactivar global
// (Clerk), suspender vendedor (Seller) y banear courier (Shipping). Cada acción
// destructiva pide confirmación; reactivar es directo.
export function UserActions({ user }: { user: ConsolidatedUser }) {
  const router = useRouter();
  const { push } = useToast();
  const banFb = useActionFeedback();
  const sellerFb = useActionFeedback();
  const driverFb = useActionFeedback();
  const [confirmBan, setConfirmBan] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmDriverBan, setConfirmDriverBan] = useState(false);

  const toggleBan = () =>
    banFb.run(
      async () => {
        await setUserBannedAction(user.id, !user.banned);
        router.refresh();
      },
      {
        onSuccess: () => {
          setConfirmBan(false);
          push(user.banned ? "Usuario reactivado" : "Usuario desactivado");
        },
      },
    );

  const toggleSeller = () =>
    sellerFb.run(
      async () => {
        if (!user.seller) return;
        await setSellerSuspendedAction(user.seller.seller_id, !user.seller.suspended);
        router.refresh();
      },
      {
        onSuccess: () => {
          setConfirmSuspend(false);
          push(user.seller?.suspended ? "Vendedor reactivado" : "Vendedor suspendido");
        },
      },
    );

  const toggleDriver = () =>
    driverFb.run(
      async () => {
        if (!user.shipping) return;
        await setDriverBannedAction(user.shipping.user_id, !user.shipping.banned);
        router.refresh();
      },
      {
        onSuccess: () => {
          setConfirmDriverBan(false);
          push(user.shipping?.banned ? "Courier desbaneado" : "Courier baneado");
        },
      },
    );

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {/* Global (Clerk) */}
      {user.banned ? (
        <Button variant="success" size="sm" icon="refresh" onClick={toggleBan} disabled={banFb.isPending}>
          {banFb.isPending ? "…" : "Reactivar"}
        </Button>
      ) : (
        <Button variant="danger" size="sm" icon="lock" onClick={() => setConfirmBan(true)}>
          Desactivar
        </Button>
      )}

      {/* Vendedor (Seller) */}
      {user.seller &&
        (user.seller.suspended ? (
          <Button variant="success" size="sm" icon="tag" onClick={toggleSeller} disabled={sellerFb.isPending}>
            {sellerFb.isPending ? "…" : "Reactivar tienda"}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon="tag" onClick={() => setConfirmSuspend(true)}>
            Suspender tienda
          </Button>
        ))}

      {/* Courier (Shipping) */}
      {user.shipping &&
        (user.shipping.banned ? (
          <Button variant="success" size="sm" icon="truck" onClick={toggleDriver} disabled={driverFb.isPending}>
            {driverFb.isPending ? "…" : "Desbanear courier"}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon="truck" onClick={() => setConfirmDriverBan(true)}>
            Banear courier
          </Button>
        ))}

      <ConfirmDialog
        open={confirmBan}
        tone="danger"
        title="Desactivar usuario (global)"
        description={
          <>
            ¿Desactivar a <strong>{user.email}</strong>? Quedará bloqueado en{" "}
            <strong>todas</strong> las apps de UniHousing hasta que lo reactives.
            {banFb.error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">
                {banFb.error}
              </div>
            )}
          </>
        }
        confirmLabel="Desactivar"
        pendingLabel="Desactivando…"
        confirmIcon="lock"
        isPending={banFb.isPending}
        onConfirm={toggleBan}
        onClose={() => setConfirmBan(false)}
      />

      <ConfirmDialog
        open={confirmSuspend}
        tone="danger"
        title="Suspender vendedor"
        description={
          <>
            ¿Suspender la tienda de <strong>{user.email}</strong>? Sus
            publicaciones dejarán de aparecer en el catálogo.
            {sellerFb.error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">
                {sellerFb.error}
              </div>
            )}
          </>
        }
        confirmLabel="Suspender"
        pendingLabel="Suspendiendo…"
        confirmIcon="lock"
        isPending={sellerFb.isPending}
        onConfirm={toggleSeller}
        onClose={() => setConfirmSuspend(false)}
      />

      <ConfirmDialog
        open={confirmDriverBan}
        tone="danger"
        title="Banear courier"
        description={
          <>
            ¿Banear al courier <strong>{user.email}</strong>? No podrá tomar nuevos
            envíos hasta que lo desbanees.
            {driverFb.error && (
              <div className="mt-3 px-3 py-2 rounded-r2 bg-danger/10 text-danger text-[13px]">
                {driverFb.error}
              </div>
            )}
          </>
        }
        confirmLabel="Banear"
        pendingLabel="Baneando…"
        confirmIcon="lock"
        isPending={driverFb.isPending}
        onConfirm={toggleDriver}
        onClose={() => setConfirmDriverBan(false)}
      />
    </div>
  );
}
