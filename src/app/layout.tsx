import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Stands in for Ppmori: the same geometric proportions across the thin
// display weight (200) and the functional UI weights (500/600).
const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Reactor — Sistema da Clínica",
  description:
    "Comercial, financeiro, agenda e IA em um só lugar. Espelho do Kommo em tempo real com relatórios automáticos.",
  keywords: ["clínica", "CRM", "Kommo", "pipeline", "financeiro", "IA", "reactor"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
