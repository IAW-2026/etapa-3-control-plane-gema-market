import type { Metadata } from "next";
import { Icon } from "@/components/ui/icon";
import { SignOutButton } from "@/components/shell/sign-out-button";

export const metadata: Metadata = { title: "Sin acceso" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-danger/10 text-danger flex items-center justify-center mb-5">
        <Icon name="lock" size={30} />
      </div>
      <h1 className="m-0 mb-2 text-xl font-semibold tracking-[-0.02em]">
        No tenés acceso
      </h1>
      <p className="m-0 mb-6 text-sm text-ink-3 max-w-[360px] leading-[1.5]">
        Esta consola es solo para operadores con rol <b>superadmin</b>. Si creés
        que es un error, contactá al equipo de plataforma.
      </p>
      <SignOutButton variant="sidebar" />
    </div>
  );
}
