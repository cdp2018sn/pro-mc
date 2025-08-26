/*
  # Création de la table des missions de contrôle

  1. Nouvelle Table
    - `missions`
      - `id` (uuid, clé primaire)
      - `title` (text, titre de la mission)
      - `description` (text, description détaillée)
      - `start_date` (date, date de début)
      - `end_date` (date, date de fin)
      - `status` (enum, statut de la mission)
      - `organization` (text, organisation contrôlée)
      - `address` (text, adresse de l'organisation)
      - `team_members` (array, membres de l'équipe)
      - `objectives` (array, objectifs de la mission)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Activation RLS
    - Politique pour l'accès anonyme
*/

-- Création des types énumérés
CREATE TYPE mission_status AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');
CREATE TYPE mission_type AS ENUM ('Contrôle sur place', 'Contrôle sur pièces', 'Contrôle en ligne');
CREATE TYPE finding_type AS ENUM ('NON_CONFORMITE_MAJEURE', 'NON_CONFORMITE_MINEURE', 'OBSERVATION', 'POINT_CONFORME');
CREATE TYPE sanction_type AS ENUM ('AVERTISSEMENT', 'MISE_EN_DEMEURE', 'AMENDE', 'INJONCTION', 'RESTRICTION_TRAITEMENT');

-- Création de la table missions
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type_mission mission_type NOT NULL,
    organization TEXT NOT NULL,
    address TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status mission_status NOT NULL,
    motif_controle TEXT NOT NULL,
    decision_numero TEXT,
    date_decision DATE,
    team_members TEXT[] DEFAULT '{}',
    objectives TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table findings (constats)
CREATE TABLE IF NOT EXISTS public.findings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    type finding_type NOT NULL,
    description TEXT NOT NULL,
    reference_legale TEXT,
    recommandation TEXT,
    delai_correction INTEGER,
    date_constat DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table remarks (remarques)
CREATE TABLE IF NOT EXISTS public.remarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table sanctions
CREATE TABLE IF NOT EXISTS public.sanctions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    type sanction_type NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2),
    decision_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création des triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at
    BEFORE UPDATE ON public.findings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remarks_updated_at
    BEFORE UPDATE ON public.remarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sanctions_updated_at
    BEFORE UPDATE ON public.sanctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Configuration des politiques de sécurité (RLS)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table missions
CREATE POLICY "Enable read access for all users" ON public.missions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.missions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.missions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.missions
    FOR DELETE USING (true);

-- Politiques pour la table findings
CREATE POLICY "Enable read access for all users" ON public.findings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.findings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.findings
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.findings
    FOR DELETE USING (true);

-- Politiques pour la table remarks
CREATE POLICY "Enable read access for all users" ON public.remarks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.remarks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.remarks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.remarks
    FOR DELETE USING (true);

-- Politiques pour la table sanctions
CREATE POLICY "Enable read access for all users" ON public.sanctions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.sanctions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.sanctions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.sanctions
    FOR DELETE USING (true);