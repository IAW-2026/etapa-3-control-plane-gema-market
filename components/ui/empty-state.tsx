import type { ReactNode } from "react";
import type { IconName } from "@/types/ui";
import { Icon } from "./icon";

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
};

// Estado vacío estándar (reimplementado desde shared/components.jsx). Se usa en
// listados sin resultados.
export function EmptyState({ icon = "box", title, body, action }: EmptyStateProps) {
  return (
    <div className="text-center px-6 py-12 max-w-[360px] mx-auto">
      <div className="w-[72px] h-[72px] rounded-full bg-bone text-olive flex items-center justify-center mx-auto mb-5">
        <Icon name={icon} size={30} />
      </div>
      <h3 className="m-0 mb-2 text-lg font-semibold">{title}</h3>
      {body && <p className="m-0 mb-5 text-sm text-ink-3 leading-[1.5]">{body}</p>}
      {action}
    </div>
  );
}
