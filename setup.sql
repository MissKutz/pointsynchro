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

-- Dictionnaire d'enfants pour le jeu de mots aléatoires
CREATE TABLE IF NOT EXISTS dico_enfants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mot TEXT NOT NULL,
  definition TEXT,
  age_min INTEGER,
  age_max INTEGER,
  theme TEXT,
  image TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permet les opérations CRUD avec la clé anon
ALTER TABLE dico_enfants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les mots" ON dico_enfants
  FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut insérer un mot" ON dico_enfants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tout le monde peut modifier un mot" ON dico_enfants
  FOR UPDATE USING (true);

CREATE POLICY "Tout le monde peut supprimer un mot" ON dico_enfants
  FOR DELETE USING (true);
