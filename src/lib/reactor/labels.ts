/** Human labels for The Reactor's internal funnel enum. */
const STAGE_LABELS: Record<string, string> = {
  prospeccao: "Prospecção",
  qualificacao: "Qualificação",
  proposta: "Proposta",
  fechamento: "Fechamento",
  ganho: "Ganho",
  perdido: "Perdido",
};

/**
 * Mirrored leads already carry the CRM's own stage name; only the internal
 * enum needs prettifying.
 */
export function stageLabel(value: string | null | undefined) {
  if (!value) return "—";
  return STAGE_LABELS[value] ?? value;
}
