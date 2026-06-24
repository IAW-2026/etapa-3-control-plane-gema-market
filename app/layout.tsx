import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { BRAND } from "@/lib/ui/branding";
import { ToastProvider } from "@/components/ui/toast";
import { inter, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.platform} — ${BRAND.app}`,
    template: `%s · ${BRAND.platform} ${BRAND.app}`,
  },
  description: "Panel de superadministración global de UniHousing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInUrl="/sign-in" signInFallbackRedirectUrl="/">
      <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="font-sans">
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
