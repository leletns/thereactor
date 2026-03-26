import { createClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
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
        };
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
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
