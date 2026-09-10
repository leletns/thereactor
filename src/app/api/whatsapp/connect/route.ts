import { apiFail, apiOk } from "@/lib/api";
import { evolutionClient } from "@/lib/fusion/evolution";
import { evolutionConfigured, instanceName } from "@/lib/fusion/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Gera o QR de pareamento do WhatsApp.
 *
 * Quem escaneia este QR vincula o WhatsApp da clinica ao Reactor — ou seja, o
 * QR e uma credencial, nao uma imagem qualquer. Duas consequencias no codigo:
 *
 * 1. A rota so existe atras do login (o middleware cuida disso). Aberta, ela
 *    deixaria qualquer um na internet parear o proprio celular e passar a
 *    receber e responder como a clinica.
 * 2. A resposta nunca e cacheada nem guardada. O QR vive menos de um minuto no
 *    lado da Evolution, e um QR velho em cache seria so frustracao.
 *
 * A EVOLUTION_API_KEY fica no servidor: o navegador recebe a imagem, nunca a
 * chave nem a URL do servidor da Evolution.
 */
export async function POST() {
  try {
    if (!evolutionConfigured()) {
      return apiFail(
        new Error(
          "WhatsApp indisponivel: defina EVOLUTION_API_URL e EVOLUTION_API_KEY."
        ),
        503
      );
    }

    const name = instanceName();
    const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL;

    // Se a instancia ja existe, /instance/create responde erro — o que importa
    // e existir, entao seguimos para o connect de qualquer forma.
    try {
      await evolutionClient.createInstance(name, webhookUrl);
    } catch {
      // Ja existia. Segue.
    }

    const qr = await evolutionClient.getQRCode(name);

    // A Evolution varia entre `base64` (imagem pronta) e `qrcode`/`code` (o
    // texto do QR). Repassamos os dois e a tela usa o que veio.
    const raw = qr as unknown as Record<string, unknown>;
    const base64 =
      typeof raw.base64 === "string"
        ? raw.base64
        : typeof raw.qrcode === "string" && raw.qrcode.startsWith("data:")
          ? raw.qrcode
          : null;
    const code =
      typeof raw.code === "string"
        ? raw.code
        : typeof raw.qrcode === "string" && !raw.qrcode.startsWith("data:")
          ? raw.qrcode
          : null;

    if (!base64 && !code) {
      // Sem QR e porque ja esta conectado: a Evolution nao emite QR nesse caso.
      return apiOk({ alreadyConnected: true, base64: null, code: null });
    }

    const response = apiOk({ alreadyConnected: false, base64, code });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    return apiFail(error, 502);
  }
}
