import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Reactor — L.H.E.X Systems",
  description:
    "Plataforma soberana de orquestração inteligente. Substitua financeiro, vendas, marketing e operações com agentes autônomos.",
  keywords: ["IA", "agentes", "empresas", "automação", "lhex systems", "reactor"],
  openGraph: {
    title: "The Reactor — L.H.E.X Systems",
    description: "O sistema operacional de IA para empresas do futuro.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="bg-[#FAFAFA] text-[#111827] antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
