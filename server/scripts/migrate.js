const { pool } = require('../config/database');

// Script de migration pour créer toutes les tables
async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la migration PostgreSQL...');
    
    // Table des utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        department VARCHAR(255),
        phone VARCHAR(50),
        password_hash VARCHAR(255),
        permissions JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);
    console.log('✅ Table users créée');

    // Assurer la présence de la colonne permissions si la table existait déjà
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'permissions'
        ) THEN
          ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
        END IF;
      END
      $$;
    `);
    console.log('✅ Colonne permissions assurée sur users');

    // Table des missions
    await client.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        created_by VARCHAR(50) REFERENCES users(id),
        assigned_to VARCHAR(50) REFERENCES users(id),
        start_date DATE,
        end_date DATE,
        location VARCHAR(255),
        budget DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table missions créée');

    // Table des documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        mission_id VARCHAR(50) REFERENCES missions(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(500),
        file_type VARCHAR(100),
        file_size INTEGER,
        uploaded_by VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table documents créée');

    // Table des constatations (findings)
    await client.query(`
      CREATE TABLE IF NOT EXISTS findings (
        id VARCHAR(50) PRIMARY KEY,
        mission_id VARCHAR(50) REFERENCES missions(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'open',
        created_by VARCHAR(50) REFERENCES users(id),
        assigned_to VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table findings créée');

    // Table des sanctions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sanctions (
        id VARCHAR(50) PRIMARY KEY,
        mission_id VARCHAR(50) REFERENCES missions(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100),
        amount DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        created_by VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table sanctions créée');

    // Table des remarques
    await client.query(`
      CREATE TABLE IF NOT EXISTS remarks (
        id VARCHAR(50) PRIMARY KEY,
        mission_id VARCHAR(50) REFERENCES missions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_by VARCHAR(50) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table remarks créée');

    // Index pour améliorer les performances
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_documents_mission_id ON documents(mission_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_findings_mission_id ON findings(mission_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sanctions_mission_id ON sanctions(mission_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_remarks_mission_id ON remarks(mission_id)');
    console.log('✅ Index créés');

    // Fonction pour mettre à jour updated_at automatiquement
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Triggers pour updated_at
    const tables = ['users', 'missions', 'documents', 'findings', 'sanctions', 'remarks'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}
      `);
      await client.query(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `);
    }
    console.log('✅ Triggers updated_at créés');

    console.log('🎉 Migration PostgreSQL terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur de migration:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
