import { pool } from '../config/database.js';

const createTables = async () => {
  try {
    console.log('🔄 Création des tables PostgreSQL...');

    // Table des utilisateurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'supervisor', 'controller', 'viewer', 'user')),
        password VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        phone VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des missions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des documents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL CHECK (type IN ('RAPPORT_CONTROLE', 'LETTRE_NOTIFICATION', 'LETTRE_REPONSE', 'AUTRE', 'LETTRE_DECISION', 'LETTRE_PROCUREUR', 'NOTIFICATION_RECU')),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        file_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des constatations (findings)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS findings (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        severity VARCHAR(50) NOT NULL CHECK (severity IN ('FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE')),
        status VARCHAR(50) NOT NULL CHECK (status IN ('OUVERT', 'EN_COURS', 'RESOLU', 'FERME')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des sanctions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sanctions (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(15,2),
        status VARCHAR(50) NOT NULL CHECK (status IN ('PROPOSEE', 'APPLIQUEE', 'ANNULEE')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des remarques
    await pool.query(`
      CREATE TABLE IF NOT EXISTS remarks (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Index pour améliorer les performances
    await pool.query('CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_missions_start_date ON missions(start_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_missions_end_date ON missions(end_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_missions_controller ON missions(controller_name)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id)');

    console.log('✅ Tables créées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await createTables();
    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
