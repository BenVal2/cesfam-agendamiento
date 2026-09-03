import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CESFAM - Agendamiento de horas",
    template: "%s | CESFAM",
  },
  description:
    "Agenda tu hora médica en línea en tu centro de salud familiar. Médicos generales disponibles de lunes a viernes.",
  keywords: ["CESFAM", "agendamiento", "hora médica", "salud"],
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-screen w-full flex flex-col bg-background text-foreground">
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido
        </a>

        <SessionProvider>
          <Navbar />

          <div className="flex-1 w-full">
            <main
              id="contenido-principal"
              className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              {children}
            </main>
          </div>

          <footer className="w-full border-t border-card-border mt-auto bg-background/50">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-fg-muted w-full">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-gradient-to-br from-primary to-secondary text-white" aria-hidden="true">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </span>
                  <p>CESFAM &mdash; [Dirección del centro de salud], Comuna, Santiago</p>
                </div>
                <p className="sm:text-right shrink-0">
                  Tel: +56 9 0000 0000 &bull;{" "}
                  <a
                    href="mailto:contacto@cesfam.cl"
                    className="text-primary hover:underline"
                  >
                    contacto@cesfam.cl
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
