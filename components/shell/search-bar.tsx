"use client";

import { Input } from "@/components/ui/input";
import { useDebouncedSearchParam } from "@/lib/hooks/use-debounced-search-param";

export type SearchBarProps = {
  initialQuery: string;
  placeholder: string;
  ariaLabel: string;
  paramKey?: string;
};

// Búsqueda con debounce que sincroniza un parámetro de la URL (resetea `page`).
export function SearchBar({
  initialQuery,
  placeholder,
  ariaLabel,
  paramKey = "q",
}: SearchBarProps) {
  const [query, setQuery] = useDebouncedSearchParam(paramKey, initialQuery);
  return (
    <div className="mb-4">
      <Input
        icon="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  );
}
