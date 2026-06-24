"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ErrorState
        title="Algo salió mal"
        body="Ocurrió un error al cargar esta sección."
        action={
          <Button variant="primary" icon="refresh" onClick={reset}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
