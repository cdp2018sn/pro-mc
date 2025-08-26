import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Chemin vers le fichier de base de données
const dbPath = path.join(process.cwd(), 'data', 'missions.db');

// S'assurer que le dossier data existe
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fonction pour initialiser la base de données
export async function initializeDatabase() {
  try {
    // Ouvrir la connexion à la base de données
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Lire le fichier de schéma SQL
    const schema = fs.readFileSync(
      path.join(process.cwd(), 'src', 'database', 'schema.sql'),
      'utf-8'
    );

    // Exécuter les requêtes du schéma
    await db.exec(schema);

    console.log('Base de données initialisée avec succès');
    return db;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonction pour obtenir une connexion à la base de données
export async function getDatabase() {
  return await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Fonction pour exécuter une requête avec gestion des erreurs
export async function executeQuery(query: string, params: any[] = []) {
  const db = await getDatabase();
  try {
    return await db.all(query, params);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  } finally {
    await db.close();
  }
} 