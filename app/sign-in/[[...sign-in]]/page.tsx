import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { BRAND } from "@/lib/ui/branding";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4 py-10">
      <div className="flex items-center gap-2.5 mb-6">
        <Image
          src="/logo.png"
          alt={`${BRAND.platform} logo`}
          width={36}
          height={36}
          className="w-9 h-9 rounded-[10px]"
          priority
        />
        <div>
          <div className="text-base font-semibold tracking-[-0.01em]">
            {BRAND.platform}
          </div>
          <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-ink-3">
            {BRAND.app}
          </div>
        </div>
      </div>
      <Suspense fallback={<Skeleton rounded="r3" className="w-full max-w-[400px] h-[420px]" />}>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-[400px]",
              card: "bg-paper border border-line shadow-sh-2 rounded-r3",
            },
          }}
        />
      </Suspense>
    </div>
  );
}
