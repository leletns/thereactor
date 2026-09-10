import { apiFail, apiOk } from "@/lib/api";
import { evolutionClient } from "@/lib/fusion/evolution";
import { evolutionConfigured, instanceName } from "@/lib/fusion/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Estado da conexao com o WhatsApp.
 *
 * Devolve so o necessario para a tela decidir o que mostrar. Nada de chave da
 * Evolution, URL do servidor ou payload cru: o que sai daqui vai para o
 * navegador.
 */
export async function GET() {
  try {
    if (!evolutionConfigured()) {
      return apiOk({
        configured: false,
        status: "unconfigured" as const,
        instance: instanceName(),
        number: null,
      });
    }

    const state = await evolutionClient.getStatus(instanceName());
    return apiOk({
      configured: true,
      status: state.status ?? "close",
      instance: instanceName(),
      number: state.number ?? null,
    });
  } catch (error) {
    // Instancia que ainda nao existe faz a Evolution responder 404. Isso nao e
    // falha: e o estado normal de quem nunca conectou.
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404")) {
      return apiOk({
        configured: true,
        status: "close" as const,
        instance: instanceName(),
        number: null,
      });
    }
    return apiFail(error, 502);
  }
}
