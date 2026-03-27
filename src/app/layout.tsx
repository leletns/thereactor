import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
