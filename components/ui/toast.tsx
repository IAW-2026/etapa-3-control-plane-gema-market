"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "success" | "danger" | "default";

type ToastItem = { id: number; msg: string; tone: ToastTone };

type ToastContextValue = {
  push: (msg: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_BG: Record<ToastTone, string> = {
  success: "bg-forest",
  danger: "bg-danger",
  default: "bg-ink",
};

// Provider de toasts (reimplementado desde el useToast de shared/components.jsx).
// Se monta una vez en el layout; cualquier client component lo consume con
// `useToast()`. Auto-descarta a los 3s.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((msg: string, tone: ToastTone = "success") => {
    const id = ++seq.current;
    setToasts((prev) => [...prev, { id, msg, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${TONE_BG[t.tone]} text-paper px-[18px] py-2.5 rounded-full text-[13px] shadow-sh-3 font-medium animate-toast-in`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
