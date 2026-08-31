/**
 * Domain context handed to the copilot on every request.
 *
 * This is intentionally a small, editable file rather than a hardcoded prompt:
 * change it to match the clinic's real offering and the AI's answers follow.
 * Override at runtime with REACTOR_CLINIC_CONTEXT if you'd rather keep it in env.
 */
export const DEFAULT_CLINIC_CONTEXT = `
Negocio: clinica de estetica avancada e tratamentos corporais.
Ciclo comercial: lead entra por trafego pago, indicacao ou redes sociais,
passa por qualificacao no WhatsApp, avaliacao presencial e fechamento do plano.
Ticket medio alto, decisao emocional e financeira, objecoes tipicas de preco,
medo do procedimento e "vou pensar".
Regras da equipe comercial:
- Nunca prometer resultado clinico garantido nem dar diagnostico.
- Priorizar leads com avaliacao agendada e leads parados ha mais de 3 dias.
- Follow-up consistente vale mais que desconto: cadencia ate 8 tentativas.
- Sempre registrar a proxima acao concreta com data.
`.trim();

export function clinicContext() {
  return process.env.REACTOR_CLINIC_CONTEXT?.trim() || DEFAULT_CLINIC_CONTEXT;
}
