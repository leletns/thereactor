import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Stands in for the editorial serif in the reference: warm, clinical, trustworthy.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
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
    <html lang="pt-BR" className={`${poppins.variable} ${fraunces.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
