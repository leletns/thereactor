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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Read-only client (anon key). RLS grants SELECT on every reactor_* table,
 * so this is enough for every dashboard read path.
 */
export function getSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase nao configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Write client (service role key). Only used by server-side sync routes.
 * Never import this from a "use client" module.
 */
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Escrita indisponivel: defina SUPABASE_SERVICE_ROLE_KEY (Supabase > Project Settings > API)"
    );
  }
  return createClient<Database>(supabaseUrl, serviceKey, {
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
