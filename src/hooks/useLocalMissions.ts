import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

export const useLocalMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      console.log('📋 Récupération des missions depuis la base de données...');
      const result = await db.missions.toArray();
      console.log(`✅ ${result.length} missions récupérées`);
      
      setMissions(result);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des missions:', err);
      setError('Erreur lors de la récupération des missions depuis la base de données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const refreshMissions = async () => {
    try {
      setLoading(true);
      const allMissions = await db.missions.toArray();
      console.log('Missions après rafraîchissement:', allMissions);
      setMissions(allMissions);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des missions:', err);
      setError('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  const addMission = async (missionData: Omit<Mission, 'id'>) => {
    try {
      setLoading(true);
      console.log('Ajout d\'une nouvelle mission:', missionData);
      const newMission = await db.missions.add(missionData);
      console.log('Mission ajoutée avec succès:', newMission);
      await refreshMissions();
      return newMission;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la mission:', err);
      setError('Erreur lors de l\'ajout de la mission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMissionStatuses = async () => {
    try {
      setLoading(true);
      // Pour localStorage, on peut simuler la mise à jour des statuts
      console.log('Mise à jour des statuts (mode local)');
      await refreshMissions();
      return { updated: 0 };
    } catch (err) {
      console.error('Erreur lors de la mise à jour des statuts:', err);
      setError('Erreur lors de la mise à jour des statuts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingStatusChanges = async () => {
    try {
      // Pour localStorage, on peut simuler la vérification
      console.log('Vérification des changements de statut (mode local)');
      return { startingSoon: [], endingSoon: [] };
    } catch (err) {
      console.error('Erreur lors de la vérification des changements de statut:', err);
      return { startingSoon: [], endingSoon: [] };
    }
  };

  return { 
    missions, 
    loading, 
    error, 
    refreshMissions, 
    addMission, 
    updateMissionStatuses, 
    checkUpcomingStatusChanges 
  };
}; 