"use client";

import { useClerk } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icon";

// Botón de "Cerrar sesión". No usamos `<SignOutButton>` de Clerk porque su
// `React.Children.only()` interno rompe al renderizarse desde un Server
// Component.
type SignOutButtonProps = {
  variant: "sidebar" | "header-icon";
};

export function SignOutButton({ variant }: SignOutButtonProps) {
  const { signOut } = useClerk();
  const onClick = () => signOut({ redirectUrl: "/sign-in" });

  if (variant === "header-icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Cerrar sesión"
        className="w-9 h-9 flex items-center justify-center rounded-[10px] text-ink-3 hover:text-ink cursor-pointer"
      >
        <Icon name="logout" size={20} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 mt-2 px-3 py-2 text-xs text-ink-3 hover:text-ink cursor-pointer"
    >
      <Icon name="logout" size={16} />
      Cerrar sesión
    </button>
  );
}
