import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

export const useLocalMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await db.getAllMissions();
      console.log(`✅ useLocalMissions: ${result?.length || 0} missions récupérées`);
      
      setMissions(result || []);
    } catch (err) {
      console.error('❌ useLocalMissions: Erreur lors de la récupération des missions:', err);
      setError('Erreur lors de la récupération des missions depuis la base de données');
      setMissions([]); // S'assurer qu'on a un tableau vide en cas d'erreur
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
      setError(null);
      
      const allMissions = await db.getAllMissions();
      console.log('✅ useLocalMissions: Missions après rafraîchissement:', allMissions?.length || 0);
      
      setMissions(allMissions || []);
    } catch (err) {
      console.error('❌ useLocalMissions: Erreur lors du rafraîchissement des missions:', err);
      setError('Erreur lors du chargement des missions');
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const addMission = async (missionData: Omit<Mission, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newMission = await db.addMission(missionData);
      console.log('✅ useLocalMissions: Mission ajoutée avec succès:', newMission?.reference);
      
      await refreshMissions();
      return newMission;
    } catch (err) {
      console.error('❌ useLocalMissions: Erreur lors de l\'ajout de la mission:', err);
      setError('Erreur lors de l\'ajout de la mission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMissionStatuses = async () => {
    try {
      setLoading(true);
      
      const result = await db.updateMissionStatuses();
      
      await refreshMissions();
      return result;
    } catch (err) {
      console.error('❌ useLocalMissions: Erreur lors de la mise à jour des statuts:', err);
      setError('Erreur lors de la mise à jour des statuts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingStatusChanges = async () => {
    try {
      const result = await db.checkUpcomingStatusChanges();
      return result;
    } catch (err) {
      console.error('❌ useLocalMissions: Erreur lors de la vérification des changements de statut:', err);
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