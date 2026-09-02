/**
 * AmigoClinic adapter — fusion layer para a agenda da clínica.
 *
 * A AmigoClinic (sistema de agenda/prontuário usado pela Clínica Blue)
 * não tem API REST pública documentada — o que ela expõe são feeds
 * iCalendar (.ics) por profissional/recurso, no formato:
 *   https://api.amigoapp.com.br/api/{id1}/{id2}/{id3}/my-calendar.ics
 *
 * Cada feed é uma agenda (médico, procedimento, sala). Buscamos e
 * parseamos com `node-ical` e normalizamos pra um formato único que
 * alimenta reactor_appointments.
 */
import ical, { ParameterValue, VEventStatus } from "node-ical";

export interface AmigoClinicCalendarConfig {
  /** Nome do profissional/recurso como aparece no Reactor (ex: "Dr. Rafael Erthal"). */
  professional: string;
  /** URL do feed .ics fornecido pela AmigoClinic. */
  icsUrl: string;
}

export interface AmigoClinicEvent {
  externalId: string; // UID do VEVENT — estável entre syncs, usado pro upsert
  professional: string;
  patientName: string;
  procedure: string | null;
  scheduledAt: Date;
  endsAt: Date | null;
  status: "agendado" | "confirmado" | "cancelado" | "realizado";
  rawSummary: string;
  rawDescription: string | null;
  location: string | null;
}

/**
 * Calendários configurados. Mantido em código (não env var) porque são
 * IDs de calendário, não segredos — mas dá pra mover pra env/DB depois
 * se a lista crescer ou mudar com frequência.
 */
export const AMIGOCLINIC_CALENDARS: AmigoClinicCalendarConfig[] = [
  { professional: "Dr. Rafael Erthal", icsUrl: "https://api.amigoapp.com.br/api/281474/57191/119754/my-calendar.ics" },
  { professional: "Dra. Lorena", icsUrl: "https://api.amigoapp.com.br/api/400495/57191/163093/my-calendar.ics" },
  { professional: "Leonardo Valadão", icsUrl: "https://api.amigoapp.com.br/api/438713/57191/178221/my-calendar.ics" },
  { professional: "Soroterapia", icsUrl: "https://api.amigoapp.com.br/api/283275/57191/120327/my-calendar.ics" },
  { professional: "Silvana", icsUrl: "https://api.amigoapp.com.br/api/351516/57191/144532/my-calendar.ics" },
  { professional: "Fisioterapia", icsUrl: "https://api.amigoapp.com.br/api/360891/57191/148335/my-calendar.ics" },
];

/** Mapeia STATUS do iCalendar (CONFIRMED/TENTATIVE/CANCELLED) pro enum do Reactor. */
function mapIcsStatus(icsStatus: VEventStatus | undefined, start: Date): AmigoClinicEvent["status"] {
  const normalized = icsStatus ?? "";
  if (normalized === "CANCELLED") return "cancelado";
  if (start.getTime() < Date.now()) return "realizado";
  if (normalized === "CONFIRMED") return "confirmado";
  return "agendado";
}

/**
 * A AmigoClinic normalmente usa o SUMMARY como "Nome do Paciente" ou
 * "Nome do Paciente - Procedimento". Separamos quando há um delimitador
 * claro; caso contrário o summary inteiro vira o nome (mais seguro do
 * que adivinhar e cortar errado).
 */
function splitSummary(summary: string): { patientName: string; procedure: string | null } {
  const delimiters = [" - ", " – ", " — ", " | "];
  for (const d of delimiters) {
    if (summary.includes(d)) {
      const [first, ...rest] = summary.split(d);
      return { patientName: first.trim(), procedure: rest.join(d).trim() || null };
    }
  }
  return { patientName: summary.trim(), procedure: null };
}

/** node-ical tipa summary/description/location como string OU {val, params}. */
function toText(value: ParameterValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return value.val;
}

/** Busca e parseia um único feed .ics. Nunca lança — retorna [] e loga em erro. */
export async function fetchAmigoClinicCalendar(
  config: AmigoClinicCalendarConfig
): Promise<AmigoClinicEvent[]> {
  try {
    const parsed = await ical.async.fromURL(config.icsUrl);

    const events: AmigoClinicEvent[] = [];

    for (const component of Object.values(parsed)) {
      if (!component || component.type !== "VEVENT") continue;
      const vevent = component;
      if (!vevent.start) continue;

      const summary = toText(vevent.summary) ?? "(sem título)";
      const { patientName, procedure } = splitSummary(summary);

      events.push({
        externalId: vevent.uid ?? `${config.icsUrl}#${vevent.start.toISOString()}`,
        professional: config.professional,
        patientName,
        procedure,
        scheduledAt: vevent.start,
        endsAt: vevent.end ?? null,
        status: mapIcsStatus(vevent.status, vevent.start),
        rawSummary: summary,
        rawDescription: toText(vevent.description) ?? null,
        location: toText(vevent.location) ?? null,
      });
    }

    return events;
  } catch (err) {
    console.error(`[AmigoClinic] Erro ao buscar calendário de ${config.professional}:`, err);
    return [];
  }
}

/** Busca todos os calendários configurados em paralelo. */
export async function fetchAllAmigoClinicEvents(
  calendars: AmigoClinicCalendarConfig[] = AMIGOCLINIC_CALENDARS
): Promise<AmigoClinicEvent[]> {
  const results = await Promise.all(calendars.map(fetchAmigoClinicCalendar));
  return results.flat();
}
