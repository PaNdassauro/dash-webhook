-- ============================================
-- Purge old data - Keep only 2026 deals
-- Run this in Supabase SQL Editor
-- ============================================

-- Check count before delete
SELECT
  EXTRACT(YEAR FROM created_at) as year,
  COUNT(*) as count
FROM deals
GROUP BY EXTRACT(YEAR FROM created_at)
ORDER BY year;

-- Delete all deals before 2026
DELETE FROM deals
WHERE created_at < '2026-01-01'
   OR created_at IS NULL;

-- Verify after delete
SELECT COUNT(*) as remaining_deals FROM deals;
