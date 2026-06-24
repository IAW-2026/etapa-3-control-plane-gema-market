import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-bone text-olive flex items-center justify-center mb-5">
        <Icon name="search" size={30} />
      </div>
      <h1 className="m-0 mb-2 text-xl font-semibold tracking-[-0.02em]">
        Página no encontrada
      </h1>
      <p className="m-0 mb-6 text-sm text-ink-3 max-w-[340px] leading-[1.5]">
        La ruta que buscás no existe en el Control Plane.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 h-[42px] px-[18px] rounded-full bg-forest text-paper text-sm font-medium"
      >
        <Icon name="arrowLeft" size={18} />
        Volver al overview
      </Link>
    </div>
  );
}
