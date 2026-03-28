CREATE TABLE press_schemas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  sport           TEXT NOT NULL CHECK (sport IN ('gaa','hurling','soccer')),
  zone_config     JSONB NOT NULL DEFAULT '{}',
  player_roles    JSONB NOT NULL DEFAULT '{}',
  active_triggers JSONB NOT NULL DEFAULT '[]',
  press_phases    JSONB NOT NULL DEFAULT '[]',
  post_press      JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE press_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own schemas" ON press_schemas
  FOR ALL
  USING (auth.uid() = user_id);
