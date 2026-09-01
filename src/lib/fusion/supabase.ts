import { createClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Lets createClient pick the right PostgREST options automatically.
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      reactor_sessions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string | null;
          agent_role: string;
          metadata: Json | null;
          status: "active" | "closed" | "archived";
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          agent_role: string;
          metadata?: Json | null;
          status?: "active" | "closed" | "archived";
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
          agent_role?: string;
          metadata?: Json | null;
          status?: "active" | "closed" | "archived";
        };
        Relationships: [];
      };
      reactor_messages: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          agent_role: string | null;
          tokens_used: number | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          agent_role?: string | null;
          tokens_used?: number | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          agent_role?: string | null;
          tokens_used?: number | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      reactor_leads: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          status: "prospeccao" | "qualificacao" | "proposta" | "fechamento" | "ganho" | "perdido";
          score: number | null;
          value: number | null;
          source: string | null;
          notes: string | null;
          assigned_to: string | null;
          metadata: Json | null;
          kommo_lead_id: number | null;
          kommo_pipeline_id: number | null;
          kommo_status_id: number | null;
          kommo_synced_at: string | null;
          kommo_status_name: string | null;
          responsible_name: string | null;
          last_activity_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: "prospeccao" | "qualificacao" | "proposta" | "fechamento" | "ganho" | "perdido";
          score?: number | null;
          value?: number | null;
          source?: string | null;
          notes?: string | null;
          assigned_to?: string | null;
          metadata?: Json | null;
          kommo_lead_id?: number | null;
          kommo_pipeline_id?: number | null;
          kommo_status_id?: number | null;
          kommo_synced_at?: string | null;
          kommo_status_name?: string | null;
          responsible_name?: string | null;
          last_activity_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: "prospeccao" | "qualificacao" | "proposta" | "fechamento" | "ganho" | "perdido";
          score?: number | null;
          value?: number | null;
          source?: string | null;
          notes?: string | null;
          assigned_to?: string | null;
          metadata?: Json | null;
          kommo_lead_id?: number | null;
          kommo_pipeline_id?: number | null;
          kommo_status_id?: number | null;
          kommo_synced_at?: string | null;
          kommo_status_name?: string | null;
          responsible_name?: string | null;
          last_activity_at?: string | null;
        };
        Relationships: [];
      };
      reactor_transactions: {
        Row: {
          id: string;
          created_at: string;
          date: string;
          description: string;
          amount: number;
          type: "receita" | "despesa";
          category: string;
          status: "confirmado" | "pendente" | "cancelado";
          reference: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          date: string;
          description: string;
          amount: number;
          type: "receita" | "despesa";
          category: string;
          status?: "confirmado" | "pendente" | "cancelado";
          reference?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          date?: string;
          description?: string;
          amount?: number;
          type?: "receita" | "despesa";
          category?: string;
          status?: "confirmado" | "pendente" | "cancelado";
          reference?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      reactor_tasks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          status: "aberta" | "em_progresso" | "concluida" | "cancelada";
          priority: "baixa" | "media" | "alta" | "critica";
          due_date: string | null;
          assigned_to: string | null;
          category: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          status?: "aberta" | "em_progresso" | "concluida" | "cancelada";
          priority?: "baixa" | "media" | "alta" | "critica";
          due_date?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string | null;
          status?: "aberta" | "em_progresso" | "concluida" | "cancelada";
          priority?: "baixa" | "media" | "alta" | "critica";
          due_date?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      reactor_events: {
        Row: {
          id: string;
          created_at: string;
          type: string;
          source: string;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          session_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          type: string;
          source: string;
          payload: Json;
          processed?: boolean;
          processed_at?: string | null;
          session_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          type?: string;
          source?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          session_id?: string | null;
        };
        Relationships: [];
      };
      reactor_appointments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          external_id: string | null;
          patient_name: string;
          patient_phone: string | null;
          professional: string | null;
          procedure: string | null;
          scheduled_at: string;
          status: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
          value: number | null;
          source: string;
          lead_id: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          external_id?: string | null;
          patient_name: string;
          patient_phone?: string | null;
          professional?: string | null;
          procedure?: string | null;
          scheduled_at: string;
          status?: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
          value?: number | null;
          source?: string;
          lead_id?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          external_id?: string | null;
          patient_name?: string;
          patient_phone?: string | null;
          professional?: string | null;
          procedure?: string | null;
          scheduled_at?: string;
          status?: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
          value?: number | null;
          source?: string;
          lead_id?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      reactor_pipelines: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          kommo_pipeline_id: number;
          name: string;
          sort: number;
          is_main: boolean;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          kommo_pipeline_id: number;
          name: string;
          sort?: number;
          is_main?: boolean;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          kommo_pipeline_id?: number;
          name?: string;
          sort?: number;
          is_main?: boolean;
          synced_at?: string | null;
        };
        Relationships: [];
      };
      reactor_pipeline_statuses: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          kommo_status_id: number;
          kommo_pipeline_id: number;
          name: string;
          color: string | null;
          sort: number;
          type: number;
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          kommo_status_id: number;
          kommo_pipeline_id: number;
          name: string;
          color?: string | null;
          sort?: number;
          type?: number;
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          kommo_status_id?: number;
          kommo_pipeline_id?: number;
          name?: string;
          color?: string | null;
          sort?: number;
          type?: number;
          synced_at?: string | null;
        };
        Relationships: [];
      };
      reactor_reports: {
        Row: {
          id: string;
          created_at: string;
          period: "diario" | "semanal" | "mensal";
          period_start: string;
          period_end: string;
          title: string;
          summary: string | null;
          metrics: Json;
          highlights: Json;
          generated_by: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          period?: "diario" | "semanal" | "mensal";
          period_start: string;
          period_end: string;
          title: string;
          summary?: string | null;
          metrics?: Json;
          highlights?: Json;
          generated_by?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          period?: "diario" | "semanal" | "mensal";
          period_start?: string;
          period_end?: string;
          title?: string;
          summary?: string | null;
          metrics?: Json;
          highlights?: Json;
          generated_by?: string;
        };
        Relationships: [];
      };
      reactor_lead_activity: {
        Row: {
          id: string;
          created_at: string;
          lead_id: string | null;
          kommo_lead_id: number | null;
          kind: string;
          from_status: string | null;
          to_status: string | null;
          note: string | null;
          actor: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          lead_id?: string | null;
          kommo_lead_id?: number | null;
          kind: string;
          from_status?: string | null;
          to_status?: string | null;
          note?: string | null;
          actor?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          lead_id?: string | null;
          kommo_lead_id?: number | null;
          kind?: string;
          from_status?: string | null;
          to_status?: string | null;
          note?: string | null;
          actor?: string;
          metadata?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

/**
 * Next.js inlines every NEXT_PUBLIC_* reference at BUILD time, so a variable
 * added to the host after the build stays undefined until the next build.
 * Nothing here runs in the browser — every caller is an /api route handler —
 * so the unprefixed names are read at runtime and take effect on restart,
 * with no rebuild required. The NEXT_PUBLIC_ names stay supported first for
 * compatibility with existing .env files.
 */
function readSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readSupabaseEnv();
  return Boolean(url && anonKey);
}

/** Which of the accepted names are actually present — used by /api/health. */
export function supabaseEnvReport() {
  const { url, anonKey } = readSupabaseEnv();
  return {
    url: Boolean(url),
    anonKey: Boolean(anonKey),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

/**
 * Read-only client (anon key). RLS grants SELECT on every reactor_* table,
 * so this is enough for every dashboard read path.
 */
export function getSupabase() {
  const { url, anonKey } = readSupabaseEnv();
  if (!url || !anonKey) {
    const missing = [!url && "SUPABASE_URL", !anonKey && "SUPABASE_ANON_KEY"]
      .filter(Boolean)
      .join(" e ");
    throw new Error(
      `Supabase nao configurado: falta ${missing}. Se voce usa os nomes NEXT_PUBLIC_*, ` +
        "eles so entram em vigor apos um novo build (Redeploy sem cache na Vercel)."
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Write client (service role key). Only used by server-side sync routes.
 * Never import this from a "use client" module.
 */
export function getSupabaseAdmin() {
  const { url } = readSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Escrita indisponivel: defina SUPABASE_SERVICE_ROLE_KEY (Supabase > Project Settings > API)"
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type ReactorSession =
  Database["public"]["Tables"]["reactor_sessions"]["Row"];
export type ReactorMessage =
  Database["public"]["Tables"]["reactor_messages"]["Row"];
export type ReactorLead =
  Database["public"]["Tables"]["reactor_leads"]["Row"];
export type ReactorTransaction =
  Database["public"]["Tables"]["reactor_transactions"]["Row"];
export type ReactorTask =
  Database["public"]["Tables"]["reactor_tasks"]["Row"];
export type ReactorEvent =
  Database["public"]["Tables"]["reactor_events"]["Row"];
export type ReactorAppointment =
  Database["public"]["Tables"]["reactor_appointments"]["Row"];
export type ReactorPipeline =
  Database["public"]["Tables"]["reactor_pipelines"]["Row"];
export type ReactorPipelineStatus =
  Database["public"]["Tables"]["reactor_pipeline_statuses"]["Row"];
export type ReactorReport =
  Database["public"]["Tables"]["reactor_reports"]["Row"];
export type ReactorLeadActivity =
  Database["public"]["Tables"]["reactor_lead_activity"]["Row"];
