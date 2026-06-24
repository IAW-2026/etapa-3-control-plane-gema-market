"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export type ActionStatus = "idle" | "pending" | "success" | "error";

export type RunOptions = {
  onSuccess?: () => void;
};

export type UseActionFeedback = {
  status: ActionStatus;
  error: string | null;
  isPending: boolean;
  isSuccess: boolean;
  run: (action: () => Promise<void>, opts?: RunOptions) => void;
};

// Coordina el ciclo idle → pending → success/error con auto-reset.
// Pensado para acciones de servidor que necesitan feedback visual breve.
export function useActionFeedback(successDurationMs = 1400): UseActionFeedback {
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const run = useCallback(
    (action: () => Promise<void>, opts: RunOptions = {}) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setError(null);
      setStatus("pending");
      startTransition(async () => {
        try {
          await action();
          setStatus("success");
          timerRef.current = setTimeout(() => {
            setStatus("idle");
            opts.onSuccess?.();
          }, successDurationMs);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error inesperado");
          setStatus("error");
        }
      });
    },
    [successDurationMs],
  );

  return {
    status,
    error,
    isPending: status === "pending",
    isSuccess: status === "success",
    run,
  };
}
