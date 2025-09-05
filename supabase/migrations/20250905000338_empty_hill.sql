/*
  # Schéma complet CDP Missions

  1. Nouvelles Tables
    - `users` - Utilisateurs avec authentification
    - `missions` - Missions de contrôle
    - `documents` - Documents liés aux missions
    - `findings` - Constatations des missions
    - `sanctions` - Sanctions appliquées
    - `remarks` - Remarques sur les missions
    - `reponses_suivi` - Suivi des réponses

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès basées sur les rôles
    - Protection des données sensibles

  3. Fonctionnalités
    - Triggers pour updated_at automatique
    - Index pour les performances
    - Contraintes d'intégrité
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Table des missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL CHECK (type IN ('RAPPORT_CONTROLE', 'LETTRE_NOTIFICATION', 'LETTRE_REPONSE', 'LETTRE_DECISION', 'LETTRE_PROCUREUR', 'NOTIFICATION_RECU', 'AUTRE')),
  file_path VARCHAR(500),
  file_content TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des constatations
CREATE TABLE IF NOT EXISTS findings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Table des sanctions
CREATE TABLE IF NOT EXISTS sanctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('AVERTISSEMENT', 'MISE_EN_DEMEURE', 'PECUNIAIRE', 'INJONCTION', 'RESTRICTION_TRAITEMENT')),
  description TEXT NOT NULL,
  amount DECIMAL(15,2),
  decision_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des remarques
CREATE TABLE IF NOT EXISTS remarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réponses de suivi
CREATE TABLE IF NOT EXISTS reponses_suivi (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  date_reponse DATE NOT NULL,
  contenu TEXT NOT NULL,
  documents_joins JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
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

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sanctions_updated_at BEFORE UPDATE ON sanctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reponses_suivi_updated_at BEFORE UPDATE ON reponses_suivi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses_suivi ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les missions
CREATE POLICY "Users can view missions based on role" ON missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role IN ('admin', 'supervisor', 'viewer') OR 
       (role = 'controller' AND created_by = auth.uid()) OR
       (role = 'user' AND assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can create missions" ON missions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'controller')
    )
  );

CREATE POLICY "Users can update missions" ON missions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role IN ('admin', 'supervisor') OR 
       (role = 'controller' AND created_by = auth.uid()))
    )
  );

CREATE POLICY "Users can delete missions" ON missions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND 
      (role = 'admin' OR 
       (role IN ('supervisor', 'controller') AND created_by = auth.uid()))
    )
  );

-- Politiques pour les documents
CREATE POLICY "Users can view documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()) OR
       (u.role = 'user' AND m.assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can manage documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

-- Politiques similaires pour findings, sanctions, remarks, reponses_suivi
CREATE POLICY "Users can view findings" ON findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()) OR
       (u.role = 'user' AND m.assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can manage findings" ON findings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

CREATE POLICY "Users can view sanctions" ON sanctions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()) OR
       (u.role = 'user' AND m.assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can manage sanctions" ON sanctions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

CREATE POLICY "Users can view remarks" ON remarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()) OR
       (u.role = 'user' AND m.assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can manage remarks" ON remarks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

CREATE POLICY "Users can view reponses_suivi" ON reponses_suivi
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor', 'viewer') OR
       (u.role = 'controller' AND m.created_by = auth.uid()) OR
       (u.role = 'user' AND m.assigned_to = auth.uid()))
    )
  );

CREATE POLICY "Users can manage reponses_suivi" ON reponses_suivi
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN users u ON u.id = auth.uid()
      WHERE m.id = mission_id AND
      (u.role IN ('admin', 'supervisor') OR
       (u.role = 'controller' AND m.created_by = auth.uid()))
    )
  );

-- Insérer l'administrateur par défaut
INSERT INTO users (id, email, name, role, is_active, department, permissions, password_hash)
VALUES (
  uuid_generate_v4(),
  'abdoulaye.niang@cdp.sn',
  'Abdoulaye Niang',
  'admin',
  true,
  'Direction',
  '{"canCreateMissions": true, "canEditMissions": true, "canDeleteMissions": true, "canViewAllMissions": true, "canImportMissions": true, "canManageUsers": true, "canViewReports": true, "canEditReports": true, "canManageDocuments": true, "canChangeStatus": true, "canViewDebug": true}',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- Hash pour 'Passer'
) ON CONFLICT (email) DO NOTHING;

-- Insérer des missions de test
INSERT INTO missions (reference, title, description, type_mission, organization, address, start_date, end_date, status, motif_controle, decision_numero, date_decision, team_members, objectives, created_by)
VALUES 
  ('MC-2024-001', 'Contrôle RGPD - Banque Atlantique', 'Contrôle de conformité au RGPD des traitements de données personnelles', 'Contrôle sur place', 'Banque Atlantique', 'Avenue Léopold Sédar Senghor, Dakar', '2024-01-15', '2024-02-15', 'EN_COURS', 'Programme annuel', 'DEC-2024-001', '2024-01-01', '["Mamadou Diallo", "Fatou Sall"]', '["Vérifier la conformité RGPD", "Contrôler les mesures de sécurité"]', (SELECT id FROM users WHERE email = 'abdoulaye.niang@cdp.sn')),
  ('MC-2024-002', 'Audit SONATEL - Protection des données', 'Audit complet des mesures de protection des données personnelles', 'Contrôle sur place', 'SONATEL', 'Route des Almadies, Dakar', '2024-02-01', '2024-03-01', 'PLANIFIEE', 'Suite a une plainte', 'DEC-2024-002', '2024-01-15', '["Aissatou Diop", "Ousmane Ba"]', '["Analyser les procédures", "Évaluer la conformité"]', (SELECT id FROM users WHERE email = 'abdoulaye.niang@cdp.sn')),
  ('MC-2024-003', 'Contrôle Hôpital Principal - Données santé', 'Contrôle du traitement des données de santé des patients', 'Contrôle sur place', 'Hôpital Principal de Dakar', 'Avenue Nelson Mandela, Dakar', '2023-12-01', '2023-12-31', 'TERMINEE', 'Decision de la session pleniere', 'DEC-2023-015', '2023-11-15', '["Khadija Ndiaye", "Moussa Fall"]', '["Contrôler les données santé", "Vérifier la sécurité"]', (SELECT id FROM users WHERE email = 'abdoulaye.niang@cdp.sn'))
ON CONFLICT (reference) DO NOTHING;