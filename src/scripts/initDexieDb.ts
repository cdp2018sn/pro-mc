import { db } from '../database/dexieDb';

const sampleMissions = [
  {
    reference: 'M001',
    title: 'Contrôle RGPD - Banque Atlantique',
    description: 'Contrôle de conformité au RGPD des traitements de données personnelles des clients',
    status: 'EN_COURS',
    priority: 'HAUTE',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
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
    start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    assigned_to: 'inspecteur3@cdp.sn',
    created_by: 'admin@cdp.sn',
    organization: 'Hôpital Principal de Dakar',
    address: 'Avenue Nelson Mandela, Dakar',
    team_members: JSON.stringify(['Expert Médical', 'Inspecteur Principal', 'Expert Technique']),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function initializeDatabase() {
  try {
    // Supprimer toutes les données existantes
    await db.missions.clear();
    await db.remarks.clear();
    await db.findings.clear();
    await db.sanctions.clear();

    // Ajouter les missions d'exemple
    for (const mission of sampleMissions) {
      await db.missions.add(mission);
    }

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Initialiser la base de données
initializeDatabase(); 