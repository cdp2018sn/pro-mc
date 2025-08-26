import { executeQuery } from '../database/db';

// Fonction pour générer une référence unique
const generateReference = () => {
  const prefix = 'MIS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

async function addNewMission() {
  try {
    const newMission = {
      reference: generateReference(),
      title: 'Nouvelle mission de contrôle',
      description: 'Description de la nouvelle mission',
      status: 'PLANIFIEE',
      priority: 'Moyenne',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours plus tard
      assigned_to: 'user1@example.com',
      created_by: 'admin@example.com'
    };

    const query = `
      INSERT INTO missions (
        reference, title, description, status, priority,
        start_date, end_date, assigned_to, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [
      newMission.reference,
      newMission.title,
      newMission.description,
      newMission.status,
      newMission.priority,
      newMission.start_date,
      newMission.end_date,
      newMission.assigned_to,
      newMission.created_by
    ]);

    console.log('Nouvelle mission ajoutée avec succès');
    console.log('Référence:', newMission.reference);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la nouvelle mission:', error);
  }
}

addNewMission(); 