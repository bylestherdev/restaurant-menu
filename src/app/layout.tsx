import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/hooks/usePWA";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Casa del Sabor - Menú Interactivo",
  description: "Descubre nuestra carta digital interactiva. Haz tu pedido desde la mesa de forma fácil y rápida.",
  keywords: ["restaurante", "menú digital", "carta", "pedido online", "comida", "Madrid"],
  authors: [{ name: "La Casa del Sabor" }],
  openGraph: {
    title: "La Casa del Sabor - Menú Interactivo",
    description: "Descubre nuestra carta digital interactiva",
    type: "website",
    locale: "es_ES",
    siteName: "La Casa del Sabor",
  },
};

export const viewport: Viewport = {
  themeColor: "#D4A574",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4A574" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="La Casa del Sabor" />
        <link rel="apple-touch-startup-image" href="/icon-512.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-amber-50">
        <Navbar />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}