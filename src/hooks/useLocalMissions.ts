import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';

export const useLocalMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      let result = await db.getAllMissions();
      
      // Si aucune mission n'est trouvée, charger les données de test
      if (result.length === 0) {
        console.log('📋 Aucune mission trouvée, chargement des données de test...');
        
        // Importer les données de test
        const testMissionsData = await import('../../data/test-missions.json');
        
        // Charger chaque mission dans la base locale
        for (const missionData of testMissionsData.default) {
          console.log(`📋 Chargement de la mission: ${missionData.reference}`);
          
          // Destructurer pour exclure l'id et laisser Dexie générer un nouvel id
          const { id, ...missionDataWithoutId } = missionData;
          
          // Ajouter la mission
          const mission = await db.addMission(missionDataWithoutId);
          
          // Ajouter les constats (findings)
          if (missionData.findings && missionData.findings.length > 0) {
            for (const finding of missionData.findings) {
              await db.addFinding(mission.id, {
                type: finding.type,
                description: finding.description,
                reference_legale: finding.reference_legale,
                recommandation: finding.recommandation,
                delai_correction: finding.delai_correction,
                date_constat: finding.date_constat
              });
            }
          }
          
          // Ajouter les sanctions
          if (missionData.sanctions && missionData.sanctions.length > 0) {
            for (const sanction of missionData.sanctions) {
              await db.addSanction(mission.id, {
                type: sanction.type,
                description: sanction.description,
                amount: sanction.amount,
                decision_date: sanction.decision_date
              });
            }
          }
          
          // Ajouter les remarques
          if (missionData.remarks && missionData.remarks.length > 0) {
            for (const remark of missionData.remarks) {
              await db.addRemark(mission.id, remark.content);
            }
          }
          
          // Ajouter les documents
          if (missionData.documents && missionData.documents.length > 0) {
            for (const document of missionData.documents) {
              await db.addDocument(mission.id, {
                title: document.title,
                type: document.type,
                file_path: document.file_path || '',
                file_name: (document as any).file_name || '',
                file_size: (document as any).file_size || 0,
                file_type: (document as any).file_type || '',
                file_content: (document as any).file_content || ''
              });
            }
          }
        }
        
        // Récupérer les missions après chargement
        result = await db.getAllMissions();
        console.log(`✅ ${result.length} missions chargées depuis les données de test`);
      }
      
      setMissions(result);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des missions:', err);
      setError('Erreur lors de la récupération des missions');
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
      const allMissions = await db.getAllMissions();
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
      const newMission = await db.addMission(missionData);
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
      const result = await db.updateMissionStatuses();
      console.log('Mise à jour des statuts:', result);
      await refreshMissions();
      return result;
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
      const result = await db.checkUpcomingStatusChanges();
      return result;
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