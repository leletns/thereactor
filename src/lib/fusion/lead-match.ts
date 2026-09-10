/**
 * Casamento de telefone entre WhatsApp e os leads espelhados do Kommo.
 *
 * Os dois lados escrevem o mesmo número de formas diferentes: o Kommo guarda o
 * que o operador digitou ("+55 (21) 99999-0001", "21 9999-0001"), enquanto o
 * Evolution entrega um JID ("5521999990001@s.whatsapp.net"). Pior: o nono
 * dígito dos celulares brasileiros aparece num lado e some no outro conforme a
 * época em que o contato foi cadastrado.
 *
 * Por isso a comparação não é textual. Reduzimos os dois lados a DDD + os oito
 * dígitos finais — a parte que o nono dígito não altera — e comparamos isso.
 */

/** Chave de comparação: DDD (2 dígitos) + os 8 dígitos finais do número. */
export function phoneKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // Tira o código do país quando ele claramente sobra (55 + DDD + número).
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);

  // Sem DDD não dá para desambiguar: números iguais em cidades diferentes
  // colidiriam. Preferimos não casar a casar errado.
  if (digits.length < 10) return null;

  const ddd = digits.slice(0, 2);
  const core = digits.slice(-8);
  return `${ddd}${core}`;
}

/** Extrai o número de um JID do WhatsApp ("5521999990001@s.whatsapp.net"). */
export function phoneFromJid(jid: string | null | undefined): string | null {
  if (!jid) return null;
  const [number] = jid.split("@");
  return number || null;
}

export interface MatchableLead {
  id: string;
  phone: string | null;
  kommo_lead_id?: number | null;
}

/**
 * Encontra o lead dono de um número. Recebe a lista de candidatos já lida do
 * banco em vez de consultar por conta própria, para que quem chama controle o
 * custo da leitura e a função continue testável sem banco.
 */
export function matchLeadByPhone<T extends MatchableLead>(
  leads: T[],
  phone: string | null | undefined
): T | null {
  const target = phoneKey(phone);
  if (!target) return null;
  return leads.find((lead) => phoneKey(lead.phone) === target) ?? null;
}
