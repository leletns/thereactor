"use client";

import React, { useState } from "react";
import { Sparkles, Send, Loader2, Info } from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";

interface AssistPayload {
  findings: string[];
  aiEnabled: boolean;
}

interface Exchange {
  question: string;
  answer: string;
  source: "groq" | "local";
}

const SUGGESTIONS = [
  "O que eu priorizo hoje no comercial?",
  "Quais leads estão travando o funil e por quê?",
  "Como está a saúde financeira da clínica?",
  "Onde estamos perdendo receita na agenda?",
];

export default function CopilotPage() {
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState<Exchange[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const context = useApi<AssistPayload>("/api/ai/assist?days=30");

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setThinking(true);
    setFailure(null);
    setQuestion("");

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, days: 30 }),
      });
      const body = await response.json();
      if (body?.ok) {
        setHistory((prev) => [
          { question: trimmed, answer: body.data.answer, source: body.data.source },
          ...prev,
        ]);
      } else {
        setFailure(body?.error ?? "O copiloto não conseguiu responder.");
      }
    } catch (err) {
      setFailure(err instanceof Error ? err.message : String(err));
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <AppTopbar
        title="Copiloto"
        subtitle="Pergunta em português, resposta baseada nos dados reais do sistema"
      />

      <div className="flex-1 space-y-6 p-9">
        {context.data && !context.data.aiEnabled && (
          <div className="flex items-start gap-2.5 rounded-xl border border-hairline bg-wash/40 px-4 py-3.5 text-[13px] text-ink-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" />
            <span>
              Sem <span className="font-semibold text-ink">GROQ_API_KEY</span> configurada, o
              copiloto responde com a análise determinística dos dados — os números são os mesmos,
              só não há redação por IA.
            </span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ask(question)}
                    placeholder="Pergunte sobre o funil, o financeiro ou a agenda..."
                    className="rx-field h-10 flex-1 px-5 text-[14px]"
                  />
                  <Button onClick={() => ask(question)} disabled={thinking || !question.trim()}>
                    {thinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Perguntar
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => ask(suggestion)}
                      disabled={thinking}
                      className="rounded-pill border border-hairline-strong px-3.5 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:border-violet hover:text-violet disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {failure && <DataError message={failure} />}

            {thinking && (
              <Card>
                <CardContent className="space-y-2 p-5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            )}

            {history.map((exchange, i) => (
              <Card key={i}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-ink-2">{exchange.question}</CardTitle>
                  <Badge variant={exchange.source === "groq" ? "default" : "neutral"}>
                    {exchange.source === "groq" ? "IA" : "análise local"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.6] text-ink-2">
                    {exchange.answer}
                  </p>
                </CardContent>
              </Card>
            ))}

            {history.length === 0 && !thinking && !failure && (
              <Card>
                <CardContent className="px-6 py-12 text-center">
<Sparkles className="mx-auto mb-4 h-6 w-6 text-violet" strokeWidth={1.5} />
                  <p className="text-[19px] font-thin tracking-[-0.02em] text-ink">Pergunte alguma coisa</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
                    O copiloto lê os leads, transações e agendamentos que estão no banco agora. Ele
                    não inventa números — se o dado não existe, ele diz.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Contexto atual</CardTitle>
            </CardHeader>
            <CardContent>
              {context.loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {(context.data?.findings ?? []).map((finding, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-hairline px-3.5 py-3 text-[12px] leading-relaxed text-ink-2"
                    >
                      {finding}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
