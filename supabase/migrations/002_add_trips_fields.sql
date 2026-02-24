-- Add Trips-specific fields to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS data_reuniao_trips TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS como_reuniao_trips TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS pagou_taxa BOOLEAN DEFAULT FALSE;

-- Update monthly_targets constraint to include 'trips'
ALTER TABLE monthly_targets DROP CONSTRAINT IF EXISTS monthly_targets_pipeline_type_check;
ALTER TABLE monthly_targets ADD CONSTRAINT monthly_targets_pipeline_type_check
  CHECK (pipeline_type IN ('elopement', 'wedding', 'trips'));

-- Add taxa field to monthly_targets for Trips funnel
ALTER TABLE monthly_targets ADD COLUMN IF NOT EXISTS taxa INTEGER DEFAULT 0;
