"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Smartphone, RefreshCw, LogOut, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus = "open" | "connecting" | "close" | "unconfigured";

interface StatusPayload {
  configured: boolean;
  status: ConnectionStatus;
  instance: string;
  number: string | null;
}

/** O QR da Evolution expira sozinho; renovamos antes disso. */
const QR_REFRESH_MS = 30_000;
/** Enquanto o QR esta na tela, conferimos se o pareamento ja aconteceu. */
const STATUS_POLL_MS = 3_000;

export function WhatsAppConnect() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [qr, setQr] = useState<{ base64: string | null; code: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pairing, setPairing] = useState(false);
  const pairingRef = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/whatsapp/status", { cache: "no-store" });
      const body = await response.json();
      if (body?.ok) {
        setStatus(body.data as StatusPayload);
        // Conectou: o QR na tela virou lixo, e manter um QR valido visivel e
        // justamente o que nao queremos.
        if ((body.data as StatusPayload).status === "open") {
          setQr(null);
          setPairing(false);
          pairingRef.current = false;
        }
        return body.data as StatusPayload;
      }
      setError(body?.error ?? "Falha ao ler o status.");
    } catch {
      setError("Servidor fora do ar.");
    }
    return null;
  }, []);

  const requestQr = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        cache: "no-store",
      });
      const body = await response.json();
      if (!body?.ok) {
        setError(body?.error ?? "Nao foi possivel gerar o QR.");
        return;
      }
      if (body.data.alreadyConnected) {
        await loadStatus();
        return;
      }
      setQr({ base64: body.data.base64, code: body.data.code });
      setPairing(true);
      pairingRef.current = true;
    } catch {
      setError("Servidor fora do ar.");
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      setQr(null);
      setPairing(false);
      pairingRef.current = false;
      await loadStatus();
    } catch {
      setError("Nao foi possivel desconectar.");
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Enquanto o QR esta exposto: renova antes de expirar e para assim que parear.
  useEffect(() => {
    if (!pairing) return;
    const poll = setInterval(loadStatus, STATUS_POLL_MS);
    const refresh = setInterval(() => {
      if (pairingRef.current) requestQr();
    }, QR_REFRESH_MS);
    return () => {
      clearInterval(poll);
      clearInterval(refresh);
    };
  }, [pairing, loadStatus, requestQr]);

  const connected = status?.status === "open";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>WhatsApp</CardTitle>
        {status && (
          <Badge variant={connected ? "success" : "neutral"}>
            {connected ? "Conectado" : status.configured ? "Desconectado" : "Não configurado"}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose/20 bg-rose-soft px-3.5 py-2.5 text-xs text-rose">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {status && !status.configured && (
          <p className="text-xs leading-relaxed text-ink-2">
            Falta configurar{" "}
            <span className="font-semibold text-ink">EVOLUTION_API_URL</span> e{" "}
            <span className="font-semibold text-ink">EVOLUTION_API_KEY</span> para
            conectar um número.
          </p>
        )}

        {connected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-grass/20 bg-grass-soft px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-grass" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-grass">
                  {status?.number ? `Número ${status.number}` : "Número vinculado"}
                </p>
                <p className="text-2xs text-grass/80">
                  As mensagens recebidas entram no pipeline automaticamente.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={disconnect} disabled={loading}>
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Desvincular número
            </Button>
          </div>
        )}

        {status?.configured && !connected && !qr && (
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-ink-2">
              Gere o código e leia com o celular da clínica em{" "}
              <span className="font-medium text-ink">
                WhatsApp → Aparelhos conectados → Conectar aparelho
              </span>
              .
            </p>
            <Button size="sm" onClick={requestQr} disabled={loading}>
              <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
              {loading ? "Gerando..." : "Gerar QR Code"}
            </Button>
          </div>
        )}

        {/*
          A visibilidade do QR deriva do estado da conexao, nao apenas de
          termos limpado `qr` ao detectar o pareamento. Um QR valido exposto
          depois de conectado e uma credencial esquecida na tela: se por
          qualquer corrida o `setQr(null)` nao rodar, `!connected` ainda
          esconde.
        */}
        {qr && !connected && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface p-5">
              {qr.base64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr.base64.startsWith("data:") ? qr.base64 : `data:image/png;base64,${qr.base64}`}
                  alt="QR Code para conectar o WhatsApp"
                  className="h-56 w-56 rounded-lg"
                />
              ) : (
                <p className="break-all rounded-lg bg-sunken p-3 text-2xs text-ink-2">
                  {qr.code}
                </p>
              )}
              <p className="text-center text-2xs leading-relaxed text-ink-3">
                O código se renova sozinho a cada 30 segundos.
                <br />
                Assim que o celular ler, esta tela muda para “Conectado”.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={requestQr} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
                Gerar outro
              </Button>
              <p className="text-2xs text-ink-3">
                Não mostre este código a quem não é da equipe: quem escanear vincula
                o próprio WhatsApp.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
