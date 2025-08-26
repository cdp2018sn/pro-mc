import { initializeDatabase, executeQuery } from '../database/db';
import { Mission } from '../types/mission';

// Fonction pour générer une référence unique
const generateReference = () => {
  const prefix = 'MIS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Fonction pour générer une date aléatoire dans les 30 derniers jours
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Liste des missions d'exemple
const sampleMissions = [
  {
    reference: generateReference(),
    title: 'Contrôle de la conformité RGPD - Orange Sénégal',
    description: 'Vérification de la conformité au RGPD des traitements de données personnelles.',
    status: 'PLANIFIEE',
    priority: 'Haute',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'user1@example.com',
    created_by: 'admin@example.com'
  },
  // ... Ajoutez les autres missions ici
];

// Fonction pour insérer un utilisateur
async function insertUser(email: string, fullName: string, role: string) {
  const query = `
    INSERT OR IGNORE INTO users (email, full_name, role)
    VALUES (?, ?, ?)
  `;
  await executeQuery(query, [email, fullName, role]);
}

// Fonction pour insérer les missions
async function insertSampleMissions() {
  try {
    // Initialiser la base de données
    await initializeDatabase();

    // Insérer les utilisateurs de base
    await insertUser('admin@example.com', 'Administrateur', 'ADMIN');
    await insertUser('user1@example.com', 'Utilisateur 1', 'CONTROLLER');
    await insertUser('user2@example.com', 'Utilisateur 2', 'CONTROLLER');
    await insertUser('user3@example.com', 'Utilisateur 3', 'CONTROLLER');

    // Insérer chaque mission
    for (const mission of sampleMissions) {
      const query = `
        INSERT INTO missions (
          reference, title, description, status, priority,
          start_date, end_date, assigned_to, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await executeQuery(query, [
        mission.reference,
        mission.title,
        mission.description,
        mission.status,
        mission.priority,
        mission.start_date.toISOString(),
        mission.end_date.toISOString(),
        mission.assigned_to,
        mission.created_by
      ]);
    }

    console.log('Missions insérées avec succès dans la base de données locale');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des missions:', error);
  }
}

// Exécuter le script
insertSampleMissions(); 