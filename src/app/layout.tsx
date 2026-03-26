import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Reactor — lhex systems",
  description:
    "Plataforma Soberana de IA Empresarial. Substitua financeiro, SDR, marketing e operações com agentes autônomos inteligentes.",
  keywords: ["IA", "agentes", "empresas", "automação", "lhex systems"],
  openGraph: {
    title: "The Reactor — lhex systems",
    description: "O sistema operacional de IA para empresas do futuro.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} antialiased bg-[#0a0a0f] text-white`}>
        {children}
      </body>
    </html>
  );
}
