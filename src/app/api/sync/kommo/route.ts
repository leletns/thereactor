import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/fusion/supabase";
import {
  buildStatusMapper,
  contactField,
  deriveScore,
  fetchContacts,
  fetchLeads,
  fetchPipelines,
  fetchUsers,
  readKommoConfig,
  type KommoStatus,
} from "@/lib/fusion/kommo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Reports whether the sync can run, so the UI can explain what is missing. */
export async function GET() {
  const missing = [
    !process.env.KOMMO_SUBDOMAIN && "KOMMO_SUBDOMAIN",
    !process.env.KOMMO_ACCESS_TOKEN && "KOMMO_ACCESS_TOKEN",
    !process.env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean) as string[];

  let lastSync: string | null = null;
  try {
    const { data } = await (await import("@/lib/fusion/supabase"))
      .getSupabase()
      .from("reactor_leads")
      .select("kommo_synced_at")
      .not("kommo_synced_at", "is", null)
      .order("kommo_synced_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    lastSync = data?.kommo_synced_at ?? null;
  } catch {
    // The status probe must never be the thing that breaks the page.
  }

  return apiOk({
    ready: missing.length === 0,
    missing,
    subdomain: process.env.KOMMO_SUBDOMAIN ?? null,
    lastSync,
  });
}

/**
 * Full mirror pass: pipelines and their statuses first (they define the board
 * columns), then every lead mapped onto them.
 */
export async function POST() {
  try {
    const config = readKommoConfig();
    const db = getSupabaseAdmin();
    const now = new Date().toISOString();

    const [pipelines, leads, users] = await Promise.all([
      fetchPipelines(config),
      fetchLeads(config),
      fetchUsers(config).catch(() => []), // user list is optional enrichment
    ]);

    // ---- pipelines -------------------------------------------------------
    if (pipelines.length) {
      const { error } = await db.from("reactor_pipelines").upsert(
        pipelines.map((p) => ({
          kommo_pipeline_id: p.id,
          name: p.name,
          sort: p.sort ?? 0,
          is_main: Boolean(p.is_main),
          synced_at: now,
          updated_at: now,
        })),
        { onConflict: "kommo_pipeline_id" }
      );
      if (error) throw new Error(`pipelines: ${error.message}`);
    }

    // ---- statuses (the real board columns) --------------------------------
    const statuses: KommoStatus[] = pipelines.flatMap(
      (p) => p._embedded?.statuses ?? []
    );
    if (statuses.length) {
      const { error } = await db.from("reactor_pipeline_statuses").upsert(
        statuses.map((s) => ({
          kommo_status_id: s.id,
          kommo_pipeline_id: s.pipeline_id,
          name: s.name,
          color: s.color ?? null,
          sort: s.sort ?? 0,
          type: s.type ?? 0,
          synced_at: now,
          updated_at: now,
        })),
        { onConflict: "kommo_pipeline_id,kommo_status_id" }
      );
      if (error) throw new Error(`statuses: ${error.message}`);
    }

    if (!leads.length) {
      return apiOk({
        synced: 0,
        leads: 0,
        pipelines: pipelines.length,
        statuses: statuses.length,
        syncedAt: now,
        message: "Pipelines espelhados. Nenhum lead retornado pelo Kommo.",
      });
    }

    // ---- leads ------------------------------------------------------------
    const mapStatus = buildStatusMapper(statuses);
    const statusNames = new Map(statuses.map((s) => [s.id, s.name]));
    const userNames = new Map(users.map((u) => [u.id, u.name]));
    const maxPrice = leads.reduce((max, lead) => Math.max(max, Number(lead.price ?? 0)), 0);

    const contactIds = Array.from(
      new Set(leads.flatMap((lead) => lead._embedded?.contacts?.map((c) => c.id) ?? []))
    );
    const contacts = await fetchContacts(config, contactIds);

    const rows = leads.map((lead) => {
      const { status, progress } = mapStatus(lead.status_id, lead.pipeline_id);
      const mainContactId =
        lead._embedded?.contacts?.find((c) => c.is_main)?.id ??
        lead._embedded?.contacts?.[0]?.id;
      const contact = mainContactId ? contacts.get(mainContactId) : undefined;

      return {
        name: contact?.name || lead.name || `Lead ${lead.id}`,
        company: lead.name || null,
        email: contactField(contact, "EMAIL"),
        phone: contactField(contact, "PHONE"),
        status,
        score: deriveScore({
          progress,
          price: Number(lead.price ?? 0),
          maxPrice,
          updatedAt: lead.updated_at,
        }),
        value: Number(lead.price ?? 0),
        source: "kommo",
        kommo_lead_id: lead.id,
        kommo_pipeline_id: lead.pipeline_id,
        kommo_status_id: lead.status_id,
        kommo_status_name: statusNames.get(lead.status_id) ?? null,
        responsible_name: lead.responsible_user_id
          ? userNames.get(lead.responsible_user_id) ?? null
          : null,
        kommo_synced_at: now,
        last_activity_at: new Date(lead.updated_at * 1000).toISOString(),
        updated_at: now,
        metadata: {
          kommo_tags: lead._embedded?.tags?.map((t) => t.name) ?? [],
          kommo_created_at: lead.created_at,
          kommo_updated_at: lead.updated_at,
        },
      };
    });

    const { data, error } = await db
      .from("reactor_leads")
      .upsert(rows, { onConflict: "kommo_lead_id" })
      .select("id");
    if (error) throw new Error(`leads: ${error.message}`);

    await db.from("reactor_events").insert({
      type: "sync.kommo",
      source: "kommo",
      payload: {
        leads: leads.length,
        upserted: data?.length ?? 0,
        pipelines: pipelines.length,
        statuses: statuses.length,
      },
      processed: true,
      processed_at: now,
    });

    return apiOk({
      synced: data?.length ?? 0,
      leads: leads.length,
      pipelines: pipelines.length,
      statuses: statuses.length,
      syncedAt: now,
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 502);
  }
}
