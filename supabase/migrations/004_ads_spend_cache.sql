-- ============================================
-- Ads Spend Cache Table
-- Stores daily cached data from Meta Ads and Google Ads
-- ============================================

CREATE TABLE IF NOT EXISTS ads_spend_cache (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('meta_ads', 'google_ads')),
  pipeline TEXT CHECK (pipeline IN ('wedding', 'elopement')),
  spend DECIMAL(12,2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cpc DECIMAL(10,4) DEFAULT 0,
  cpm DECIMAL(10,4) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month, source, pipeline)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ads_spend_cache_lookup
  ON ads_spend_cache(year, month, source, pipeline);

-- Enable RLS
ALTER TABLE ads_spend_cache ENABLE ROW LEVEL SECURITY;

-- Policy (allow all for now)
CREATE POLICY "Allow all access to ads_spend_cache" ON ads_spend_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_ads_spend_cache_updated_at ON ads_spend_cache;
CREATE TRIGGER update_ads_spend_cache_updated_at
  BEFORE UPDATE ON ads_spend_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
