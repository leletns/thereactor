-- The Reactor — Database Schema
-- lhex systems
-- Migration: 001_reactor_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- REACTOR SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_role TEXT NOT NULL DEFAULT 'orchestrator',
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived'))
);

CREATE INDEX idx_reactor_sessions_user_id ON reactor_sessions(user_id);
CREATE INDEX idx_reactor_sessions_status ON reactor_sessions(status);
CREATE INDEX idx_reactor_sessions_created_at ON reactor_sessions(created_at DESC);

-- ============================================================
-- REACTOR MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_id UUID NOT NULL REFERENCES reactor_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  agent_role TEXT,
  tokens_used INTEGER,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reactor_messages_session_id ON reactor_messages(session_id);
CREATE INDEX idx_reactor_messages_created_at ON reactor_messages(created_at DESC);
CREATE INDEX idx_reactor_messages_agent_role ON reactor_messages(agent_role);

-- ============================================================
-- REACTOR LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'prospeccao'
    CHECK (status IN ('prospeccao', 'qualificacao', 'proposta', 'fechamento', 'ganho', 'perdido')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  value DECIMAL(12, 2),
  source TEXT,
  notes TEXT,
  assigned_to TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reactor_leads_status ON reactor_leads(status);
CREATE INDEX idx_reactor_leads_score ON reactor_leads(score DESC);
CREATE INDEX idx_reactor_leads_created_at ON reactor_leads(created_at DESC);
CREATE INDEX idx_reactor_leads_company ON reactor_leads(company);

-- ============================================================
-- REACTOR TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  reference TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reactor_transactions_date ON reactor_transactions(date DESC);
CREATE INDEX idx_reactor_transactions_type ON reactor_transactions(type);
CREATE INDEX idx_reactor_transactions_category ON reactor_transactions(category);
CREATE INDEX idx_reactor_transactions_status ON reactor_transactions(status);

-- ============================================================
-- REACTOR TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'aberta'
    CHECK (status IN ('aberta', 'em_progresso', 'concluida', 'cancelada')),
  priority TEXT NOT NULL DEFAULT 'media'
    CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  due_date DATE,
  assigned_to TEXT,
  category TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reactor_tasks_status ON reactor_tasks(status);
CREATE INDEX idx_reactor_tasks_priority ON reactor_tasks(priority);
CREATE INDEX idx_reactor_tasks_due_date ON reactor_tasks(due_date);
CREATE INDEX idx_reactor_tasks_assigned_to ON reactor_tasks(assigned_to);

-- ============================================================
-- REACTOR EVENTS (A2A / Webhooks)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  session_id UUID REFERENCES reactor_sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_reactor_events_type ON reactor_events(type);
CREATE INDEX idx_reactor_events_source ON reactor_events(source);
CREATE INDEX idx_reactor_events_processed ON reactor_events(processed);
CREATE INDEX idx_reactor_events_created_at ON reactor_events(created_at DESC);
CREATE INDEX idx_reactor_events_session_id ON reactor_events(session_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reactor_sessions_updated_at
  BEFORE UPDATE ON reactor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reactor_leads_updated_at
  BEFORE UPDATE ON reactor_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reactor_tasks_updated_at
  BEFORE UPDATE ON reactor_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE reactor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactor_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON reactor_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reactor_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reactor_leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reactor_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reactor_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reactor_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon/authenticated read (adjust as needed)
CREATE POLICY "Allow read access" ON reactor_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access" ON reactor_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access" ON reactor_leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access" ON reactor_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access" ON reactor_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow read access" ON reactor_events FOR SELECT TO anon, authenticated USING (true);

-- Allow inserts from anon (for webhook/chat)
CREATE POLICY "Allow inserts" ON reactor_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON reactor_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON reactor_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- SEED DATA (Sample transactions for demo)
-- ============================================================
INSERT INTO reactor_transactions (date, description, amount, type, category, status) VALUES
  ('2025-03-26', 'MRR — TechVision Ltda', 18500.00, 'receita', 'SaaS', 'confirmado'),
  ('2025-03-25', 'Consultoria estratégica — Grupo Alpha', 25000.00, 'receita', 'Consultoria', 'confirmado'),
  ('2025-03-24', 'AWS — Infraestrutura', 8420.00, 'despesa', 'Tecnologia', 'confirmado'),
  ('2025-03-24', 'Salários equipe — Março', 68000.00, 'despesa', 'RH', 'confirmado'),
  ('2025-03-23', 'MRR — DataCore Sistemas', 12800.00, 'receita', 'SaaS', 'confirmado'),
  ('2025-03-22', 'Marketing Digital — Meta Ads', 4200.00, 'despesa', 'Marketing', 'confirmado'),
  ('2025-03-21', 'Licença Anual — StartupX', 22000.00, 'receita', 'Licenças', 'pendente'),
  ('2025-03-20', 'Suporte Premium — InnovateBR', 5400.00, 'receita', 'Suporte', 'confirmado');

-- Sample leads
INSERT INTO reactor_leads (name, company, email, phone, status, score, value, source) VALUES
  ('Ricardo Mendes', 'TechVision Ltda', 'ricardo@techvision.com.br', '11999887654', 'fechamento', 92, 84000.00, 'LinkedIn'),
  ('Felipe Santos', 'DataCore Sistemas', 'felipe@datacore.com.br', '11988776543', 'proposta', 85, 62000.00, 'Site'),
  ('João Silva', 'Grupo Alpha', 'joao@grupoalpha.com.br', '21977665432', 'proposta', 94, 120000.00, 'Evento'),
  ('Pedro Lima', 'MegaCorp Brasil', 'pedro@megacorp.com.br', '31966554321', 'qualificacao', 88, 95000.00, 'Indicação');
