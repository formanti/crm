import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crm-newave.vercel.app"),
  title: "Remote Job Academy",
  description: "Compártenos tu información para referirte a los mejores trabajos",
  openGraph: {
    title: "Remote Job Academy",
    description: "Compártenos tu información para referirte a los mejores trabajos",
    siteName: "Remote Job Academy",
    images: [
      {
        url: "/og-preview.png",
        width: 800,
        height: 600,
        alt: "Remote Job Academy Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
