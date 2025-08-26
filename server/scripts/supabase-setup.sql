-- Configuration Supabase pour CDP Missions
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Création des tables

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'controller', 'viewer', 'user')),
  department VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  controller_name VARCHAR(255) NOT NULL,
  entity_controlled VARCHAR(255) NOT NULL,
  mission_type VARCHAR(100) NOT NULL,
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL CHECK (type IN ('RAPPORT_CONTROLE', 'LETTRE_NOTIFICATION', 'LETTRE_REPONSE', 'AUTRE', 'LETTRE_DECISION', 'LETTRE_PROCUREUR', 'NOTIFICATION_RECU')),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(500),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des constatations
CREATE TABLE IF NOT EXISTS findings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('OUVERT', 'EN_COURS', 'RESOLU', 'FERME')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des sanctions
CREATE TABLE IF NOT EXISTS sanctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2),
  status VARCHAR(50) NOT NULL CHECK (status IN ('PROPOSEE', 'APPLIQUEE', 'ANNULEE')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des remarques
CREATE TABLE IF NOT EXISTS remarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_start_date ON missions(start_date);
CREATE INDEX IF NOT EXISTS idx_missions_end_date ON missions(end_date);
CREATE INDEX IF NOT EXISTS idx_missions_controller ON missions(controller_name);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id);

-- 3. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Politiques de sécurité RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Only admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour la table missions
CREATE POLICY "View missions based on role" ON missions
  FOR SELECT USING (
    -- Admins et supervisors voient toutes les missions
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'viewer')
    )
    OR
    -- Controllers voient seulement leurs missions
    (created_by = auth.uid() AND 
     EXISTS (
       SELECT 1 FROM users 
       WHERE id = auth.uid() AND role = 'controller'
     ))
  );

CREATE POLICY "Create missions with permission" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role IN ('admin', 'supervisor') OR 
       (role = 'controller' AND created_by = auth.uid()))
    )
  );

CREATE POLICY "Update missions with permission" ON missions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role IN ('admin', 'supervisor') OR 
       (role = 'controller' AND created_by = auth.uid()))
    )
  );

CREATE POLICY "Delete missions with permission" ON missions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (role IN ('supervisor', 'controller') AND created_by = auth.uid()))
    )
  );

-- Politiques pour les autres tables (similaires)
CREATE POLICY "View related data" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

CREATE POLICY "Manage related data" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

-- Appliquer les mêmes politiques aux autres tables
CREATE POLICY "View findings" ON findings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor', 'viewer') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

CREATE POLICY "Manage findings" ON findings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

CREATE POLICY "View sanctions" ON sanctions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor', 'viewer') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

CREATE POLICY "Manage sanctions" ON sanctions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

CREATE POLICY "View remarks" ON remarks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor', 'viewer') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

CREATE POLICY "Manage remarks" ON remarks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN users u ON u.id = auth.uid()
    WHERE m.id = mission_id AND
    (u.role IN ('admin', 'supervisor') OR
     (u.role = 'controller' AND m.created_by = auth.uid()))
  )
);

-- 5. Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, is_active, permissions)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Nouvel utilisateur'),
    'user',
    true,
    '{"canCreateMissions": false, "canEditMissions": false, "canDeleteMissions": false, "canViewAllMissions": false, "canImportMissions": false, "canManageUsers": false, "canViewReports": false, "canEditReports": false, "canManageDocuments": false, "canChangeStatus": false, "canViewDebug": false}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Insérer l'utilisateur administrateur par défaut
INSERT INTO users (id, email, name, role, is_active, permissions)
VALUES (
  gen_random_uuid(),
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}'
) ON CONFLICT (email) DO NOTHING;

-- 7. Données de test
INSERT INTO missions (reference, title, description, status, start_date, end_date, location, controller_name, entity_controlled, mission_type, priority)
VALUES 
  ('MC-2024-001', 'Contrôle de la Direction Générale des Impôts', 'Audit de la gestion fiscale et des procédures de recouvrement', 'EN_COURS', '2024-01-15', '2024-02-15', 'Dakar, Sénégal', 'Mamadou Diallo', 'Direction Générale des Impôts', 'Audit Financier', 'HAUTE'),
  ('MC-2024-002', 'Vérification de la Caisse de Sécurité Sociale', 'Contrôle des prestations sociales et de la gestion des cotisations', 'PLANIFIEE', '2024-03-01', '2024-04-01', 'Thiès, Sénégal', 'Fatou Sall', 'Caisse de Sécurité Sociale', 'Contrôle Social', 'MOYENNE'),
  ('MC-2024-003', 'Audit de l''Agence de Développement Municipal', 'Évaluation de la gestion des projets de développement local', 'TERMINEE', '2023-11-01', '2023-12-15', 'Saint-Louis, Sénégal', 'Ousmane Ba', 'Agence de Développement Municipal', 'Audit de Performance', 'BASSE')
ON CONFLICT (reference) DO NOTHING;
