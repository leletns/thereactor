import { NextResponse } from "next/server";

/** Every /api route in The Reactor answers with this envelope. */
export type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };

export function apiOk<T>(data: T) {
  return NextResponse.json<ApiEnvelope<T>>({ ok: true, data });
}

export function apiFail(error: unknown, status = 500) {
  const message =
    error instanceof Error ? error.message : String(error ?? "Erro desconhecido");
  return NextResponse.json<ApiEnvelope<never>>({ ok: false, error: message }, { status });
}

/** Missing env vars are a configuration problem, not a server fault. */
export function isConfigError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("nao configurado") ||
      error.message.includes("Escrita indisponivel"))
  );
}
