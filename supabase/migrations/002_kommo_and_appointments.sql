-- The Reactor — Kommo CRM sync + clinic agenda
-- lhex systems
-- Migration: 002_kommo_and_appointments
--
-- Idempotent: safe to re-run against a database that already has part of it.

-- ============================================================
-- KOMMO COLUMNS ON LEADS
-- ============================================================
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS kommo_lead_id BIGINT;
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS kommo_pipeline_id BIGINT;
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS kommo_status_id BIGINT;
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS kommo_synced_at TIMESTAMPTZ;

-- Required so the sync can upsert on the Kommo id instead of duplicating leads.
CREATE UNIQUE INDEX IF NOT EXISTS reactor_leads_kommo_lead_id_key
  ON reactor_leads (kommo_lead_id)
  WHERE kommo_lead_id IS NOT NULL;

-- ============================================================
-- APPOINTMENTS (clinic agenda)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  external_id TEXT UNIQUE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  professional TEXT,
  procedure TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado'
    CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado', 'faltou')),
  value NUMERIC,
  source TEXT NOT NULL DEFAULT 'amigoclinic',
  lead_id UUID REFERENCES reactor_leads(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reactor_appointments_scheduled_at
  ON reactor_appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reactor_appointments_status
  ON reactor_appointments(status);

ALTER TABLE reactor_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access" ON reactor_appointments;
CREATE POLICY "Allow read access" ON reactor_appointments
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Service role full access" ON reactor_appointments;
CREATE POLICY "Service role full access" ON reactor_appointments
  FOR ALL TO service_role USING (true) WITH CHECK (true);
