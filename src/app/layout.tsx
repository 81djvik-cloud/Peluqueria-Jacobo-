import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ArribaAlNavegar } from "@/components/ArribaAlNavegar";
import { Cabecera } from "@/components/Cabecera";
import { Pie } from "@/components/Pie";
import { NEGOCIO } from "@/lib/negocio";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${NEGOCIO.nombre} · Reserva tu cita`,
    template: `%s · ${NEGOCIO.nombre}`,
  },
  description: `Peluquería de hombre y niño en Palencia. ${NEGOCIO.lemas.join(". ")}. Reserva tu cita online en menos de un minuto.`,
};

export const viewport: Viewport = {
  themeColor: "#0277c3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <ArribaAlNavegar />
        <Cabecera />
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-6 sm:px-6">
          {children}
        </main>
        <Pie />
      </body>
    </html>
  );
}
