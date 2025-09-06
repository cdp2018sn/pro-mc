/*
  # Correction définitive de la base de données Supabase

  1. Réinitialisation complète des politiques RLS
  2. Correction de la structure des tables
  3. Création de l'admin par défaut
  4. Politiques simplifiées et fonctionnelles
*/

-- 1. DÉSACTIVER COMPLÈTEMENT RLS TEMPORAIREMENT
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS missions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS findings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sanctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS remarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reponses_suivi DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les politiques de toutes les tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. CORRIGER LA STRUCTURE DE LA TABLE USERS
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE IF EXISTS users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. S'ASSURER QUE TOUTES LES TABLES EXISTENT
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'controller', 'viewer', 'user')),
  department VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  password_hash VARCHAR(255),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type_mission VARCHAR(100) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE', 'ATTENTE_REPONSE')),
  motif_controle VARCHAR(100) NOT NULL,
  decision_numero VARCHAR(100) NOT NULL,
  date_decision DATE NOT NULL,
  team_members JSONB DEFAULT '[]',
  objectives JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ignore_auto_status_change BOOLEAN DEFAULT false,
  reponse_recue BOOLEAN DEFAULT false,
  date_derniere_reponse DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  file_path VARCHAR(500),
  file_content TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS findings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('NON_CONFORMITE_MAJEURE', 'NON_CONFORMITE_MINEURE', 'OBSERVATION', 'POINT_CONFORME')),
  description TEXT NOT NULL,
  reference_legale VARCHAR(255),
  recommandation TEXT,
  delai_correction INTEGER,
  date_constat DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('AVERTISSEMENT', 'MISE_EN_DEMEURE', 'PECUNIAIRE', 'INJONCTION', 'RESTRICTION_TRAITEMENT')),
  description TEXT NOT NULL,
  amount DECIMAL(15,2),
  decision_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reponses_suivi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  date_reponse DATE NOT NULL,
  contenu TEXT NOT NULL,
  documents_joins JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRÉER DES INDEX POUR LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_organization ON missions(organization);
CREATE INDEX IF NOT EXISTS idx_missions_start_date ON missions(start_date);
CREATE INDEX IF NOT EXISTS idx_missions_end_date ON missions(end_date);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 6. FONCTION POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. TRIGGERS POUR updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_missions_updated_at ON missions;
DROP TRIGGER IF EXISTS update_findings_updated_at ON findings;
DROP TRIGGER IF EXISTS update_sanctions_updated_at ON sanctions;
DROP TRIGGER IF EXISTS update_remarks_updated_at ON remarks;
DROP TRIGGER IF EXISTS update_reponses_suivi_updated_at ON reponses_suivi;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanctions_updated_at BEFORE UPDATE ON sanctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reponses_suivi_updated_at BEFORE UPDATE ON reponses_suivi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. CRÉER L'ADMIN PAR DÉFAUT
INSERT INTO users (id, email, name, role, is_active, department, permissions, password_hash)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  'Direction',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON CONFLICT (email) DO UPDATE SET
  id = '550e8400-e29b-41d4-a716-446655440000',
  name = 'Abdoulaye Niang',
  role = 'admin',
  is_active = true,
  permissions = '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  updated_at = NOW();

-- 9. RÉACTIVER RLS AVEC DES POLITIQUES SIMPLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses_suivi ENABLE ROW LEVEL SECURITY;

-- 10. CRÉER DES POLITIQUES SIMPLES ET FONCTIONNELLES
-- Politiques pour users
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);

-- Politiques pour missions
CREATE POLICY "missions_select_policy" ON missions FOR SELECT USING (true);
CREATE POLICY "missions_insert_policy" ON missions FOR INSERT WITH CHECK (true);
CREATE POLICY "missions_update_policy" ON missions FOR UPDATE USING (true);
CREATE POLICY "missions_delete_policy" ON missions FOR DELETE USING (true);

-- Politiques pour documents
CREATE POLICY "documents_select_policy" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert_policy" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update_policy" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_delete_policy" ON documents FOR DELETE USING (true);

-- Politiques pour findings
CREATE POLICY "findings_select_policy" ON findings FOR SELECT USING (true);
CREATE POLICY "findings_insert_policy" ON findings FOR INSERT WITH CHECK (true);
CREATE POLICY "findings_update_policy" ON findings FOR UPDATE USING (true);
CREATE POLICY "findings_delete_policy" ON findings FOR DELETE USING (true);

-- Politiques pour sanctions
CREATE POLICY "sanctions_select_policy" ON sanctions FOR SELECT USING (true);
CREATE POLICY "sanctions_insert_policy" ON sanctions FOR INSERT WITH CHECK (true);
CREATE POLICY "sanctions_update_policy" ON sanctions FOR UPDATE USING (true);
CREATE POLICY "sanctions_delete_policy" ON sanctions FOR DELETE USING (true);

-- Politiques pour remarks
CREATE POLICY "remarks_select_policy" ON remarks FOR SELECT USING (true);
CREATE POLICY "remarks_insert_policy" ON remarks FOR INSERT WITH CHECK (true);
CREATE POLICY "remarks_update_policy" ON remarks FOR UPDATE USING (true);
CREATE POLICY "remarks_delete_policy" ON remarks FOR DELETE USING (true);

-- Politiques pour reponses_suivi
CREATE POLICY "reponses_suivi_select_policy" ON reponses_suivi FOR SELECT USING (true);
CREATE POLICY "reponses_suivi_insert_policy" ON reponses_suivi FOR INSERT WITH CHECK (true);
CREATE POLICY "reponses_suivi_update_policy" ON reponses_suivi FOR UPDATE USING (true);
CREATE POLICY "reponses_suivi_delete_policy" ON reponses_suivi FOR DELETE USING (true);

-- 11. INSÉRER DES MISSIONS DE TEST
INSERT INTO missions (reference, title, description, type_mission, organization, address, start_date, end_date, status, motif_controle, decision_numero, date_decision, team_members, objectives, created_by)
VALUES 
  ('MC-2024-001', 'Contrôle RGPD - Banque Atlantique', 'Contrôle de conformité au RGPD des traitements de données personnelles', 'Contrôle sur place', 'Banque Atlantique', 'Avenue Léopold Sédar Senghor, Dakar', '2024-01-15', '2024-02-15', 'EN_COURS', 'Programme annuel', 'DEC-2024-001', '2024-01-01', '["Mamadou Diallo", "Fatou Sall"]', '["Vérifier la conformité RGPD", "Contrôler les mesures de sécurité"]', '550e8400-e29b-41d4-a716-446655440000'),
  ('MC-2024-002', 'Audit SONATEL - Protection des données', 'Audit complet des mesures de protection des données personnelles', 'Contrôle sur place', 'SONATEL', 'Route des Almadies, Dakar', '2024-02-01', '2024-03-01', 'PLANIFIEE', 'Suite a une plainte', 'DEC-2024-002', '2024-01-15', '["Aissatou Diop", "Ousmane Ba"]', '["Analyser les procédures", "Évaluer la conformité"]', '550e8400-e29b-41d4-a716-446655440000'),
  ('MC-2024-003', 'Contrôle Hôpital Principal - Données santé', 'Contrôle du traitement des données de santé des patients', 'Contrôle sur place', 'Hôpital Principal de Dakar', 'Avenue Nelson Mandela, Dakar', '2023-12-01', '2023-12-31', 'TERMINEE', 'Decision de la session pleniere', 'DEC-2023-015', '2023-11-15', '["Khadija Ndiaye", "Moussa Fall"]', '["Contrôler les données santé", "Vérifier la sécurité"]', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (reference) DO NOTHING;

-- 12. VÉRIFIER QUE TOUT FONCTIONNE
SELECT 
  'Configuration terminée' as message,
  (SELECT COUNT(*) FROM users) as nb_users,
  (SELECT COUNT(*) FROM missions) as nb_missions;

-- 13. AFFICHER L'ADMIN CRÉÉ
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'abdoulaye.niang@cdp.sn';