import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "CESFAM Cristo Vive — Agendamiento de horas",
    template: "%s | CESFAM Cristo Vive",
  },
  description:
    "Agenda tu hora médica en línea en el CESFAM Cristo Vive, Recoleta. Médicos generales disponibles de lunes a viernes.",
  keywords: ["CESFAM", "agendamiento", "hora médica", "Recoleta", "salud"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido
        </a>

        <SessionProvider>
          <Navbar />

          <div className="flex-1 w-full">
            <main
              id="contenido-principal"
              className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14 flex-1"
            >
              {children}
            </main>
          </div>

          <footer className="border-t border-card-border mt-auto">
            <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-fg-muted">
                <p>CESFAM Cristo Vive — Av. Recoleta 4125, Recoleta</p>
                <p>
                  Tel: +56 2 622 6380 ·{" "}
                  <a
                    href="mailto:cesfam@fundacioncristovive.cl"
                    className="text-primary hover:underline"
                  >
                    cesfam@fundacioncristovive.cl
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
