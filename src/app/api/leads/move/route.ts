import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, getSupabaseAdmin } from "@/lib/fusion/supabase";
import { moveLeadToStatus, readKommoConfig } from "@/lib/fusion/kommo";

export const dynamic = "force-dynamic";

interface MoveBody {
  leadId: string;
  /** Kommo status id when the board is mirrored; the funnel key otherwise. */
  toStatusId?: number | null;
  toStatusKey?: string | null;
}

/**
 * Moves a lead between board columns. When the lead came from Kommo the change
 * is written to the CRM first — if Kommo rejects it, nothing is saved locally,
 * so the board can never show a stage the CRM does not have.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MoveBody;
    if (!body?.leadId) throw new Error("leadId obrigatorio");

    const db = getSupabaseAdmin();

    const { data: lead, error: readError } = await getSupabase()
      .from("reactor_leads")
      .select("*")
      .eq("id", body.leadId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!lead) throw new Error("Lead nao encontrado");

    const now = new Date().toISOString();
    const fromStatus = lead.kommo_status_name ?? lead.status;
    let toStatusName = body.toStatusKey ?? null;

    // --- mirrored lead: Kommo is the source of truth, write there first -----
    if (lead.kommo_lead_id && body.toStatusId) {
      const config = readKommoConfig();
      await moveLeadToStatus(
        config,
        lead.kommo_lead_id,
        body.toStatusId,
        lead.kommo_pipeline_id ?? undefined
      );

      const { data: status } = await getSupabase()
        .from("reactor_pipeline_statuses")
        .select("name")
        .eq("kommo_status_id", body.toStatusId)
        .eq("kommo_pipeline_id", lead.kommo_pipeline_id ?? 0)
        .maybeSingle();
      toStatusName = status?.name ?? String(body.toStatusId);

      const { error } = await db
        .from("reactor_leads")
        .update({
          kommo_status_id: body.toStatusId,
          kommo_status_name: toStatusName,
          updated_at: now,
          last_activity_at: now,
        })
        .eq("id", lead.id);
      if (error) throw new Error(error.message);
    } else {
      // --- local-only lead: move within The Reactor's own funnel -----------
      if (!body.toStatusKey) throw new Error("toStatusKey obrigatorio para leads locais");
      const { error } = await db
        .from("reactor_leads")
        .update({
          status: body.toStatusKey as never,
          updated_at: now,
          last_activity_at: now,
        })
        .eq("id", lead.id);
      if (error) throw new Error(error.message);
      toStatusName = body.toStatusKey;
    }

    await db.from("reactor_lead_activity").insert({
      lead_id: lead.id,
      kommo_lead_id: lead.kommo_lead_id,
      kind: "stage_change",
      from_status: fromStatus,
      to_status: toStatusName,
      actor: "reactor-ui",
      note: lead.kommo_lead_id
        ? "Etapa alterada no Reactor e replicada no Kommo"
        : "Etapa alterada no Reactor",
    });

    return apiOk({
      leadId: lead.id,
      from: fromStatus,
      to: toStatusName,
      syncedToKommo: Boolean(lead.kommo_lead_id && body.toStatusId),
    });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 502);
  }
}
