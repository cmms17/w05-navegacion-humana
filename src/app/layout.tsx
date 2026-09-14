import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navegación humana — Detección a tratamiento",
  description:
    "Ningún tamizaje se queda solo con un número: un navegador de salud humano revisa cada caso de riesgo antes de que llegue al paciente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm text-center py-2 px-4">
          Datos de demostración — paciente, cifras y navegador son simulados.
          Ninguna persona real está identificada aquí.
        </div>
        {children}
      </body>
    </html>
  );
}
