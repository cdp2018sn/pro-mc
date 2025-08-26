import { db } from '../database/localStorageDb';
import { Mission, Document, Finding, Sanction, Remark } from '../types/mission';

async function testDatabaseIntegrity() {
  console.log('🔍 Test d\'intégrité de la base de données...\n');

  try {
    // Test 1: Vérifier la connexion à la base de données
    console.log('1. Test de connexion à la base de données...');
    const missions = await db.getAllMissions();
    console.log(`✅ Connexion OK - ${missions.length} missions trouvées\n`);

    // Test 2: Vérifier la structure des missions
    console.log('2. Vérification de la structure des missions...');
    if (missions.length > 0) {
      const sampleMission = missions[0];
      const requiredFields = ['id', 'reference', 'title', 'status', 'start_date', 'end_date'];
      const missingFields = requiredFields.filter(field => !(field in sampleMission));
      
      if (missingFields.length === 0) {
        console.log('✅ Structure des missions OK');
      } else {
        console.log(`❌ Champs manquants dans les missions: ${missingFields.join(', ')}`);
      }
    } else {
      console.log('⚠️ Aucune mission trouvée pour tester la structure');
    }
    console.log('');

    // Test 3: Test d'ajout d'une mission de test
    console.log('3. Test d\'ajout d\'une mission...');
    const testMission: Omit<Mission, 'id'> = {
      reference: 'TEST-001',
      title: 'Mission de test',
      description: 'Mission de test pour vérifier l\'intégrité',
      type_mission: 'Contrôle sur place',
      organization: 'Organisation Test',
      address: 'Adresse Test',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PLANIFIEE',
      motif_controle: 'Programme annuel',
      decision_numero: 'DEC-001',
      date_decision: new Date().toISOString(),
      team_members: ['Membre 1', 'Membre 2'],
      objectives: ['Objectif 1', 'Objectif 2'],
      findings: [],
      remarks: [],
      sanctions: [],
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const addedMission = await db.addMission(testMission);
    console.log(`✅ Mission ajoutée avec ID: ${addedMission.id}\n`);

    // Test 4: Test d'ajout d'un document
    console.log('4. Test d\'ajout d\'un document...');
    const testDocument: Omit<Document, 'id' | 'mission_id'> = {
      title: 'Document de test',
      type: 'RAPPORT_CONTROLE',
      file_path: 'test.pdf',
      file_content: 'data:application/pdf;base64,test',
      created_at: new Date().toISOString()
    };

    await db.addDocument(addedMission.id, testDocument);
    console.log('✅ Document ajouté\n');

    // Test 5: Test de récupération des documents
    console.log('5. Test de récupération des documents...');
    const documents = await db.getDocumentsForMission(addedMission.id);
    console.log(`✅ ${documents.length} document(s) récupéré(s)\n`);

    // Test 6: Test d'ajout d'un constat
    console.log('6. Test d\'ajout d\'un constat...');
    const testFinding: Omit<Finding, 'id' | 'mission_id'> = {
      type: 'NON_CONFORMITE_MAJEURE',
      description: 'Constat de test',
      date_constat: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.addFinding(addedMission.id, testFinding);
    console.log('✅ Constat ajouté\n');

    // Test 7: Test d'ajout d'une remarque
    console.log('7. Test d\'ajout d\'une remarque...');
    await db.addRemark(addedMission.id, 'Remarque de test');
    console.log('✅ Remarque ajoutée\n');

    // Test 8: Test d'ajout d'une sanction
    console.log('8. Test d\'ajout d\'une sanction...');
    const testSanction: Omit<Sanction, 'id' | 'mission_id'> = {
      type: 'AVERTISSEMENT',
      description: 'Sanction de test',
      decision_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.addSanction(addedMission.id, testSanction);
    console.log('✅ Sanction ajoutée\n');

    // Test 9: Test de mise à jour d'une mission
    console.log('9. Test de mise à jour d\'une mission...');
    await db.updateMission(addedMission.id, { status: 'EN_COURS' });
    console.log('✅ Mission mise à jour\n');

    // Test 10: Test de suppression d'un document
    console.log('10. Test de suppression d\'un document...');
    if (documents.length > 0) {
      await db.deleteDocument(addedMission.id, documents[0].id);
      console.log('✅ Document supprimé\n');
    }

    // Test 11: Test de suppression de la mission de test
    console.log('11. Nettoyage - Suppression de la mission de test...');
    await db.deleteMission(addedMission.id);
    console.log('✅ Mission de test supprimée\n');

    // Test 12: Vérification finale
    console.log('12. Vérification finale...');
    const finalMissions = await db.getAllMissions();
    console.log(`✅ ${finalMissions.length} missions restantes\n`);

    console.log('🎉 Tous les tests d\'intégrité sont passés avec succès !');
    console.log('✅ La base de données fonctionne correctement.');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'intégrité:', error);
    throw error;
  }
}

// Exécuter le test si le script est appelé directement
if (typeof window !== 'undefined') {
  // Dans le navigateur
  (window as any).testDatabaseIntegrity = testDatabaseIntegrity;
  console.log('Script de test disponible. Appelez testDatabaseIntegrity() dans la console.');
} else {
  // Dans Node.js
  testDatabaseIntegrity().catch(console.error);
}

export { testDatabaseIntegrity };
