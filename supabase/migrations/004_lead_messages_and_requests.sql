-- The Reactor — mensagens por lead (WhatsApp via Kommo), atalhos e pedidos de paciente
-- Migration: 004_lead_messages_and_requests
-- Idempotente. Já aplicada em produção (hamljizmkxftnicvlerh) via Supabase MCP
-- em 2026-09-01, antes deste arquivo existir no repositório — mantém o
-- histórico do schema em sincronia com o banco real.

-- ============================================================
-- MENSAGENS POR LEAD (espelho da conversa do Kommo/WhatsApp)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_lead_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  lead_id UUID REFERENCES reactor_leads(id) ON DELETE CASCADE,
  kommo_lead_id BIGINT,
  kommo_chat_id TEXT,
  kommo_message_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  author_name TEXT,
  author_kind TEXT NOT NULL DEFAULT 'lead' CHECK (author_kind IN ('lead', 'agent', 'system')),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_reactor_lead_messages_lead
  ON reactor_lead_messages(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactor_lead_messages_kommo_lead
  ON reactor_lead_messages(kommo_lead_id, created_at DESC);

ALTER TABLE reactor_lead_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access" ON reactor_lead_messages;
CREATE POLICY "Allow read access" ON reactor_lead_messages
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_lead_messages;
CREATE POLICY "Service role full access" ON reactor_lead_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- ATALHOS DE RESPOSTA RÁPIDA (quick replies do time)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_quick_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  sort INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_reactor_quick_replies_active
  ON reactor_quick_replies(active, sort);

ALTER TABLE reactor_quick_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access" ON reactor_quick_replies;
CREATE POLICY "Allow read access" ON reactor_quick_replies
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_quick_replies;
CREATE POLICY "Service role full access" ON reactor_quick_replies
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- PEDIDOS DE PACIENTE (intake para dar entrada na AmigoClinic)
-- ============================================================
CREATE TABLE IF NOT EXISTS reactor_patient_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_email TEXT,
  procedure TEXT,
  professional TEXT,
  preferred_at TIMESTAMPTZ,
  notes TEXT,
  lead_id UUID REFERENCES reactor_leads(id) ON DELETE SET NULL,
  created_by TEXT,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reactor_patient_requests_status
  ON reactor_patient_requests(status, created_at DESC);

ALTER TABLE reactor_patient_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access" ON reactor_patient_requests;
CREATE POLICY "Allow read access" ON reactor_patient_requests
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service role full access" ON reactor_patient_requests;
CREATE POLICY "Service role full access" ON reactor_patient_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed de atalhos padrão (tom Blue Clínica — acolhedor, seguro, nunca promete resultado)
INSERT INTO reactor_quick_replies (title, body, category, sort) VALUES
  ('Boas-vindas', 'Olá! Que bom te receber por aqui. Sou da equipe da Blue Clínica, do Dr. Rafael Erthal. Como posso te ajudar hoje?', 'geral', 10),
  ('Explicar consulta', 'A consulta é o momento em que o Dr. Rafael avalia seu histórico, sintomas, fotos e objetivos para entender o melhor caminho para o seu caso. Posso te explicar como funciona a avaliação?', 'consulta', 20),
  ('Sobre LipeDefinition', 'A LipeDefinition® é a técnica autoral do Dr. Rafael voltada ao tratamento cirúrgico do lipedema, com foco em preservação linfática, contorno e segurança. A indicação depende da avaliação do seu caso.', 'lipedema', 30),
  ('Sobre Sublift', 'O Sublift é uma técnica autoral do Dr. Rafael voltada para celulites profundas, depressões e irregularidades da pele. Em alguns casos pode ser associado à LipeDefinition®, sempre dependendo de avaliação médica.', 'sublift', 40),
  ('Valor da consulta', 'A consulta é particular e especializada. Nosso time pode te passar o investimento atualizado e as opções disponíveis. Posso entender rapidinho se você busca avaliação para lipedema, cirurgia ou qualidade de pele?', 'financeiro', 50),
  ('Paciente de fora', 'Recebemos pacientes de outras cidades e também do exterior. O primeiro passo é entender o seu caso para organizar a melhor forma de avaliação. Você mora em qual cidade?', 'logistica', 60),
  ('Pedir foto/histórico', 'Pra te ajudar melhor, você pode me contar um pouco do seu histórico? Se puder compartilhar fotos das regiões que te incomodam, isso ajuda bastante na triagem inicial.', 'triagem', 70),
  ('Confirmar agendamento', 'Perfeito! Vou confirmar seu horário com a equipe e te retorno por aqui assim que estiver tudo certo. Qualquer dúvida até lá, é só chamar.', 'agenda', 80),
  ('Encerramento gentil', 'Fico à disposição por aqui. Qualquer dúvida, pode me chamar quando quiser — sem pressa nenhuma.', 'geral', 90)
ON CONFLICT DO NOTHING;
