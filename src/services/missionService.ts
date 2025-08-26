import { Mission } from '../types/mission';

const API_BASE_URL = 'http://localhost:3000/api';

export const missionService = {
  // Récupérer toutes les missions
  getMissions: async (): Promise<Mission[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des missions');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getMissions:', error);
      throw error;
    }
  },

  // Créer une nouvelle mission
  createMission: async (mission: Omit<Mission, 'id'>): Promise<Mission> => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mission),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la mission');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans createMission:', error);
      throw error;
    }
  },

  // Mettre à jour une mission
  updateMission: async (id: string, mission: Partial<Mission>): Promise<Mission> => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mission),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la mission');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans updateMission:', error);
      throw error;
    }
  },

  // Supprimer une mission
  deleteMission: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la mission');
      }
    } catch (error) {
      console.error('Erreur dans deleteMission:', error);
      throw error;
    }
  },

  // Déclencher la mise à jour automatique des statuts
  updateMissionStatuses: async (): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/missions/update-statuses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des statuts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur dans updateMissionStatuses:', error);
      throw error;
    }
  },

  // Vérifier les missions qui vont changer de statut
  checkUpcomingStatusChanges: (missions: Mission[]): {
    startingSoon: Mission[];
    endingSoon: Mission[];
  } => {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startingSoon = missions.filter(mission => {
      if (mission.status !== 'PLANIFIEE') return false;
      const startDate = new Date(mission.start_date);
      return startDate >= now && startDate <= oneDayFromNow;
    });

    const endingSoon = missions.filter(mission => {
      if (mission.status !== 'EN_COURS') return false;
      const endDate = new Date(mission.end_date);
      return endDate >= now && endDate <= oneWeekFromNow;
    });

    return { startingSoon, endingSoon };
  },

  // Obtenir le statut prévu d'une mission basé sur sa date
  getExpectedStatus: (mission: Mission): string => {
    const now = new Date();
    const startDate = new Date(mission.start_date);
    const endDate = new Date(mission.end_date);

    if (now < startDate) {
      return 'PLANIFIEE';
    } else if (now >= startDate && now <= endDate) {
      return 'EN_COURS';
    } else {
      return 'TERMINEE';
    }
  }
}; 