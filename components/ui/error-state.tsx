import type { ReactNode } from "react";
import { Icon } from "./icon";

export type ErrorStateProps = {
  title?: string;
  body?: string;
  action?: ReactNode;
};

// Estado de error para paneles cuya app downstream no respondió. Es la cara
// visible de la resiliencia con `allSettled`: si Seller/Buyer/Shipping/Payments
// falla, su panel muestra esto en vez de romper la página entera.
export function ErrorState({
  title = "App no disponible",
  body = "No pudimos contactar a esta app. Reintentá en unos minutos.",
  action,
}: ErrorStateProps) {
  return (
    <div className="text-center px-6 py-12 max-w-[380px] mx-auto">
      <div className="w-[72px] h-[72px] rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-5">
        <Icon name="alert" size={30} />
      </div>
      <h3 className="m-0 mb-2 text-lg font-semibold">{title}</h3>
      <p className="m-0 mb-5 text-sm text-ink-3 leading-[1.5]">{body}</p>
      {action}
    </div>
  );
}
