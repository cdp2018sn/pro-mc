/*
  # Configuration complète de la base de données CDP Missions

  1. Nouvelles Tables
    - `users` - Gestion des utilisateurs avec authentification
    - `missions` - Missions de contrôle avec tous les champs requis
    - `documents` - Documents liés aux missions
    - `findings` - Constatations et manquements
    - `sanctions` - Sanctions appliquées
    - `remarks` - Remarques et commentaires
    - `reponses_suivi` - Suivi des réponses

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès simplifiées pour permettre toutes les opérations
    - Fonction d'authentification sécurisée

  3. Fonctions
    - Fonction de hachage et création d'utilisateur
    - Fonction d'authentification
    - Triggers pour mise à jour automatique des timestamps
*/

-- Supprimer les tables existantes si elles existent (ordre important pour les contraintes)
DROP TABLE IF EXISTS reponses_suivi CASCADE;
DROP TABLE IF EXISTS remarks CASCADE;
DROP TABLE IF EXISTS sanctions CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS hash_and_insert_user(text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS authenticate_user(text, text) CASCADE;

-- 1. Table des utilisateurs
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email character varying(255) UNIQUE NOT NULL,
  name character varying(255) NOT NULL,
  role character varying(50) NOT NULL DEFAULT 'user',
  department character varying(255),
  phone character varying(50),
  is_active boolean DEFAULT true,
  permissions jsonb DEFAULT '{}'::jsonb,
  password_hash character varying(255),
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Table des missions
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference character varying(100) UNIQUE NOT NULL,
  title character varying(500) NOT NULL,
  description text,
  type_mission character varying(100) NOT NULL,
  organization character varying(255) NOT NULL,
  address text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status character varying(50) NOT NULL,
  motif_controle character varying(100) NOT NULL,
  decision_numero character varying(100) NOT NULL,
  date_decision date NOT NULL,
  team_members jsonb DEFAULT '[]'::jsonb,
  objectives jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  ignore_auto_status_change boolean DEFAULT false,
  reponse_recue boolean DEFAULT false,
  date_derniere_reponse date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Table des documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  title character varying(255) NOT NULL,
  type character varying(100) NOT NULL,
  file_path character varying(500),
  file_content text,
  file_name character varying(255),
  file_size integer,
  file_type character varying(100),
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Table des constatations
CREATE TABLE findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  type character varying(50) NOT NULL,
  description text NOT NULL,
  reference_legale character varying(255),
  recommandation text,
  delai_correction integer,
  date_constat date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Table des sanctions
CREATE TABLE sanctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  type character varying(50) NOT NULL,
  description text NOT NULL,
  amount numeric(15,2),
  decision_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Table des remarques
CREATE TABLE remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_name character varying(255),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 7. Table des réponses de suivi
CREATE TABLE reponses_suivi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  date_reponse date NOT NULL,
  contenu text NOT NULL,
  documents_joins jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_reference ON missions(reference);
CREATE INDEX idx_missions_organization ON missions(organization);
CREATE INDEX idx_missions_start_date ON missions(start_date);
CREATE INDEX idx_missions_end_date ON missions(end_date);
CREATE INDEX idx_documents_mission_id ON documents(mission_id);
CREATE INDEX idx_findings_mission_id ON findings(mission_id);
CREATE INDEX idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX idx_remarks_mission_id ON remarks(mission_id);
CREATE INDEX idx_reponses_suivi_mission_id ON reponses_suivi(mission_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sanctions_updated_at BEFORE UPDATE ON sanctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reponses_suivi_updated_at BEFORE UPDATE ON reponses_suivi
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un utilisateur avec hachage sécurisé
CREATE OR REPLACE FUNCTION hash_and_insert_user(
  p_email text,
  p_name text,
  p_role text,
  p_password text,
  p_department text DEFAULT '',
  p_phone text DEFAULT ''
)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  user_name text,
  user_role text,
  is_active boolean
) AS $$
DECLARE
  new_user_id uuid;
  hashed_password text;
BEGIN
  -- Générer un nouvel UUID
  new_user_id := gen_random_uuid();
  
  -- Hacher le mot de passe (simple pour la démo)
  hashed_password := encode(digest(p_password || 'salt', 'sha256'), 'hex');
  
  -- Insérer l'utilisateur
  INSERT INTO users (
    id, email, name, role, department, phone, 
    is_active, password_hash, permissions, created_at, updated_at
  ) VALUES (
    new_user_id, p_email, p_name, p_role, p_department, p_phone,
    true, hashed_password, 
    CASE p_role
      WHEN 'admin' THEN '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'::jsonb
      WHEN 'supervisor' THEN '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": false, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": false, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": false}'::jsonb
      ELSE '{"canCreateMissions": false, "canEditMissions": false, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": false, "canEditReports": false, "canManageDocuments": false, "canChangeStatus": false, "canViewDebug": false}'::jsonb
    END,
    now(), now()
  );
  
  -- Retourner les informations de l'utilisateur créé
  RETURN QUERY SELECT new_user_id, p_email, p_name, p_role, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction d'authentification sécurisée
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email text,
  user_password text
)
RETURNS TABLE(
  user_id uuid,
  user_email text,
  user_name text,
  user_role text,
  user_permissions jsonb,
  is_active boolean,
  department text,
  phone text
) AS $$
DECLARE
  stored_hash text;
  input_hash text;
BEGIN
  -- Récupérer le hash stocké
  SELECT password_hash INTO stored_hash
  FROM users u
  WHERE u.email = user_email AND u.is_active = true;
  
  -- Si aucun utilisateur trouvé
  IF stored_hash IS NULL THEN
    RETURN;
  END IF;
  
  -- Calculer le hash du mot de passe fourni
  input_hash := encode(digest(user_password || 'salt', 'sha256'), 'hex');
  
  -- Vérifier si les hash correspondent
  IF stored_hash = input_hash THEN
    -- Mettre à jour la dernière connexion
    UPDATE users SET last_login = now(), updated_at = now()
    WHERE email = user_email;
    
    -- Retourner les informations de l'utilisateur
    RETURN QUERY 
    SELECT u.id, u.email, u.name, u.role, u.permissions, u.is_active, u.department, u.phone
    FROM users u
    WHERE u.email = user_email;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses_suivi ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simplifiées (accès complet pour tous)
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

-- Créer l'utilisateur administrateur par défaut
INSERT INTO users (id, email, name, role, department, phone, is_active, permissions, password_hash, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  'Direction',
  '',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  encode(digest('Passer' || 'salt', 'sha256'), 'hex'),
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Créer quelques utilisateurs de test
INSERT INTO users (email, name, role, department, is_active, permissions, password_hash)
VALUES 
  ('inspecteur1@cdp.sn', 'Mamadou Diallo', 'controller', 'Contrôle', true, '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": false, "canEditReports": false, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": false}', encode(digest('password123' || 'salt', 'sha256'), 'hex')),
  ('superviseur@cdp.sn', 'Fatou Sall', 'supervisor', 'Supervision', true, '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": false, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": false, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": false}', encode(digest('password123' || 'salt', 'sha256'), 'hex'))
ON CONFLICT (email) DO NOTHING;

-- Vérifier la création
SELECT 
  'Configuration terminée avec succès' as message,
  'nb_users: ' || count(*) as nb_users
FROM users;