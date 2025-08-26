/*
  # Ajout de la table des constats

  1. Table
    - `findings`
      - `id` (uuid, clé primaire)
      - `mission_id` (uuid, clé étrangère vers missions)
      - `type` (enum, type de constat)
      - `description` (text, description du constat)
      - `reference_legale` (text, référence légale)
      - `recommandation` (text, recommandation)
      - `delai_correction` (integer, délai de correction en jours)
      - `date_constat` (date, date du constat)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Activation RLS
    - Politiques pour l'accès anonyme
*/

-- Type enum pour les constats
CREATE TYPE finding_type AS ENUM (
  'NON_CONFORMITE_MAJEURE',
  'NON_CONFORMITE_MINEURE',
  'OBSERVATION',
  'POINT_CONFORME'
);

-- Table des constats
CREATE TABLE findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  type finding_type NOT NULL,
  description text NOT NULL,
  reference_legale text,
  recommandation text,
  delai_correction integer,
  date_constat date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- Politiques pour les constats (accès anonyme)
CREATE POLICY "Tout le monde peut lire les constats"
  ON findings FOR SELECT TO anon USING (true);

CREATE POLICY "Tout le monde peut créer des constats"
  ON findings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Tout le monde peut modifier les constats"
  ON findings FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Tout le monde peut supprimer les constats"
  ON findings FOR DELETE TO anon USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_findings_updated_at
  BEFORE UPDATE ON findings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 