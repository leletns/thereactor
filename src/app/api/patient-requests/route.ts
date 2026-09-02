import { apiFail, apiOk, isConfigError } from "@/lib/api";
import { getSupabase, getSupabaseAdmin } from "@/lib/fusion/supabase";

type PatientRequestStatus = "pendente" | "concluido" | "cancelado";
const VALID_STATUSES: PatientRequestStatus[] = ["pendente", "concluido", "cancelado"];
function isPatientRequestStatus(value: string): value is PatientRequestStatus {
  return (VALID_STATUSES as string[]).includes(value);
}

export const dynamic = "force-dynamic";

/**
 * "Criar paciente" na AmigoClinic — a AmigoClinic nao tem API de escrita
 * publica confirmada (so os feeds .ics de leitura), entao isto NAO cria o
 * paciente la de verdade. E um pedido estruturado: o time preenche aqui,
 * fica registrado e visivel, e alguem da equipe da entrada manual na
 * AmigoClinic com esses dados prontos — reduz o "que dados eu preciso
 * anotar" pra zero, mesmo sem escrita automatica.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = getSupabase()
      .from("reactor_patient_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (status && isPatientRequestStatus(status)) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return apiOk({ requests: data ?? [] });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

interface CreateBody {
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  procedure?: string;
  professional?: string;
  preferredAt?: string;
  notes?: string;
  leadId?: string;
  createdBy?: string;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateBody;
    if (!payload?.patientName?.trim()) {
      return apiFail("Parametro patientName e obrigatorio.", 400);
    }

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("reactor_patient_requests")
      .insert({
        patient_name: payload.patientName.trim(),
        patient_phone: payload.patientPhone?.trim() || null,
        patient_email: payload.patientEmail?.trim() || null,
        procedure: payload.procedure?.trim() || null,
        professional: payload.professional?.trim() || null,
        preferred_at: payload.preferredAt || null,
        notes: payload.notes?.trim() || null,
        lead_id: payload.leadId || null,
        created_by: payload.createdBy?.trim() || null,
        status: "pendente",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await db.from("reactor_events").insert({
      type: "patient_request.created",
      source: "reactor",
      payload: { requestId: data.id, patientName: data.patient_name },
      processed: true,
      processed_at: new Date().toISOString(),
    });

    return apiOk({ request: data });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}

interface UpdateBody {
  id: string;
  status: "pendente" | "concluido" | "cancelado";
}

/** Marca o pedido como concluido depois que alguem deu entrada na AmigoClinic. */
export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as UpdateBody;
    if (!payload?.id || !payload?.status) {
      return apiFail("Parametros id e status sao obrigatorios.", 400);
    }

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("reactor_patient_requests")
      .update({
        status: payload.status,
        updated_at: new Date().toISOString(),
        completed_at: payload.status === "concluido" ? new Date().toISOString() : null,
      })
      .eq("id", payload.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    return apiOk({ request: data });
  } catch (error) {
    return apiFail(error, isConfigError(error) ? 503 : 500);
  }
}
