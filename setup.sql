-- Exécute ce script dans le SQL Editor du Dashboard Supabase
-- https://supabase.com/dashboard/project/kzdahrsvfqyqfqiruqzh/sql/new

CREATE TABLE IF NOT EXISTS participants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  surnom TEXT,
  present BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permet les opérations CRUD avec la clé anon
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut insérer" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tout le monde peut modifier" ON participants
  FOR UPDATE USING (true);
