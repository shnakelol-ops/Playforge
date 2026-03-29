-- Store custom player names with each saved play
ALTER TABLE plays ADD COLUMN IF NOT EXISTS player_names JSONB DEFAULT '{}';
