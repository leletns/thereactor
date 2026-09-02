"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Clock, Send, Smile } from "lucide-react";
import type { ReactorLeadMessage, ReactorQuickReply } from "@/lib/fusion/supabase";
import { useApi } from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  leadId: string;
  leadName: string;
  kommoLeadId?: number | null;
  className?: string;
}

function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (isSameDay(date, today)) return "Hoje";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

/** Agrupa mensagens por dia, como qualquer app de WhatsApp faz. */
function groupByDay(messages: ReactorLeadMessage[]) {
  const groups: { label: string; items: ReactorLeadMessage[] }[] = [];
  for (const msg of messages) {
    const label = dayLabel(msg.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(msg);
    else groups.push({ label, items: [msg] });
  }
  return groups;
}

function StatusTick({ status }: { status: ReactorLeadMessage["status"] }) {
  if (status === "pending") return <Clock className="h-3 w-3" style={{ color: "#5e5e5e" }} />;
  if (status === "failed") return <span className="text-[10px]" style={{ color: "#b3324a" }}>falhou</span>;
  if (status === "read") return <CheckCheck className="h-3.5 w-3.5" style={{ color: "#53bdeb" }} />;
  if (status === "delivered") return <CheckCheck className="h-3.5 w-3.5" style={{ color: "#5e5e5e" }} />;
  return <Check className="h-3.5 w-3.5" style={{ color: "#5e5e5e" }} />;
}

/**
 * Painel de conversa com visual WhatsApp de verdade (tokens da própria
 * whatsapp.com: bolha recebida branca, enviada #d9fdd3, cantos 8px, sem
 * sombra — profundidade só por contraste de superfície). Escopado a esta
 * tela via .wa-scope, sem tocar no design near-monochrome do resto do app.
 */
export function ChatPanel({ leadId, leadName, kommoLeadId, className }: ChatPanelProps) {
  const { data, loading, reload } = useApi<{
    messages: ReactorLeadMessage[];
    kommoChatReady: boolean;
  }>(`/api/messages?leadId=${leadId}`);
  const quickReplies = useApi<{ quickReplies: ReactorQuickReply[] }>("/api/quick-replies");

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];
  const groups = groupByDay(messages);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, text, kommoLeadId }),
      });
      reload();
    } finally {
      setSending(false);
    }
  }, [draft, sending, leadId, kommoLeadId, reload]);

  return (
    <div
      className={cn("wa-scope flex flex-col overflow-hidden rounded-2xl", className)}
      style={{ background: "#fcf5eb", border: "1px solid #f0f4f9" }}
    >
      {/* Thread */}
      <div ref={listRef} className="rx-scroll flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {loading && (
          <p className="text-center text-[11px]" style={{ color: "#5e5e5e" }}>
            Carregando conversa...
          </p>
        )}

        {!loading && messages.length === 0 && (
          <div
            className="mx-auto max-w-[240px] rounded-2xl px-4 py-3 text-center text-[11px] leading-relaxed"
            style={{ background: "#ffffff", color: "#5e5e5e" }}
          >
            Nenhuma mensagem ainda com {leadName}. Envie a primeira mensagem ou use um atalho
            abaixo.
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="sticky top-0 z-10 flex justify-center py-1">
              <span
                className="rounded-pill px-3 py-1 text-[10px] font-medium"
                style={{ background: "#f0f4f9", color: "#5e5e5e" }}
              >
                {group.label}
              </span>
            </div>
            {group.items.map((msg) => {
              const isOut = msg.direction === "out";
              return (
                <div key={msg.id} className={cn("flex", isOut ? "justify-end" : "justify-start")}>
                  <div
                    className="max-w-[78%] px-3 py-2"
                    style={{
                      background: isOut ? "#d9fdd3" : "#ffffff",
                      color: "#1c1e21",
                      borderRadius: 8,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <div
                      className="mt-1 flex items-center justify-end gap-1 text-[10px]"
                      style={{ color: "#5e5e5e" }}
                    >
                      {msg.author_name && !isOut && (
                        <span className="mr-auto font-medium" style={{ color: "#0373e9" }}>
                          {msg.author_name}
                        </span>
                      )}
                      <span>{messageTime(msg.created_at)}</span>
                      {isOut && <StatusTick status={msg.status} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Aviso de canal, honesto sobre o que é real */}
      {data && !data.kommoChatReady && (
        <p
          className="px-3 py-1.5 text-center text-[10px] leading-relaxed"
          style={{ background: "#f0f4f9", color: "#5e5e5e" }}
        >
          Registrado no Reactor — canal de envio real (WhatsApp via Kommo) ainda não conectado.
        </p>
      )}

      {/* Atalhos */}
      {showShortcuts && (
        <div
          className="flex flex-wrap gap-1.5 px-3 py-2"
          style={{ background: "#f0f4f9", borderTop: "1px solid #f0f4f9" }}
        >
          {(quickReplies.data?.quickReplies ?? []).map((qr) => (
            <button
              key={qr.id}
              onClick={() => {
                setDraft(qr.body);
                setShowShortcuts(false);
              }}
              className="rounded-pill px-3 py-1.5 text-left text-[11px] font-medium transition-colors"
              style={{ background: "#ffffff", color: "#1c1e21" }}
              title={qr.body}
            >
              {qr.title}
            </button>
          ))}
          {quickReplies.data?.quickReplies?.length === 0 && (
            <p className="text-[11px]" style={{ color: "#5e5e5e" }}>
              Nenhum atalho cadastrado ainda.
            </p>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-center gap-2 px-3 py-3" style={{ background: "#ffffff" }}>
        <button
          onClick={() => setShowShortcuts((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill transition-colors"
          style={{ background: showShortcuts ? "#d9fdd3" : "#f0f4f9", color: "#1c1e21" }}
          title="Atalhos de resposta"
        >
          <Smile className="h-4 w-4" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Digite uma mensagem"
          className="h-9 flex-1 rounded-pill px-4 text-[13px] outline-none"
          style={{ background: "#f0f4f9", color: "#1c1e21" }}
        />
        <button
          onClick={send}
          disabled={!draft.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill transition-opacity disabled:opacity-40"
          style={{ background: "#25d366", color: "#ffffff" }}
          title="Enviar (Enter)"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
