-- Script d'initialisation de la base de données PostgreSQL pour CDP Missions

-- Créer la base de données si elle n'existe pas
-- (À exécuter manuellement : CREATE DATABASE cdp_missions;)

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    department VARCHAR(255),
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Table des missions
CREATE TABLE IF NOT EXISTS missions (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    budget DECIMAL(10,2),
    ignore_auto_status_change BOOLEAN DEFAULT false,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- Table des constatations
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- Table des sanctions
CREATE TABLE IF NOT EXISTS sanctions (
    id VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- Table des remarques
CREATE TABLE IF NOT EXISTS remarks (
    id VARCHAR(255) PRIMARY KEY,
    mission_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_assigned_to ON missions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id);
CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'administrateur par défaut
INSERT INTO users (id, email, name, role, is_active, department, password_hash, created_at)
VALUES (
    'admin-1',
    'abdoulaye.niang@cdp.sn',
    'Abdoulaye Niang',
    'admin',
    true,
    'Direction',
    'UGFzc2Vy', -- 'Passer' encodé en base64
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Insérer quelques missions de test
INSERT INTO missions (id, title, description, status, priority, created_by, created_at)
VALUES 
    ('mission-1', 'Audit Financier Q1 2024', 'Audit financier du premier trimestre 2024', 'in_progress', 'high', 'admin-1', CURRENT_TIMESTAMP),
    ('mission-2', 'Contrôle Qualité Produits', 'Contrôle qualité des produits manufacturés', 'pending', 'medium', 'admin-1', CURRENT_TIMESTAMP),
    ('mission-3', 'Inspection Sécurité', 'Inspection des mesures de sécurité', 'completed', 'low', 'admin-1', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques constatations de test
INSERT INTO findings (id, mission_id, description, severity, status, created_at)
VALUES 
    ('finding-1', 'mission-1', 'Anomalie dans les comptes fournisseurs', 'high', 'open', CURRENT_TIMESTAMP),
    ('finding-2', 'mission-2', 'Non-conformité dans le processus de fabrication', 'medium', 'open', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insérer quelques remarques de test
INSERT INTO remarks (id, mission_id, content, author_id, created_at)
VALUES 
    ('remark-1', 'mission-1', 'Audit en cours de finalisation', 'admin-1', CURRENT_TIMESTAMP),
    ('remark-2', 'mission-2', 'Contrôle qualité programmé pour la semaine prochaine', 'admin-1', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Afficher un message de confirmation
SELECT 'Base de données CDP Missions initialisée avec succès!' as message;
