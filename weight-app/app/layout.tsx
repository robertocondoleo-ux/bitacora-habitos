import type { Metadata, Viewport } from "next";
import { Nunito, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "@/components/RegisterSW";
import { themeInitScript } from "@/lib/theme";

const display = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Bitácora — seguimiento personal",
  description: "Peso, hábitos, pasos y comidas en un solo lugar.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bitácora",
  },
};

export const viewport: Viewport = {
  themeColor: "#141A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${display.variable} ${inter.variable} ${mono.variable} font-body`}
      >
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
