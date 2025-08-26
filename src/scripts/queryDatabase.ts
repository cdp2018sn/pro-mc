import { getDatabase } from '../database/db';

async function queryDatabase() {
  const db = await getDatabase();
  try {
    console.log('\n=== Liste des missions ===');
    const missions = await db.all('SELECT reference, title, status, organization FROM missions');
    console.table(missions);
  } catch (error) {
    console.error('Erreur lors de la requête:', error);
  } finally {
    await db.close();
  }
}

queryDatabase(); 