"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { IconName } from "@/types/ui";
import { Button, type ButtonVariant } from "./button";
import { Icon } from "./icon";

export type ConfirmDialogTone = "danger" | "warn" | "neutral";

const TONE_STYLES: Record<ConfirmDialogTone, { bg: string; text: string; icon: IconName; variant: ButtonVariant }> = {
  danger: { bg: "bg-danger/10", text: "text-danger", icon: "alert", variant: "danger" },
  warn: { bg: "bg-warn/10", text: "text-warn", icon: "alert", variant: "primary" },
  neutral: { bg: "bg-bone", text: "text-ink", icon: "info", variant: "primary" },
};

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  isPending?: boolean;
  confirmIcon?: IconName;
  onConfirm: () => void;
  onClose: () => void;
};

// Diálogo modal accesible basado en el elemento `<dialog>` nativo. Delega
// focus trap, ESC y rol `alertdialog` al navegador. La capa cliente solo
// gestiona apertura/cierre y el cuerpo.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  pendingLabel,
  cancelLabel = "Cancelar",
  tone = "neutral",
  isPending = false,
  confirmIcon,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toneCfg = TONE_STYLES[tone];

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      if (!isPending) onClose();
    };
    dlg.addEventListener("cancel", handleCancel);
    return () => dlg.removeEventListener("cancel", handleCancel);
  }, [isPending, onClose]);

  // Click fuera del contenido (en el backdrop) cierra. El backdrop pertenece
  // al `<dialog>` mismo, por lo que `e.target === e.currentTarget` lo detecta.
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && !isPending) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="confirm-dialog-title"
      className="rounded-r3 p-0 bg-paper border border-line shadow-sh-3 w-[92vw] max-w-md backdrop:bg-ink/40"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full ${toneCfg.bg} ${toneCfg.text} inline-flex items-center justify-center shrink-0`}
            aria-hidden
          >
            <Icon name={toneCfg.icon} size={20} />
          </div>
          <h2
            id="confirm-dialog-title"
            className="m-0 text-[17px] font-semibold leading-snug pt-1.5 flex-1 min-w-0"
          >
            {title}
          </h2>
        </div>
        {description && (
          <div className="text-[14px] leading-relaxed text-ink-2 mb-5 break-words">
            {description}
          </div>
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            full
            className="sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={toneCfg.variant}
            onClick={onConfirm}
            disabled={isPending}
            icon={confirmIcon}
            full
            className="sm:w-auto"
          >
            {isPending && pendingLabel ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
