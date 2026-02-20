-- Add Qualificado date column (Automático - WW - Data Qualificação SDR)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS data_qualificado TIMESTAMPTZ;
