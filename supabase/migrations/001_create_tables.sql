-- ============================================
-- Welcome Weddings Dashboard - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Deals table (main data from Active Campaign)
CREATE TABLE IF NOT EXISTS deals (
  id BIGINT PRIMARY KEY,
  title TEXT,
  pipeline TEXT,
  stage TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  nome_noivo TEXT,
  num_convidados INTEGER,
  orcamento DECIMAL(12,2),
  destino TEXT,
  motivo_perda TEXT,
  data_reuniao_1 TIMESTAMPTZ,
  como_reuniao_1 TEXT,
  qualificado_sql BOOLEAN DEFAULT FALSE,
  data_closer TIMESTAMPTZ,
  reuniao_closer TEXT,
  data_fechamento TIMESTAMPTZ,
  is_elopement BOOLEAN GENERATED ALWAYS AS (pipeline = 'Elopment Wedding') STORED
);

-- 2. Monthly targets table
CREATE TABLE IF NOT EXISTS monthly_targets (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL,
  pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('elopement', 'wedding')),
  leads INTEGER DEFAULT 0,
  mql INTEGER DEFAULT 0,
  agendamento INTEGER DEFAULT 0,
  reunioes INTEGER DEFAULT 0,
  qualificado INTEGER DEFAULT 0,
  closer_agendada INTEGER DEFAULT 0,
  closer_realizada INTEGER DEFAULT 0,
  vendas INTEGER DEFAULT 0,
  cpl DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, pipeline_type)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_is_elopement ON deals(is_elopement);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_month ON monthly_targets(month);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_targets ENABLE ROW LEVEL SECURITY;

-- 5. Policies (allow all for now - adjust for production)
CREATE POLICY "Allow all access to deals" ON deals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to monthly_targets" ON monthly_targets
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Apply trigger to monthly_targets
DROP TRIGGER IF EXISTS update_monthly_targets_updated_at ON monthly_targets;
CREATE TRIGGER update_monthly_targets_updated_at
  BEFORE UPDATE ON monthly_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample target data for January 2026
-- ============================================
INSERT INTO monthly_targets (month, pipeline_type, leads, mql, agendamento, reunioes, qualificado, closer_agendada, closer_realizada, vendas, cpl)
VALUES
  ('2026-01-01', 'wedding', 321, 225, 101, 71, 46, 46, 40, 14, 65.00),
  ('2026-01-01', 'elopement', 200, 0, 0, 0, 0, 0, 0, 15, 50.00)
ON CONFLICT (month, pipeline_type) DO NOTHING;
