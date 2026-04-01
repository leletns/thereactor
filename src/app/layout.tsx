import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  weight: "100 900",
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
    <html lang="pt-BR" className={geist.variable}>
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
