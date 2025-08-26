import { Mission } from '../types/mission';
import * as fs from 'fs';
import * as path from 'path';

// Missions de test avec différents statuts et dates
const testMissions: Omit<Mission, 'id'>[] = [
  {
    reference: 'TEST-STATUS-001',
    title: 'Contrôle Orange Sénégal - Protection des données',
    description: 'Mission de contrôle sur place pour vérifier la conformité RGPD d\'Orange Sénégal',
    type_mission: 'Contrôle sur place',
    organization: 'Orange Sénégal',
    address: 'Route de Ouakam, Dakar',
    start_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Dans 1 heure
    end_date: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Dans 25 heures
    status: 'PLANIFIEE',
    motif_controle: 'Programme annuel',
    decision_numero: 'DEC-2024-001',
    date_decision: new Date().toISOString(),
    team_members: ['Mamadou Diallo', 'Fatou Sall', 'Ousmane Ba'],
    objectives: [
      'Vérifier la conformité des traitements de données personnelles',
      'Contrôler les mesures de sécurité mises en place',
      'Évaluer les procédures de consentement'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-002',
    title: 'Audit MTN Sénégal - Sécurité informatique',
    description: 'Contrôle sur pièces pour évaluer la sécurité des systèmes informatiques',
    type_mission: 'Contrôle sur pièces',
    organization: 'MTN Sénégal',
    address: 'Avenue Cheikh Anta Diop, Dakar',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 3 jours
    end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Dans 1 jour
    status: 'EN_COURS',
    motif_controle: 'Suite a une plainte',
    decision_numero: 'DEC-2024-002',
    date_decision: new Date().toISOString(),
    team_members: ['Aissatou Diop', 'Moussa Fall'],
    objectives: [
      'Analyser les logs de sécurité',
      'Vérifier les procédures d\'accès',
      'Contrôler la gestion des incidents'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-003',
    title: 'Contrôle en ligne - E-commerce',
    description: 'Mission de contrôle en ligne pour un site e-commerce',
    type_mission: 'Contrôle en ligne',
    organization: 'Jumia Sénégal',
    address: 'Plateau, Dakar',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 7 jours
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 1 jour
    status: 'EN_COURS',
    motif_controle: 'Decision de la session pleniere',
    decision_numero: 'DEC-2024-003',
    date_decision: new Date().toISOString(),
    team_members: ['Khadija Ndiaye'],
    objectives: [
      'Vérifier la conformité du site web',
      'Contrôler les cookies et traceurs',
      'Évaluer la transparence des conditions'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-004',
    title: 'Contrôle Banque Atlantique - Données clients',
    description: 'Mission de contrôle sur place pour la protection des données bancaires',
    type_mission: 'Contrôle sur place',
    organization: 'Banque Atlantique',
    address: 'Avenue Georges Bush, Dakar',
    start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Dans 5 jours
    end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // Dans 12 jours
    status: 'PLANIFIEE',
    motif_controle: 'Programme annuel',
    decision_numero: 'DEC-2024-004',
    date_decision: new Date().toISOString(),
    team_members: ['Mariama Sow', 'Ibrahima Diagne', 'Aminata Mbaye'],
    objectives: [
      'Contrôler la protection des données clients',
      'Vérifier les procédures de chiffrement',
      'Évaluer la formation du personnel'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-005',
    title: 'Audit Sonatel - Télécommunications',
    description: 'Mission de contrôle sur place pour les données de télécommunications',
    type_mission: 'Contrôle sur place',
    organization: 'Sonatel',
    address: 'Route de Rufisque, Dakar',
    start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 10 jours
    end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
    status: 'EN_COURS',
    motif_controle: 'Suite a une plainte',
    decision_numero: 'DEC-2024-005',
    date_decision: new Date().toISOString(),
    team_members: ['Omar Sy', 'Fatou Ndiaye'],
    objectives: [
      'Vérifier la gestion des métadonnées',
      'Contrôler les procédures de rétention',
      'Évaluer la sécurité des communications'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-006',
    title: 'Contrôle Expresso - Services mobiles',
    description: 'Mission de contrôle sur pièces pour les services mobiles',
    type_mission: 'Contrôle sur pièces',
    organization: 'Expresso',
    address: 'Médina, Dakar',
    start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 15 jours
    end_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 8 jours
    status: 'TERMINEE',
    motif_controle: 'Programme annuel',
    decision_numero: 'DEC-2024-006',
    date_decision: new Date().toISOString(),
    team_members: ['Mamadou Lamine', 'Awa Diop'],
    objectives: [
      'Analyser les procédures de facturation',
      'Vérifier la protection des données clients',
      'Contrôler la conformité des contrats'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-007',
    title: 'Contrôle en ligne - Réseaux sociaux',
    description: 'Mission de contrôle en ligne pour les réseaux sociaux',
    type_mission: 'Contrôle en ligne',
    organization: 'Facebook Sénégal',
    address: 'Siège virtuel',
    start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Dans 10 jours
    end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(), // Dans 17 jours
    status: 'PLANIFIEE',
    motif_controle: 'Decision de la session pleniere',
    decision_numero: 'DEC-2024-007',
    date_decision: new Date().toISOString(),
    team_members: ['Khadim Diop', 'Mariama Ba'],
    objectives: [
      'Vérifier la modération des contenus',
      'Contrôler la protection des mineurs',
      'Évaluer la transparence des algorithmes'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    reference: 'TEST-STATUS-008',
    title: 'Audit Google Sénégal - Services cloud',
    description: 'Mission de contrôle sur place pour les services cloud',
    type_mission: 'Contrôle sur place',
    organization: 'Google Sénégal',
    address: 'Almadies, Dakar',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
    status: 'EN_COURS',
    motif_controle: 'Suite a une plainte',
    decision_numero: 'DEC-2024-008',
    date_decision: new Date().toISOString(),
    team_members: ['Amadou Diallo', 'Fatou Sall', 'Moussa Ba'],
    objectives: [
      'Vérifier la sécurité des données cloud',
      'Contrôler les transferts internationaux',
      'Évaluer la conformité des contrats'
    ],
    findings: [],
    remarks: [],
    sanctions: [],
    documents: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

async function createTestMissions() {
  try {
    console.log('🧪 Création des missions de test avec différents statuts...');
    
    // Ajouter des IDs aux missions
    const missionsWithIds = testMissions.map((mission, index) => ({
      ...mission,
      id: `test-${Date.now()}-${index + 1}`
    }));
    
    // Créer le fichier JSON
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'test-missions.json');
    fs.writeFileSync(filePath, JSON.stringify(missionsWithIds, null, 2));
    
    console.log(`✅ ${missionsWithIds.length} missions de test créées avec succès`);
    console.log(`📁 Fichier sauvegardé: ${filePath}`);
    
    // Afficher le résumé des missions créées
    console.log('\n📊 Résumé des missions créées :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const mission of missionsWithIds) {
      const startDate = new Date(mission.start_date);
      const endDate = new Date(mission.end_date);
      const now = new Date();
      
      let timeInfo = '';
      if (mission.status === 'PLANIFIEE') {
        const diffHours = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (diffHours < 24) {
          timeInfo = `(commence dans ${diffHours}h)`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          timeInfo = `(commence dans ${diffDays} jours)`;
        }
      } else if (mission.status === 'EN_COURS') {
        const diffHours = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (diffHours < 0) {
          timeInfo = '(devrait être terminée)';
        } else if (diffHours < 24) {
          timeInfo = `(se termine dans ${diffHours}h)`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          timeInfo = `(se termine dans ${diffDays} jours)`;
        }
      }
      
      console.log(`📋 ${mission.reference} - ${mission.organization}`);
      console.log(`   Statut: ${mission.status} ${timeInfo}`);
      console.log(`   Type: ${mission.type_mission}`);
      console.log(`   Période: ${startDate.toLocaleDateString('fr-FR')} → ${endDate.toLocaleDateString('fr-FR')}`);
      console.log('');
    }
    
    // Analyser les changements à venir
    console.log('🔍 Analyse des changements à venir...');
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startingSoon = missionsWithIds.filter(mission => {
      if (mission.status !== 'PLANIFIEE') return false;
      const startDate = new Date(mission.start_date);
      return startDate >= now && startDate <= oneDayFromNow;
    });

    const endingSoon = missionsWithIds.filter(mission => {
      if (mission.status !== 'EN_COURS') return false;
      const endDate = new Date(mission.end_date);
      return endDate >= now && endDate <= oneWeekFromNow;
    });
    
    console.log('📅 Missions qui vont commencer:', startingSoon.length);
    console.log('⏰ Missions qui vont se terminer:', endingSoon.length);
    
    if (startingSoon.length > 0) {
      console.log('\n🚀 Missions qui vont commencer bientôt :');
      startingSoon.forEach(mission => {
        console.log(`   - ${mission.reference} (${mission.organization})`);
      });
    }
    
    if (endingSoon.length > 0) {
      console.log('\n⏰ Missions qui vont se terminer bientôt :');
      endingSoon.forEach(mission => {
        console.log(`   - ${mission.reference} (${mission.organization})`);
      });
    }
    
    console.log('\n✅ Test terminé avec succès !');
    console.log('💡 Vous pouvez maintenant ouvrir l\'application pour voir les alertes.');
    console.log('📝 Pour importer ces missions dans l\'application, utilisez le script d\'import.');
    
    return {
      inserted: missionsWithIds.length,
      filePath,
      startingSoon: startingSoon.length,
      endingSoon: endingSoon.length
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création des missions de test:', error);
    throw error;
  }
}

// Exécuter le script
createTestMissions()
  .then(result => {
    console.log('🎉 Création terminée:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur:', error);
    process.exit(1);
  });
