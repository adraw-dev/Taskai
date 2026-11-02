import type { Metadata, Viewport } from "next";
import { Geist_Mono, Roboto_Flex } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "./globals.css";

const robotoFlex = Roboto_Flex({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskia",
  description: "Gestión de tareas y subtareas con generación de prompts de IA",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taskia",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1425",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${robotoFlex.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
