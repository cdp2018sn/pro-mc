import { getDatabase } from '../database/db';

async function modifyDatabase() {
  try {
    const db = await getDatabase();

    // Exemple 1: Ajouter une nouvelle colonne à la table missions
    console.log('Ajout d\'une nouvelle colonne à la table missions...');
    await db.exec(`
      ALTER TABLE missions 
      ADD COLUMN estimated_hours INTEGER;
    `);

    // Exemple 2: Ajouter une nouvelle table pour les tags
    console.log('Création d\'une nouvelle table pour les tags...');
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mission_tags (
        mission_id INTEGER REFERENCES missions(id),
        tag_id INTEGER REFERENCES tags(id),
        PRIMARY KEY (mission_id, tag_id)
      );
    `);

    // Exemple 3: Ajouter un index sur la nouvelle colonne
    console.log('Ajout d\'un index sur la nouvelle colonne...');
    await db.exec(`
      CREATE INDEX idx_missions_estimated_hours 
      ON missions(estimated_hours);
    `);

    console.log('Structure de la base de données modifiée avec succès');
    await db.close();
  } catch (error) {
    console.error('Erreur lors de la modification de la structure:', error);
  }
}

modifyDatabase(); 