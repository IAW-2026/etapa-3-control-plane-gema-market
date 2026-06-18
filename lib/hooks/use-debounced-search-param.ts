"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const DEBOUNCE_MS = 300;

// Sincroniza un campo de búsqueda con el parámetro `key` de la URL.
// Devuelve [value, setValue] — el debounce y el reset al navegar son internos.
export function useDebouncedSearchParam(
  key: string,
  initialValue: string,
): [string, (val: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialValue);
  const [prevInitial, setPrevInitial] = useState(initialValue);

  if (prevInitial !== initialValue) {
    setPrevInitial(initialValue);
    setValue(initialValue);
  }

  useEffect(() => {
    if (value === initialValue) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [value, initialValue, key, pathname, router]);

  return [value, setValue];
}
