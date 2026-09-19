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
      <body className="min-h-full flex flex-col bg-neutral-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
