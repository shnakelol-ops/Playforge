-- Priority 2: Add notes column and remove category constraint for custom categories
ALTER TABLE plays ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE plays DROP CONSTRAINT IF NOT EXISTS plays_category_check;
