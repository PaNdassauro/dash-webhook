-- Add MQL column for WW funnel (field 83: Motivos de qualificação SDR)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS motivos_qualificacao_sdr TEXT;
