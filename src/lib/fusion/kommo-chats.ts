/**
 * Kommo Chats API (amojo) — envio de mensagem para uma conversa já existente.
 *
 * Isto é uma API DIFERENTE da CRM API v4 usada em kommo.ts. A CRM API (token
 * em KOMMO_ACCESS_TOKEN) lê e move leads; ela não dá acesso a mensagens de
 * chat. Para ler/enviar mensagens de WhatsApp de verdade dentro de uma
 * conversa do Kommo, é preciso um *canal de chat* registrado — que exige um
 * `scope_id` e um `channel secret` emitidos pelo suporte da Kommo (não é
 * algo que se gera sozinho pelo token de CRM comum). Ver:
 * https://developers.kommo.com/reference/send-import-messages
 * https://developers.kommo.com/reference/chat-history
 *
 * Enquanto essas credenciais não existem (KOMMO_CHAT_SCOPE_ID /
 * KOMMO_CHAT_CHANNEL_SECRET), o Reactor guarda a conversa só localmente em
 * reactor_lead_messages — nada trava, mas o envio não sai de verdade pelo
 * WhatsApp. Assim que as credenciais existirem, basta configurar as duas
 * env vars: o envio passa a acontecer de verdade, sem mudar nenhuma tela.
 */
import crypto from "node:crypto";

export interface KommoChatConfig {
  scopeId: string;
  channelSecret: string;
}

export function readKommoChatConfig(): KommoChatConfig | null {
  const scopeId = process.env.KOMMO_CHAT_SCOPE_ID;
  const channelSecret = process.env.KOMMO_CHAT_CHANNEL_SECRET;
  if (!scopeId || !channelSecret) return null;
  return { scopeId, channelSecret };
}

export function isKommoChatConfigured(): boolean {
  return readKommoChatConfig() !== null;
}

/** Assina a requisição como a Chats API exige: HMAC-SHA1 sobre METHOD\nDate\nContent-Type\nContent-MD5\nPath. */
function signRequest(options: {
  secret: string;
  method: string;
  date: string;
  contentType: string;
  bodyMd5: string;
  path: string;
}) {
  const { secret, method, date, contentType, bodyMd5, path } = options;
  const stringToSign = `${method}\n${date}\n${contentType}\n${bodyMd5}\n${path}`;
  return crypto.createHmac("sha1", secret).update(stringToSign).digest("hex");
}

async function amojoRequest(
  config: KommoChatConfig,
  method: "GET" | "POST",
  path: string,
  body?: unknown
) {
  const contentType = "application/json";
  const bodyText = body ? JSON.stringify(body) : "";
  const bodyMd5 = crypto.createHash("md5").update(bodyText).digest("hex");
  const date = new Date().toUTCString();
  const signature = signRequest({
    secret: config.channelSecret,
    method,
    date,
    contentType,
    bodyMd5,
    path,
  });

  const response = await fetch(`https://amojo.kommo.com${path}`, {
    method,
    headers: {
      Date: date,
      "Content-Type": contentType,
      "Content-MD5": bodyMd5,
      "X-Signature": signature,
    },
    body: bodyText || undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Kommo Chats API (${path}) respondeu ${response.status}: ${await response.text()}`
    );
  }
  return response.status === 204 ? null : response.json();
}

/**
 * Envia uma mensagem de texto para uma conversa já existente.
 * `conversationId` é o id da conversa no Kommo — só existe depois que a
 * conversa chega pelo canal de chat (webhook), não pelo id do lead.
 */
export async function sendKommoChatMessage(options: {
  conversationId: string;
  text: string;
  senderName?: string;
}): Promise<{ ok: true; msgid: string } | { ok: false; error: string }> {
  const config = readKommoChatConfig();
  if (!config) {
    return {
      ok: false,
      error:
        "Canal de chat do Kommo nao configurado (KOMMO_CHAT_SCOPE_ID / KOMMO_CHAT_CHANNEL_SECRET).",
    };
  }

  const msgid = crypto.randomUUID();
  const now = Date.now();

  try {
    await amojoRequest(config, "POST", `/v2/origin/custom/${config.scopeId}`, {
      event_type: "new_message",
      payload: {
        timestamp: Math.floor(now / 1000),
        msec_timestamp: now,
        msgid,
        conversation_id: options.conversationId,
        sender: { id: "reactor", name: options.senderName ?? "Blue Clinica", ref_id: "reactor" },
        message: { type: "text", text: options.text },
        silent: false,
      },
    });
    return { ok: true, msgid };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Histórico de uma conversa — usado só como conferência; a fonte de verdade do Reactor é reactor_lead_messages. */
export async function fetchKommoChatHistory(conversationId: string, limit = 50) {
  const config = readKommoChatConfig();
  if (!config) return null;
  const path = `/v2/origin/custom/${config.scopeId}/chats/${conversationId}/history?limit=${limit}`;
  return amojoRequest(config, "GET", path);
}
