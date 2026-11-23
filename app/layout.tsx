import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const description =
  "Proveedores de servicios recomendados y calificados por los vecinos del fraccionamiento.";

// Sin metadataBase a propósito: en Vercel, Next arma las URLs absolutas de las
// imágenes de preview con VERCEL_PROJECT_PRODUCTION_URL (o la URL del preview
// deployment), que es lo que WhatsApp necesita para mostrarlas.
export const metadata: Metadata = {
  title: "Directorio vecinal",
  description,
  openGraph: {
    siteName: "Directorio vecinal",
    locale: "es_MX",
    type: "website",
    title: "Directorio vecinal",
    description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          Hecho por y para los vecinos 🤝
          {" · "}
          <Link href="/privacidad" className="underline hover:text-emerald-600">
            Aviso de privacidad
          </Link>
        </footer>
      </body>
    </html>
  );
}
