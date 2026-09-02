import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabaseAdmin } from "@/lib/fusion/supabase";
import { AMIGOCLINIC_CALENDARS, fetchAllAmigoClinicEvents } from "@/lib/fusion/amigoclinic";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Reports whether the agenda mirror is configured, so the UI can explain what's missing. */
export async function GET() {
  let lastSync: string | null = null;
  try {
    const { data } = await getSupabaseAdmin()
      .from("reactor_appointments")
      .select("updated_at")
      .eq("source", "amigoclinic")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    lastSync = data?.updated_at ?? null;
  } catch {
    // The status probe must never be the thing that breaks the page.
  }

  return apiOk({
    ready: true, // feeds .ics são públicos por URL — não dependem de env vars
    calendars: AMIGOCLINIC_CALENDARS.map((c) => c.professional),
    lastSync,
  });
}

/**
 * Puxa os 6 calendários .ics da AmigoClinic e espelha em reactor_appointments,
 * usando o UID do VEVENT como chave de upsert (idempotente).
 */
export async function POST() {
  try {
    const db = getSupabaseAdmin();
    const now = new Date().toISOString();
    const events = await fetchAllAmigoClinicEvents();

    if (!events.length) {
      return apiOk({
        pulled: 0,
        upserted: 0,
        calendars: AMIGOCLINIC_CALENDARS.length,
        syncedAt: now,
        message:
          "Nenhum evento retornado pelos calendarios da AmigoClinic. Os feeds .ics podem estar vazios ou temporariamente inacessiveis.",
      });
    }

    const rows = events.map((event) => ({
      external_id: event.externalId,
      patient_name: event.patientName,
      patient_phone: null,
      professional: event.professional,
      procedure: event.procedure,
      scheduled_at: event.scheduledAt.toISOString(),
      status: event.status,
      source: "amigoclinic",
      updated_at: now,
      metadata: {
        raw_summary: event.rawSummary,
        raw_description: event.rawDescription,
        location: event.location,
        ends_at: event.endsAt?.toISOString() ?? null,
      },
    }));

    const { data, error } = await db
      .from("reactor_appointments")
      .upsert(rows, { onConflict: "external_id" })
      .select("id");
    if (error) throw new Error(error.message);

    await db.from("reactor_events").insert({
      type: "sync.amigoclinic",
      source: "amigoclinic",
      payload: { pulled: events.length, upserted: data?.length ?? 0 },
      processed: true,
      processed_at: now,
    });

    return apiOk({
      pulled: events.length,
      upserted: data?.length ?? 0,
      calendars: AMIGOCLINIC_CALENDARS.length,
      syncedAt: now,
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 502);
  }
}
