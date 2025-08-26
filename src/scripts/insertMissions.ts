import { getDatabase } from '../database/db';

// Fonction pour générer une date aléatoire dans les 30 derniers jours
const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Liste des missions à insérer
const missions = [
  {
    reference: 'M001',
    title: 'Contrôle RGPD - Banque Atlantique',
    description: 'Contrôle de conformité au RGPD des traitements de données personnelles des clients',
    status: 'EN_COURS',
    priority: 'HAUTE',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'inspecteur1@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'Banque Atlantique Sénégal',
    address: 'Dakar Plateau, Avenue Léopold Sédar Senghor',
    team_members: JSON.stringify(['Inspecteur Principal', 'Inspecteur Assistant', 'Expert Technique']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: 'M002',
    title: 'Audit Protection des Données - SONATEL',
    description: 'Audit complet des mesures de protection des données personnelles',
    status: 'EN_COURS',
    priority: 'HAUTE',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'inspecteur2@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'SONATEL',
    address: 'Route des Almadies, Dakar',
    team_members: JSON.stringify(['Chef de Mission', 'Expert Technique', 'Juriste']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: 'M003',
    title: 'Contrôle Données Santé - Hôpital Principal',
    description: 'Contrôle du traitement des données de santé des patients',
    status: 'TERMINEE',
    priority: 'HAUTE',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'inspecteur3@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'Hôpital Principal de Dakar',
    address: 'Avenue Nelson Mandela, Dakar',
    team_members: JSON.stringify(['Expert Médical', 'Inspecteur Principal', 'Expert Technique']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: 'M004',
    title: 'Audit RGPD - Ministère de la Santé',
    description: 'Audit de conformité RGPD des systèmes d\'information de santé',
    status: 'TERMINEE',
    priority: 'HAUTE',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'inspecteur1@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'Ministère de la Santé',
    address: 'Fann Résidence, Dakar',
    team_members: JSON.stringify(['Inspecteur Principal', 'Expert Santé', 'Juriste']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    reference: 'M005',
    title: 'Contrôle Protection des Données - Orange Money',
    description: 'Contrôle des mesures de sécurité des données financières',
    status: 'PLANIFIEE',
    priority: 'HAUTE',
    start_date: getRandomDate(),
    end_date: getRandomDate(),
    assigned_to: 'inspecteur2@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'Orange Money Sénégal',
    address: 'Route des Almadies, Dakar',
    team_members: JSON.stringify(['Expert Financier', 'Inspecteur Principal', 'Expert Technique']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function insertMissions() {
  const db = await getDatabase();
  try {
    for (const mission of missions) {
      await db.run(`
        INSERT OR REPLACE INTO missions (
          reference, title, description, status, priority,
          start_date, end_date, assigned_to, created_by,
          organization, address, team_members,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mission.reference,
        mission.title,
        mission.description,
        mission.status,
        mission.priority,
        mission.start_date.toISOString(),
        mission.end_date.toISOString(),
        mission.assigned_to,
        mission.created_by,
        mission.organization,
        mission.address,
        mission.team_members,
        mission.created_at,
        mission.updated_at
      ]);
      console.log(`Mission ${mission.reference} insérée avec succès`);
    }
    console.log('Toutes les missions ont été insérées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des missions:', error);
  } finally {
    await db.close();
  }
}

insertMissions(); 