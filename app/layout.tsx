import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Remote Job Academy | Aplica",
  description: "Compártenos tu información para referirte a los mejores trabajos remotos",
  openGraph: {
    title: "Remote Job Academy | Aplica",
    description: "Compártenos tu información para referirte a los mejores trabajos remotos",
    images: ["/nd-logo.png"],
    siteName: "Remote Job Academy",
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
