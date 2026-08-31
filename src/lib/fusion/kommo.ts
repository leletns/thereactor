/**
 * Kommo CRM (amoCRM) API v4 client.
 *
 * Auth uses a long-lived access token:
 *   Kommo > Settings > Integrations > your integration > Access token
 * Configure KOMMO_SUBDOMAIN and KOMMO_ACCESS_TOKEN.
 */

export interface KommoConfig {
  subdomain: string;
  token: string;
}

export interface KommoLead {
  id: number;
  name: string;
  price: number | null;
  status_id: number;
  pipeline_id: number;
  created_at: number;
  updated_at: number;
  responsible_user_id?: number;
  _embedded?: {
    contacts?: { id: number; is_main?: boolean }[];
    tags?: { id: number; name: string }[];
  };
}

export interface KommoContact {
  id: number;
  name: string;
  custom_fields_values?: {
    field_code?: string | null;
    values: { value: string }[];
  }[];
}

export interface KommoStatus {
  id: number;
  name: string;
  sort: number;
  pipeline_id: number;
  type: number;
}

/** Kommo reserves these two ids across every pipeline. */
const WON_STATUS_ID = 142;
const LOST_STATUS_ID = 143;

export type ReactorStatus =
  | "prospeccao"
  | "qualificacao"
  | "proposta"
  | "fechamento"
  | "ganho"
  | "perdido";

export function readKommoConfig(): KommoConfig {
  const subdomain = process.env.KOMMO_SUBDOMAIN;
  const token = process.env.KOMMO_ACCESS_TOKEN;
  if (!subdomain || !token) {
    throw new Error(
      "Kommo nao configurado: defina KOMMO_SUBDOMAIN e KOMMO_ACCESS_TOKEN"
    );
  }
  return { subdomain, token };
}

async function kommoGet<T>(
  config: KommoConfig,
  path: string,
  params: Record<string, string | number> = {}
): Promise<T | null> {
  const url = new URL(`https://${config.subdomain}.kommo.com/api/v4/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  // Kommo answers 204 when a collection page is empty.
  if (response.status === 204) return null;
  if (response.status === 401) {
    throw new Error(
      "Kommo recusou o token (401). Gere um novo access token em Kommo > Integracoes."
    );
  }
  if (!response.ok) {
    throw new Error(`Kommo ${path} respondeu ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

/** Walks Kommo's paginated collections up to `maxPages`. */
async function kommoCollection<T>(
  config: KommoConfig,
  path: string,
  embeddedKey: string,
  params: Record<string, string | number> = {},
  maxPages = 20
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const body = await kommoGet<{ _embedded?: Record<string, T[]> }>(config, path, {
      ...params,
      page,
      limit: 250,
    });
    const batch = body?._embedded?.[embeddedKey] ?? [];
    items.push(...batch);
    if (batch.length < 250) break;
  }
  return items;
}

export function fetchLeads(config: KommoConfig) {
  return kommoCollection<KommoLead>(config, "leads", "leads", { with: "contacts" });
}

export function fetchStatuses(config: KommoConfig) {
  return kommoCollection<{ _embedded?: { statuses?: KommoStatus[] } } & KommoStatus>(
    config,
    "leads/pipelines",
    "pipelines"
  ).then((pipelines) =>
    pipelines.flatMap((pipeline) => pipeline._embedded?.statuses ?? [])
  );
}

export async function fetchContacts(config: KommoConfig, ids: number[]) {
  if (!ids.length) return new Map<number, KommoContact>();
  const contacts = new Map<number, KommoContact>();

  // Kommo caps the id filter per request, so batch it.
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const url = new URL(`https://${config.subdomain}.kommo.com/api/v4/contacts`);
    url.searchParams.set("limit", "250");
    for (const id of batch) url.searchParams.append("filter[id][]", String(id));

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${config.token}` },
      cache: "no-store",
    });
    if (response.status === 204) continue;
    if (!response.ok) continue; // contact enrichment is best-effort
    const body = (await response.json()) as {
      _embedded?: { contacts?: KommoContact[] };
    };
    for (const contact of body._embedded?.contacts ?? []) {
      contacts.set(contact.id, contact);
    }
  }
  return contacts;
}

export function contactField(contact: KommoContact | undefined, code: "PHONE" | "EMAIL") {
  const field = contact?.custom_fields_values?.find((f) => f.field_code === code);
  return field?.values?.[0]?.value ?? null;
}

/**
 * Kommo status ids are account-specific, so map them onto The Reactor's
 * pipeline: the two reserved ids first, then the status' position inside its
 * own pipeline spread over the four open stages.
 */
export function buildStatusMapper(statuses: KommoStatus[]) {
  const openByPipeline = new Map<number, KommoStatus[]>();
  for (const status of statuses) {
    if (status.id === WON_STATUS_ID || status.id === LOST_STATUS_ID) continue;
    const list = openByPipeline.get(status.pipeline_id) ?? [];
    list.push(status);
    openByPipeline.set(status.pipeline_id, list);
  }
  for (const list of Array.from(openByPipeline.values())) {
    list.sort((a, b) => a.sort - b.sort);
  }

  const stages: ReactorStatus[] = [
    "prospeccao",
    "qualificacao",
    "proposta",
    "fechamento",
  ];

  return function mapStatus(statusId: number, pipelineId: number) {
    if (statusId === WON_STATUS_ID) return { status: "ganho" as ReactorStatus, progress: 1 };
    if (statusId === LOST_STATUS_ID) return { status: "perdido" as ReactorStatus, progress: 0 };

    const list = openByPipeline.get(pipelineId) ?? [];
    const index = list.findIndex((s) => s.id === statusId);
    if (index < 0 || list.length === 0) {
      return { status: "prospeccao" as ReactorStatus, progress: 0.1 };
    }
    const progress = list.length === 1 ? 0.5 : index / (list.length - 1);
    const stage = stages[Math.min(stages.length - 1, Math.round(progress * (stages.length - 1)))];
    return { status: stage, progress };
  };
}

/**
 * Kommo has no lead score, so The Reactor derives one:
 * 50% pipeline progress, 30% deal size against the largest open deal,
 * 20% freshness (decaying to zero over 30 days without an update).
 */
export function deriveScore(options: {
  progress: number;
  price: number;
  maxPrice: number;
  updatedAt: number;
  now?: number;
}) {
  const { progress, price, maxPrice, updatedAt } = options;
  const now = options.now ?? Date.now();
  const valueRatio = maxPrice > 0 ? Math.min(price / maxPrice, 1) : 0;
  const daysSinceUpdate = (now - updatedAt * 1000) / 86_400_000;
  const freshness = Math.max(0, 1 - daysSinceUpdate / 30);
  const score = progress * 50 + valueRatio * 30 + freshness * 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}
