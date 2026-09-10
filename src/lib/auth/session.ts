/**
 * Sessao da equipe — cookie assinado, sem banco.
 *
 * O Reactor tem uma senha unica de equipe (REACTOR_ACCESS_PASSWORD). Quem
 * acerta a senha recebe um cookie assinado com HMAC-SHA256; o middleware so
 * confere a assinatura, entao nao ha estado de sessao para guardar nem
 * consulta a fazer a cada request.
 *
 * Usa Web Crypto (crypto.subtle) e nao node:crypto porque o middleware do Next
 * roda no runtime Edge, onde os modulos do Node nao existem.
 */

export const SESSION_COOKIE = "reactor_session";

/** Quanto tempo a sessao dura. Uma jornada longa cabe sem novo login. */
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

function readSecret(): string | null {
  const password = process.env.REACTOR_ACCESS_PASSWORD;
  if (!password) return null;
  // A chave de assinatura deriva da senha: trocar a senha invalida de imediato
  // todos os cookies ja emitidos, que e o comportamento esperado de quem troca
  // a senha justamente por suspeitar de vazamento.
  return `reactor:${password}`;
}

/** Sem senha configurada o portao nao existe — o app ficaria aberto. */
export function isAuthConfigured(): boolean {
  return readSecret() !== null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

/** Comparacao de tempo constante: sair cedo vazaria o prefixo correto. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Confere a senha digitada contra a configurada, sem vazar timing. */
export async function verifyPassword(attempt: string): Promise<boolean> {
  const password = process.env.REACTOR_ACCESS_PASSWORD;
  if (!password) return false;
  // Compara hashes, nao os textos: assim o tempo nao depende do tamanho.
  const [a, b] = await Promise.all([
    sign(attempt, "compare"),
    sign(password, "compare"),
  ]);
  return safeEqual(a, b);
}

/** Emite o valor do cookie: "<expira em ms>.<assinatura>". */
export async function createSessionToken(): Promise<string | null> {
  const secret = readSecret();
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await sign(payload, secret)}`;
}

/** Valida assinatura e prazo. Qualquer duvida responde false. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  const secret = readSecret();
  if (!secret || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return safeEqual(signature, await sign(payload, secret));
}
