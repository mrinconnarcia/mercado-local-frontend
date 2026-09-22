import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/lib/auth-context";
import { Navbar } from "@/src/components/navbar";

export const metadata: Metadata = {
  title: "Mercado Local",
  description: "Compra en los negocios de tu barrio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-neutral-50 text-neutral-900">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Saltar al contenido
        </a>
        <AuthProvider>
          <Navbar />
          <main id="contenido" className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
