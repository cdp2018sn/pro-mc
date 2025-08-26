import { db } from '../database/localStorageDb';
import { Mission } from '../types/mission';
import * as fs from 'fs';
import * as path from 'path';

async function importTestMissions() {
  try {
    console.log('📥 Import des missions de test dans l\'application...');
    
    // Lire le fichier JSON des missions de test
    const filePath = './data/test-missions.json';
    if (!fs.existsSync(filePath)) {
      console.error('❌ Fichier test-missions.json non trouvé. Exécutez d\'abord npm run create-test-missions');
      return;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const testMissions: Mission[] = JSON.parse(fileContent);
    
    console.log(`📋 ${testMissions.length} missions trouvées dans le fichier`);
    
    // Supprimer les anciennes missions de test existantes
    const existingMissions = await db.getAllMissions();
    const testMissionsToDelete = existingMissions.filter(m => m.reference.startsWith('TEST-STATUS-'));
    
    for (const mission of testMissionsToDelete) {
      await db.deleteMission(mission.id);
    }
    
    console.log(`🗑️ ${testMissionsToDelete.length} anciennes missions de test supprimées`);
    
    // Importer les nouvelles missions de test
    for (const mission of testMissions) {
      await db.addMission(mission);
    }
    
    console.log(`✅ ${testMissions.length} missions de test importées avec succès`);
    
    // Tester la mise à jour automatique des statuts
    console.log('🔄 Test de la mise à jour automatique des statuts...');
    const updateResult = await db.updateMissionStatuses();
    console.log('📊 Résultat de la mise à jour:', updateResult);
    
    // Vérifier les changements à venir
    console.log('🔍 Vérification des changements à venir...');
    const upcomingChanges = await db.checkUpcomingStatusChanges();
    console.log('📅 Missions qui vont commencer:', upcomingChanges.startingSoon.length);
    console.log('⏰ Missions qui vont se terminer:', upcomingChanges.endingSoon.length);
    
    if (upcomingChanges.startingSoon.length > 0) {
      console.log('\n🚀 Missions qui vont commencer bientôt :');
      upcomingChanges.startingSoon.forEach(mission => {
        console.log(`   - ${mission.reference} (${mission.organization})`);
      });
    }
    
    if (upcomingChanges.endingSoon.length > 0) {
      console.log('\n⏰ Missions qui vont se terminer bientôt :');
      upcomingChanges.endingSoon.forEach(mission => {
        console.log(`   - ${mission.reference} (${mission.organization})`);
      });
    }
    
    // Afficher le résumé final
    const allMissions = await db.getAllMissions();
    const stats = {
      total: allMissions.length,
      planifiee: allMissions.filter(m => m.status === 'PLANIFIEE').length,
      enCours: allMissions.filter(m => m.status === 'EN_COURS').length,
      terminee: allMissions.filter(m => m.status === 'TERMINEE').length,
      annulee: allMissions.filter(m => m.status === 'ANNULEE').length,
      attente: allMissions.filter(m => m.status === 'ATTENTE_REPONSE').length
    };
    
    console.log('\n📊 Statistiques finales :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Total des missions: ${stats.total}`);
    console.log(`📅 Planifiées: ${stats.planifiee}`);
    console.log(`🔄 En cours: ${stats.enCours}`);
    console.log(`✅ Terminées: ${stats.terminee}`);
    console.log(`❌ Annulées: ${stats.annulee}`);
    console.log(`⏳ En attente: ${stats.attente}`);
    
    console.log('\n✅ Import terminé avec succès !');
    console.log('🌐 Vous pouvez maintenant ouvrir l\'application pour voir les missions et les alertes.');
    
    return {
      imported: testMissions.length,
      updated: updateResult,
      upcomingChanges,
      stats
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'import des missions de test:', error);
    throw error;
  }
}

// Exécuter le script
importTestMissions()
  .then(result => {
    console.log('🎉 Import terminé:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
