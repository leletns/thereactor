import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
