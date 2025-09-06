import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

export const useLocalMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      console.log('📋 useLocalMissions: Récupération des missions...');
      setLoading(true);
      setError(null);
      
      const result = await db.getAllMissions();
      console.log(`✅ useLocalMissions: ${result.length} missions récupérées`);
      
      setMissions(result);
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
      console.log('🔄 useLocalMissions: Rafraîchissement des missions...');
      setLoading(true);
      setError(null);
      
      const allMissions = await db.getAllMissions();
      console.log('✅ useLocalMissions: Missions après rafraîchissement:', allMissions.length);
      
      setMissions(allMissions);
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
      console.log('➕ useLocalMissions: Ajout d\'une nouvelle mission:', missionData.title);
      setLoading(true);
      setError(null);
      
      const newMission = await db.addMission(missionData);
      console.log('✅ useLocalMissions: Mission ajoutée avec succès:', newMission.reference);
      
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
      console.log('🔄 useLocalMissions: Mise à jour des statuts...');
      setLoading(true);
      
      const result = await db.updateMissionStatuses();
      console.log('✅ useLocalMissions: Statuts mis à jour:', result);
      
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
      console.log('🔍 useLocalMissions: Vérification des changements à venir...');
      const result = await db.checkUpcomingStatusChanges();
      console.log('✅ useLocalMissions: Changements à venir:', result);
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