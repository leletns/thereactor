import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Reactor — Sua empresa no piloto automático",
  description:
    "Atendimento, relatórios e operação rodando 24 horas sem você. Comece grátis.",
  keywords: ["automação", "gestão empresarial", "reactor", "piloto automático"],
  openGraph: {
    title: "Reactor — Sua empresa no piloto automático",
    description: "Atendimento, relatórios e operação rodando 24h sem você.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
