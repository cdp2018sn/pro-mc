const { pool } = require('../config/database');

// Script pour réinitialiser la base de données
async function reset() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la réinitialisation PostgreSQL...');
    
    // Supprimer toutes les données dans l'ordre (pour respecter les contraintes de clés étrangères)
    await client.query('DELETE FROM remarks');
    await client.query('DELETE FROM sanctions');
    await client.query('DELETE FROM findings');
    await client.query('DELETE FROM documents');
    await client.query('DELETE FROM missions');
    await client.query('DELETE FROM users WHERE id != $1', ['admin-1']);
    
    console.log('✅ Données supprimées');
    console.log('ℹ️ L\'administrateur principal a été conservé');
    
    // Réexécuter le seeding
    const { seed } = require('./seed');
    await seed();
    
    console.log('🎉 Réinitialisation PostgreSQL terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter la réinitialisation si le script est appelé directement
if (require.main === module) {
  reset()
    .then(() => {
      console.log('✅ Réinitialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur de réinitialisation:', error);
      process.exit(1);
    });
}

module.exports = { reset };
