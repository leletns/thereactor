import { apiFail, apiOk } from "@/lib/api";
import { evolutionClient } from "@/lib/fusion/evolution";
import { evolutionConfigured, instanceName } from "@/lib/fusion/whatsapp";

export const dynamic = "force-dynamic";

/**
 * Desvincula o WhatsApp. Usa logout, nao delete: o vinculo cai mas a instancia
 * e o historico da Evolution continuam, entao reconectar e so escanear de novo.
 * E o botao para quando o aparelho e perdido ou a pessoa sai da equipe.
 */
export async function POST() {
  try {
    if (!evolutionConfigured()) {
      return apiFail(new Error("WhatsApp nao configurado."), 503);
    }
    await evolutionClient.logoutInstance(instanceName());
    return apiOk({ disconnected: true });
  } catch (error) {
    return apiFail(error, 502);
  }
}
