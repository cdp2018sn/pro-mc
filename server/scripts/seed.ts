import { pool } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { MissionModel } from '../models/Mission.js';

const seedData = async () => {
  try {
    console.log('🔄 Insertion des données de test...');

    // Créer l'utilisateur administrateur par défaut
    await UserModel.createDefaultAdmin();

    // Vérifier s'il y a déjà des missions
    const existingMissions = await MissionModel.findAll();
    if (existingMissions.length > 0) {
      console.log('ℹ️ Des missions existent déjà, pas d\'insertion de données de test');
      return;
    }

    // Missions de test
    const testMissions = [
      {
        reference: 'MC-2024-001',
        title: 'Contrôle de la Direction Générale des Impôts',
        description: 'Audit de la gestion fiscale et des procédures de recouvrement',
        status: 'EN_COURS' as const,
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-02-15'),
        location: 'Dakar, Sénégal',
        controller_name: 'Mamadou Diallo',
        entity_controlled: 'Direction Générale des Impôts',
        mission_type: 'Audit Financier',
        priority: 'HAUTE' as const
      },
      {
        reference: 'MC-2024-002',
        title: 'Vérification de la Caisse de Sécurité Sociale',
        description: 'Contrôle des prestations sociales et de la gestion des cotisations',
        status: 'PLANIFIEE' as const,
        start_date: new Date('2024-03-01'),
        end_date: new Date('2024-04-01'),
        location: 'Thiès, Sénégal',
        controller_name: 'Fatou Sall',
        entity_controlled: 'Caisse de Sécurité Sociale',
        mission_type: 'Contrôle Social',
        priority: 'MOYENNE' as const
      },
      {
        reference: 'MC-2024-003',
        title: 'Audit de l\'Agence de Développement Municipal',
        description: 'Évaluation de la gestion des projets de développement local',
        status: 'TERMINEE' as const,
        start_date: new Date('2023-11-01'),
        end_date: new Date('2023-12-15'),
        location: 'Saint-Louis, Sénégal',
        controller_name: 'Ousmane Ba',
        entity_controlled: 'Agence de Développement Municipal',
        mission_type: 'Audit de Performance',
        priority: 'BASSE' as const
      },
      {
        reference: 'MC-2024-004',
        title: 'Contrôle de la Régie des Eaux',
        description: 'Vérification de la facturation et de la gestion des réseaux d\'eau',
        status: 'EN_COURS' as const,
        start_date: new Date('2024-01-20'),
        end_date: new Date('2024-03-20'),
        location: 'Kaolack, Sénégal',
        controller_name: 'Aissatou Diop',
        entity_controlled: 'Régie des Eaux',
        mission_type: 'Contrôle Technique',
        priority: 'URGENTE' as const
      },
      {
        reference: 'MC-2024-005',
        title: 'Audit de l\'Office National de l\'Électricité',
        description: 'Évaluation de la gestion des infrastructures électriques',
        status: 'PLANIFIEE' as const,
        start_date: new Date('2024-04-15'),
        end_date: new Date('2024-06-15'),
        location: 'Ziguinchor, Sénégal',
        controller_name: 'Moussa Ndiaye',
        entity_controlled: 'Office National de l\'Électricité',
        mission_type: 'Audit Infrastructure',
        priority: 'HAUTE' as const
      }
    ];

    // Insérer les missions
    for (const mission of testMissions) {
      await MissionModel.create(mission);
      console.log(`✅ Mission créée: ${mission.reference}`);
    }

    console.log('🎉 Données de test insérées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await seedData();
    console.log('✅ Seeding terminé avec succès !');
  } catch (error) {
    console.error('💥 Échec du seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeed();
