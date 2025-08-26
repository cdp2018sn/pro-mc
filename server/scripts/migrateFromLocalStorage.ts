import { pool } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { MissionModel } from '../models/Mission.js';

// Fonction pour lire les données de localStorage (simulation)
const getLocalStorageData = () => {
  // Dans un vrai environnement, vous devriez lire depuis le localStorage du navigateur
  // Pour l'instant, nous allons créer des données de test
  return {
    users: [
      {
        id: 'admin-1',
        email: 'abdoulaye.niang@cdp.sn',
        name: 'Abdoulaye Niang',
        role: 'admin',
        password: 'Passer',
        department: 'Direction',
        phone: '',
        isActive: true,
        created_at: new Date().toISOString(),
        last_login: null
      }
    ],
    missions: [
      {
        reference: 'MC-2024-001',
        title: 'Contrôle de la Direction Générale des Impôts',
        description: 'Audit de la gestion fiscale et des procédures de recouvrement',
        status: 'EN_COURS',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-02-15'),
        location: 'Dakar, Sénégal',
        controller_name: 'Mamadou Diallo',
        entity_controlled: 'Direction Générale des Impôts',
        mission_type: 'Audit Financier',
        priority: 'HAUTE'
      }
    ]
  };
};

const migrateData = async () => {
  try {
    console.log('🔄 Début de la migration des données...');

    const localStorageData = getLocalStorageData();

    // Migrer les utilisateurs
    console.log('📊 Migration des utilisateurs...');
    for (const user of localStorageData.users) {
      try {
        await UserModel.create({
          email: user.email,
          name: user.name,
          role: user.role,
          password: user.password,
          department: user.department,
          phone: user.phone,
          is_active: user.isActive
        });
        console.log(`✅ Utilisateur migré: ${user.email}`);
      } catch (error: any) {
        if (error.message.includes('existe déjà')) {
          console.log(`ℹ️ Utilisateur déjà existant: ${user.email}`);
        } else {
          console.error(`❌ Erreur lors de la migration de l'utilisateur ${user.email}:`, error.message);
        }
      }
    }

    // Migrer les missions
    console.log('📊 Migration des missions...');
    for (const mission of localStorageData.missions) {
      try {
        await MissionModel.create(mission);
        console.log(`✅ Mission migrée: ${mission.reference}`);
      } catch (error: any) {
        if (error.message.includes('existe déjà')) {
          console.log(`ℹ️ Mission déjà existante: ${mission.reference}`);
        } else {
          console.error(`❌ Erreur lors de la migration de la mission ${mission.reference}:`, error.message);
        }
      }
    }

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await migrateData();
    console.log('✅ Migration depuis localStorage terminée !');
  } catch (error) {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
