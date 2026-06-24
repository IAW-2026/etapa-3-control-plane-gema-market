"use client";

import { Pill } from "@/components/ui/pill";
import { useFilterParams } from "@/lib/hooks/use-filter-params";

export type FilterOption = {
  // Valor que se escribe en la URL. `null` para la opción "todos" (borra el param).
  value: string | null;
  label: string;
};

export type FilterPillsProps = {
  paramKey: string;
  active: string | null;
  options: ReadonlyArray<FilterOption>;
  className?: string;
};

// Toolbar de filtros con pills que mutan un search param de la URL.
export function FilterPills({
  paramKey,
  active,
  options,
  className = "",
}: FilterPillsProps) {
  const pushParams = useFilterParams();
  return (
    <div className={`flex gap-2 mb-4 flex-wrap ${className}`}>
      {options.map((opt) => (
        <Pill
          key={opt.value ?? "__all"}
          size="md"
          active={(opt.value ?? null) === (active ?? null)}
          onClick={() => pushParams({ [paramKey]: opt.value })}
        >
          {opt.label}
        </Pill>
      ))}
    </div>
  );
}
