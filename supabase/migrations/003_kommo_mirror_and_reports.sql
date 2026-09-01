-- The Reactor — Kommo mirror + automated reports
-- Migration: 003_kommo_mirror_and_reports
-- Idempotent.

-- ============================================================
-- KOMMO PIPELINES (mirrored 1:1 from the CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  kommo_pipeline_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  synced_at TIMESTAMPTZ
);

-- ============================================================
-- KOMMO STATUSES (the real board columns, colours included)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_pipeline_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  kommo_status_id BIGINT NOT NULL,
  kommo_pipeline_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  -- Kommo type: 0 = regular, 1 = won/lost terminal
  type INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ,
  UNIQUE (kommo_pipeline_id, kommo_status_id)
);

CREATE INDEX IF NOT EXISTS idx_reactor_statuses_pipeline
  ON reactor_pipeline_statuses(kommo_pipeline_id, sort);

-- ============================================================
-- REPORTS (snapshot + narrative, generated on a schedule)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  period TEXT NOT NULL DEFAULT 'semanal'
    CHECK (period IN ('diario', 'semanal', 'mensal')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  metrics JSONB NOT NULL DEFAULT '{}',
  highlights JSONB NOT NULL DEFAULT '[]',
  generated_by TEXT NOT NULL DEFAULT 'reactor'
);

CREATE INDEX IF NOT EXISTS idx_reactor_reports_created
  ON reactor_reports(created_at DESC);

-- ============================================================
-- LEAD ACTIVITY (every stage move, for the funnel timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_lead_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  lead_id UUID REFERENCES reactor_leads(id) ON DELETE CASCADE,
  kommo_lead_id BIGINT,
  kind TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  actor TEXT NOT NULL DEFAULT 'reactor',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reactor_lead_activity_lead
  ON reactor_lead_activity(lead_id, created_at DESC);

-- Leads keep the human-readable Kommo stage name so the board can group
-- by the CRM's own columns instead of a fixed four-stage funnel.
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS kommo_status_name TEXT;
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS responsible_name TEXT;
ALTER TABLE reactor_leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE reactor_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_pipeline_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_lead_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access" ON reactor_pipelines;
CREATE POLICY "Allow read access" ON reactor_pipelines
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_pipelines;
CREATE POLICY "Service role full access" ON reactor_pipelines
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access" ON reactor_pipeline_statuses;
CREATE POLICY "Allow read access" ON reactor_pipeline_statuses
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_pipeline_statuses;
CREATE POLICY "Service role full access" ON reactor_pipeline_statuses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access" ON reactor_reports;
CREATE POLICY "Allow read access" ON reactor_reports
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_reports;
CREATE POLICY "Service role full access" ON reactor_reports
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read access" ON reactor_lead_activity;
CREATE POLICY "Allow read access" ON reactor_lead_activity
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_lead_activity;
CREATE POLICY "Service role full access" ON reactor_lead_activity
  FOR ALL TO service_role USING (true) WITH CHECK (true);
