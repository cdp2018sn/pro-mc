import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

export class MissionService {
  // Récupérer toutes les missions
  static async getAllMissions(): Promise<Mission[]> {
    try {
      return await db.getAllMissions();
    } catch (error) {
      console.error('Erreur récupération missions:', error);
      throw new Error('Impossible de récupérer les missions');
    }
  }

  // Créer une nouvelle mission
  static async createMission(missionData: Omit<Mission, 'id'>): Promise<Mission> {
    try {
      return await db.addMission(missionData);
    } catch (error) {
      console.error('Erreur création mission:', error);
      throw new Error('Impossible de créer la mission');
    }
  }

  // Mettre à jour une mission
  static async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    try {
      await db.updateMission(id, updates);
    } catch (error) {
      console.error('Erreur mise à jour mission:', error);
      throw new Error('Impossible de mettre à jour la mission');
    }
  }

  // Supprimer une mission
  static async deleteMission(id: string): Promise<void> {
    try {
      await db.deleteMission(id);
    } catch (error) {
      console.error('Erreur suppression mission:', error);
      throw new Error('Impossible de supprimer la mission');
    }
  }

  // Rechercher des missions
  static async searchMissions(query: string): Promise<Mission[]> {
    try {
      const allMissions = await db.getAllMissions();
      const searchTerm = query.toLowerCase();
      
      return allMissions.filter(mission => 
        mission.title.toLowerCase().includes(searchTerm) ||
        mission.reference.toLowerCase().includes(searchTerm) ||
        mission.organization.toLowerCase().includes(searchTerm) ||
        mission.description?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Erreur recherche missions:', error);
      throw new Error('Impossible de rechercher les missions');
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
      console.error('Erreur statistiques:', error);
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
      console.error('Erreur mise à jour statuts:', error);
      throw new Error('Impossible de mettre à jour les statuts');
    }
  }

  // Vérifier les changements à venir
  static async checkUpcomingStatusChanges(): Promise<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }> {
    try {
      return await db.checkUpcomingStatusChanges();
    } catch (error) {
      console.error('Erreur vérification changements:', error);
      return { startingSoon: [], endingSoon: [] };
    }
  }
}