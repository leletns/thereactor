import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/fusion/supabase";
import {
  buildStatusMapper,
  contactField,
  deriveScore,
  fetchContacts,
  fetchLeads,
  fetchStatuses,
  readKommoConfig,
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

  return apiOk({
    ready: missing.length === 0,
    missing,
    subdomain: process.env.KOMMO_SUBDOMAIN ?? null,
  });
}

export async function POST() {
  try {
    const config = readKommoConfig();
    const db = getSupabaseAdmin();

    const [statuses, leads] = await Promise.all([
      fetchStatuses(config),
      fetchLeads(config),
    ]);

    if (!leads.length) {
      return apiOk({ synced: 0, leads: 0, message: "Nenhum lead retornado pelo Kommo" });
    }

    const mapStatus = buildStatusMapper(statuses);
    const maxPrice = leads.reduce((max, lead) => Math.max(max, Number(lead.price ?? 0)), 0);

    const contactIds = Array.from(
      new Set(
        leads.flatMap((lead) => lead._embedded?.contacts?.map((c) => c.id) ?? [])
      )
    );
    const contacts = await fetchContacts(config, contactIds);

    const now = new Date().toISOString();
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
        kommo_synced_at: now,
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
    if (error) throw new Error(error.message);

    await db.from("reactor_events").insert({
      type: "sync.kommo",
      source: "kommo",
      payload: { leads: leads.length, upserted: data?.length ?? 0 },
      processed: true,
      processed_at: now,
    });

    return apiOk({
      synced: data?.length ?? 0,
      leads: leads.length,
      syncedAt: now,
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 502);
  }
}
