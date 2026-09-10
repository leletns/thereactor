"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (body?.ok) {
        // replace() para a tela de login nao ficar no historico do navegador.
        router.replace(params.get("next") || "/visao-geral");
        router.refresh();
      } else {
        setError(body?.error ?? "Nao foi possivel entrar.");
      }
    } catch {
      setError("Servidor fora do ar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-[340px] space-y-5">
      <div className="space-y-1.5">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-ink text-[13px] font-semibold text-white">
            R
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink">The Reactor</p>
            <p className="text-2xs text-ink-3">Sistema da clínica</p>
          </div>
        </div>
        <label htmlFor="password" className="rx-eyebrow flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Senha da equipe
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rx-field h-10 w-full px-3.5 text-[13px]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose/20 bg-rose-soft px-3.5 py-2.5 text-xs text-rose">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading || !password} className="w-full">
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-2xs leading-relaxed text-ink-3">
        O acesso é da clínica inteira. Não compartilhe esta senha fora da equipe —
        aqui estão os dados de contato dos pacientes.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
