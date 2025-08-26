import { db } from '../database/localStorageDb';
import { Mission } from '../types/mission';

// Missions de test avec des dates proches pour tester le changement automatique de statut
const testMissions: Omit<Mission, 'id'>[] = [
  {
    reference: 'TEST-001',
    title: 'Mission de test - Commence bientôt',
    description: 'Mission qui va commencer dans les prochaines heures',
    type_mission: 'Contrôle sur place',
    organization: 'Entreprise Test A',
    address: '123 Rue Test, Dakar',
    start_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2 heures
    end_date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Dans 26 heures
    status: 'PLANIFIEE',
    motif_controle: 'Programme annuel',
    decision_numero: 'DEC-2024-001',
    date_decision: new Date().toISOString(),
    team_members: ['Agent 1', 'Agent 2'],
    objectives: ['Vérifier la conformité', 'Identifier les manquements'],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-002',
    title: 'Mission de test - Se termine bientôt',
    description: 'Mission qui va se terminer dans les prochains jours',
    type_mission: 'Contrôle sur pièces',
    organization: 'Entreprise Test B',
    address: '456 Avenue Test, Dakar',
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 5 jours
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Dans 2 jours
    status: 'EN_COURS',
    motif_controle: 'Suite a une plainte',
    decision_numero: 'DEC-2024-002',
    date_decision: new Date().toISOString(),
    team_members: ['Agent 3', 'Agent 4'],
    objectives: ['Analyser les documents', 'Rédiger le rapport'],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-003',
    title: 'Mission de test - Déjà terminée',
    description: 'Mission qui devrait être marquée comme terminée',
    type_mission: 'Contrôle en ligne',
    organization: 'Entreprise Test C',
    address: '789 Boulevard Test, Dakar',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 10 jours
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
    status: 'EN_COURS',
    motif_controle: 'Decision de la session pleniere',
    decision_numero: 'DEC-2024-003',
    date_decision: new Date().toISOString(),
    team_members: ['Agent 5'],
    objectives: ['Contrôle en ligne', 'Vérification des systèmes'],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-004',
    title: 'Mission de test - Planifiée pour plus tard',
    description: 'Mission planifiée pour plus tard (pas d\'alerte)',
    type_mission: 'Contrôle sur place',
    organization: 'Entreprise Test D',
    address: '321 Rue Future, Dakar',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Dans 14 jours
    status: 'PLANIFIEE',
    motif_controle: 'Programme annuel',
    decision_numero: 'DEC-2024-004',
    date_decision: new Date().toISOString(),
    team_members: ['Agent 6', 'Agent 7'],
    objectives: ['Préparation de la mission', 'Planification'],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export async function insertTestMissions() {
  try {
    console.log('🧪 Insertion des missions de test...');
    
    // Supprimer les anciennes missions de test
    const existingMissions = await db.getAllMissions();
    const testMissionsToDelete = existingMissions.filter(m => m.reference.startsWith('TEST-'));
    
    for (const mission of testMissionsToDelete) {
      await db.deleteMission(mission.id);
    }
    
    console.log(`🗑️ ${testMissionsToDelete.length} anciennes missions de test supprimées`);

    // Ajouter les nouvelles missions de test
    for (const mission of testMissions) {
      await db.addMission(mission);
    }
    
    console.log(`✅ ${testMissions.length} missions de test ajoutées`);
    
    // Tester la mise à jour automatique des statuts
    console.log('🔄 Test de la mise à jour automatique des statuts...');
    const updateResult = await db.updateMissionStatuses();
    console.log('📊 Résultat de la mise à jour:', updateResult);
    
    // Vérifier les changements à venir
    console.log('🔍 Vérification des changements à venir...');
    const upcomingChanges = await db.checkUpcomingStatusChanges();
    console.log('📅 Missions qui vont commencer:', upcomingChanges.startingSoon.length);
    console.log('⏰ Missions qui vont se terminer:', upcomingChanges.endingSoon.length);
    
    console.log('✅ Test terminé avec succès !');
    
    return {
      inserted: testMissions.length,
      updated: updateResult,
      upcomingChanges
    };
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  insertTestMissions()
    .then(result => {
      console.log('🎉 Test terminé:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erreur:', error);
      process.exit(1);
    });
}
