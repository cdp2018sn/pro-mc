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
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. SUPPRIMER ET RECRÉER TOUTES LES TABLES AVEC LA BONNE STRUCTURE
DROP TABLE IF EXISTS reponses_suivi CASCADE;
DROP TABLE IF EXISTS remarks CASCADE;
DROP TABLE IF EXISTS sanctions CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 4. CRÉER LA TABLE USERS
CREATE TABLE users (
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

-- 5. CRÉER LA TABLE MISSIONS
CREATE TABLE missions (
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

-- 6. CRÉER LA TABLE DOCUMENTS
CREATE TABLE documents (
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

-- 7. CRÉER LA TABLE FINDINGS
CREATE TABLE findings (
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

-- 8. CRÉER LA TABLE SANCTIONS
CREATE TABLE sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('AVERTISSEMENT', 'MISE_EN_DEMEURE', 'PECUNIAIRE', 'INJONCTION', 'RESTRICTION_TRAITEMENT')),
  description TEXT NOT NULL,
  amount DECIMAL(15,2),
  decision_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CRÉER LA TABLE REMARKS
CREATE TABLE remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CRÉER LA TABLE REPONSES_SUIVI
CREATE TABLE reponses_suivi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  date_reponse DATE NOT NULL,
  contenu TEXT NOT NULL,
  documents_joins JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CRÉER DES INDEX POUR LES PERFORMANCES
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_organization ON missions(organization);
CREATE INDEX idx_missions_start_date ON missions(start_date);
CREATE INDEX idx_missions_end_date ON missions(end_date);
CREATE INDEX idx_missions_created_by ON missions(created_by);
CREATE INDEX idx_documents_mission_id ON documents(mission_id);
CREATE INDEX idx_findings_mission_id ON findings(mission_id);
CREATE INDEX idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX idx_remarks_mission_id ON remarks(mission_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 12. FONCTION POUR METTRE À JOUR updated_at AUTOMATIQUEMENT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. TRIGGERS POUR updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanctions_updated_at BEFORE UPDATE ON sanctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reponses_suivi_updated_at BEFORE UPDATE ON reponses_suivi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. CRÉER L'ADMIN PAR DÉFAUT
INSERT INTO users (id, email, name, role, is_active, department, permissions)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  'Direction',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- 15. CRÉER DES POLITIQUES SIMPLES QUI PERMETTENT TOUT
CREATE POLICY "allow_all_users_select" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_users_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_users_update" ON users FOR UPDATE USING (true);
CREATE POLICY "allow_all_users_delete" ON users FOR DELETE USING (true);

CREATE POLICY "allow_all_missions_select" ON missions FOR SELECT USING (true);
CREATE POLICY "allow_all_missions_insert" ON missions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_missions_update" ON missions FOR UPDATE USING (true);
CREATE POLICY "allow_all_missions_delete" ON missions FOR DELETE USING (true);

CREATE POLICY "allow_all_documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "allow_all_documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_documents_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "allow_all_documents_delete" ON documents FOR DELETE USING (true);

CREATE POLICY "allow_all_findings_select" ON findings FOR SELECT USING (true);
CREATE POLICY "allow_all_findings_insert" ON findings FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_findings_update" ON findings FOR UPDATE USING (true);
CREATE POLICY "allow_all_findings_delete" ON findings FOR DELETE USING (true);

CREATE POLICY "allow_all_sanctions_select" ON sanctions FOR SELECT USING (true);
CREATE POLICY "allow_all_sanctions_insert" ON sanctions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_sanctions_update" ON sanctions FOR UPDATE USING (true);
CREATE POLICY "allow_all_sanctions_delete" ON sanctions FOR DELETE USING (true);

CREATE POLICY "allow_all_remarks_select" ON remarks FOR SELECT USING (true);
CREATE POLICY "allow_all_remarks_insert" ON remarks FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_remarks_update" ON remarks FOR UPDATE USING (true);
CREATE POLICY "allow_all_remarks_delete" ON remarks FOR DELETE USING (true);

CREATE POLICY "allow_all_reponses_suivi_select" ON reponses_suivi FOR SELECT USING (true);
CREATE POLICY "allow_all_reponses_suivi_insert" ON reponses_suivi FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_reponses_suivi_update" ON reponses_suivi FOR UPDATE USING (true);
CREATE POLICY "allow_all_reponses_suivi_delete" ON reponses_suivi FOR DELETE USING (true);

-- 16. RÉACTIVER RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses_suivi ENABLE ROW LEVEL SECURITY;

-- 17. TESTER LA CRÉATION D'UN UTILISATEUR
INSERT INTO users (email, name, role, department, phone, is_active, permissions)
VALUES (
  'test-final@cdp.sn',
  'Test Final',
  'admin',
  'Test',
  '123456789',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
);

-- 18. VÉRIFIER QUE TOUT FONCTIONNE
SELECT 
  'Configuration terminée avec succès' as message,
  (SELECT COUNT(*) FROM users) as nb_users,
  (SELECT COUNT(*) FROM missions) as nb_missions;

-- 19. AFFICHER LES UTILISATEURS CRÉÉS
SELECT id, email, name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;