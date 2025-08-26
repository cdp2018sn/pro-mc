const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cdp_missions',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL réussie');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
}

// Fermer le pool de connexions
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool PostgreSQL fermé');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture du pool:', error);
  }
}

// Vérifier si la base de données existe
async function checkDatabaseExists() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database()');
    client.release();
    console.log('✅ Base de données connectée:', result.rows[0].current_database);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  closePool,
  checkDatabaseExists
};
