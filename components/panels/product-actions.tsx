"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/lib/hooks/use-action-feedback";
import {
  setProductoHiddenAction,
  setProductoStatusAction,
} from "@/app/actions/productos";

export type ProductActionsProps = {
  productId: string;
  hidden: boolean;
  status: "active" | "paused";
};

// Acciones de moderación de un producto: ocultar/mostrar (reversible, sin
// confirmación) y pausar/activar. Toasts de éxito/error.
export function ProductActions({ productId, hidden, status }: ProductActionsProps) {
  const router = useRouter();
  const { push } = useToast();
  const hideFb = useActionFeedback();
  const statusFb = useActionFeedback();

  const toggleHidden = () =>
    hideFb.run(
      async () => {
        await setProductoHiddenAction(productId, !hidden);
        router.refresh();
      },
      { onSuccess: () => push(hidden ? "Producto visible" : "Producto oculto") },
    );

  const toggleStatus = () => {
    const next = status === "active" ? "paused" : "active";
    statusFb.run(
      async () => {
        await setProductoStatusAction(productId, next);
        router.refresh();
      },
      { onSuccess: () => push(next === "active" ? "Producto activado" : "Producto pausado") },
    );
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant={status === "active" ? "secondary" : "success"}
        size="sm"
        icon={status === "active" ? "clock" : "check"}
        onClick={toggleStatus}
        disabled={statusFb.isPending}
      >
        <span className="hidden lgx:inline">
          {statusFb.isPending ? "…" : status === "active" ? "Pausar" : "Activar"}
        </span>
      </Button>
      <Button
        variant={hidden ? "success" : "secondary"}
        size="sm"
        icon={hidden ? "eye" : "lock"}
        onClick={toggleHidden}
        disabled={hideFb.isPending}
      >
        <span className="hidden lgx:inline">
          {hideFb.isPending ? "…" : hidden ? "Mostrar" : "Ocultar"}
        </span>
      </Button>
    </div>
  );
}
