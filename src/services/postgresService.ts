import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

// Service PostgreSQL qui utilise maintenant la base de données unifiée
export class PostgresService {
  // Récupérer toutes les missions
  static async getMissions(): Promise<Mission[]> {
    try {
      console.log('🔄 PostgresService: Récupération des missions...');
      const missions = await db.getAllMissions();
      console.log(`✅ PostgresService: ${missions.length} missions récupérées`);
      return missions;
    } catch (error) {
      console.error('❌ PostgresService: Erreur récupération missions:', error);
      throw new Error('Impossible de récupérer les missions');
    }
  }

  // Créer une nouvelle mission
  static async createMission(missionData: Omit<Mission, 'id'>): Promise<Mission> {
    try {
      console.log('🔄 PostgresService: Création mission...');
      const newMission = await db.addMission(missionData);
      console.log('✅ PostgresService: Mission créée:', newMission.reference);
      return newMission;
    } catch (error) {
      console.error('❌ PostgresService: Erreur création mission:', error);
      throw new Error('Impossible de créer la mission');
    }
  }

  // Mettre à jour une mission
  static async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    try {
      console.log('🔄 PostgresService: Mise à jour mission...');
      await db.updateMission(id, updates);
      
      // Récupérer la mission mise à jour
      const missions = await db.getAllMissions();
      const updatedMission = missions.find(m => m.id === id);
      
      if (!updatedMission) {
        throw new Error('Mission non trouvée après mise à jour');
      }
      
      console.log('✅ PostgresService: Mission mise à jour:', updatedMission.reference);
      return updatedMission;
    } catch (error) {
      console.error('❌ PostgresService: Erreur mise à jour mission:', error);
      throw new Error('Impossible de mettre à jour la mission');
    }
  }

  // Supprimer une mission
  static async deleteMission(id: string): Promise<void> {
    try {
      console.log('🔄 PostgresService: Suppression mission...');
      await db.deleteMission(id);
      console.log('✅ PostgresService: Mission supprimée');
    } catch (error) {
      console.error('❌ PostgresService: Erreur suppression mission:', error);
      throw new Error('Impossible de supprimer la mission');
    }
  }

  // Obtenir une mission par ID
  static async getMissionById(id: string): Promise<Mission | null> {
    try {
      const missions = await db.getAllMissions();
      return missions.find(m => m.id === id) || null;
    } catch (error) {
      console.error('❌ PostgresService: Erreur récupération mission par ID:', error);
      return null;
    }
  }

  // Rechercher des missions
  static async searchMissions(filters: any): Promise<Mission[]> {
    try {
      const allMissions = await db.getAllMissions();
      
      return allMissions.filter(mission => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          
          switch (key) {
            case 'reference':
              return mission.reference.toLowerCase().includes((value as string).toLowerCase());
            case 'title':
              return mission.title.toLowerCase().includes((value as string).toLowerCase());
            case 'organization':
              return mission.organization.toLowerCase().includes((value as string).toLowerCase());
            case 'status':
              return mission.status === value;
            default:
              return true;
          }
        });
      });
    } catch (error) {
      console.error('❌ PostgresService: Erreur recherche missions:', error);
      return [];
    }
  }

  // Obtenir les statistiques
  static async getStatistics() {
    try {
      const missions = await db.getAllMissions();
      
      return {
        total: missions.length,
        planifiee: missions.filter(m => m.status === 'PLANIFIEE').length,
        en_cours: missions.filter(m => m.status === 'EN_COURS').length,
        terminee: missions.filter(m => m.status === 'TERMINEE').length,
        annulee: missions.filter(m => m.status === 'ANNULEE').length,
        attente: missions.filter(m => m.status === 'ATTENTE_REPONSE').length
      };
    } catch (error) {
      console.error('❌ PostgresService: Erreur statistiques:', error);
      return {
        total: 0,
        planifiee: 0,
        en_cours: 0,
        terminee: 0,
        annulee: 0,
        attente: 0
      };
    }
  }

  // Mettre à jour les statuts automatiquement
  static async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    try {
      return await db.updateMissionStatuses();
    } catch (error) {
      console.error('❌ PostgresService: Erreur mise à jour statuts:', error);
      return { updated: 0, started: 0, completed: 0 };
    }
  }

  // Méthodes pour la compatibilité avec useMissions
  static async addRemark(missionId: string, remark: any): Promise<void> {
    try {
      const content = typeof remark === 'string' ? remark : remark.content;
      await db.addRemark(missionId, content);
    } catch (error) {
      console.error('❌ PostgresService: Erreur ajout remarque:', error);
      throw error;
    }
  }

  static async addSanction(missionId: string, sanction: any): Promise<void> {
    try {
      await db.addSanction(missionId, sanction);
    } catch (error) {
      console.error('❌ PostgresService: Erreur ajout sanction:', error);
      throw error;
    }
  }

  static async addFinding(missionId: string, finding: any): Promise<void> {
    try {
      await db.addFinding(missionId, finding);
    } catch (error) {
      console.error('❌ PostgresService: Erreur ajout finding:', error);
      throw error;
    }
  }
}