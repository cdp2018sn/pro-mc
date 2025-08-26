import React, { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';

export const IgnoredMissions: React.FC = () => {
  const [ignoredMissions, setIgnoredMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIgnoredMissions();
  }, []);

  const loadIgnoredMissions = async () => {
    try {
      setLoading(true);
      const allMissions = await db.getAllMissions();
      const ignored = allMissions.filter(mission => mission.ignoreAutoStatusChange);
      setIgnoredMissions(ignored);
    } catch (error) {
      console.error('Erreur lors du chargement des missions ignorées:', error);
      toast.error('Erreur lors du chargement des missions ignorées');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (mission: Mission) => {
    try {
      const updatedMission = { 
        ...mission, 
        ignoreAutoStatusChange: false,
        updated_at: new Date().toISOString()
      };
      await db.updateMission(mission.id, updatedMission);
      
      toast.success(`Mission ${mission.reference} réactivée pour les changements automatiques`);
      await loadIgnoredMissions();
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      toast.error('Erreur lors de la réactivation');
    }
  };

  const handleReactivateAll = async () => {
    try {
      for (const mission of ignoredMissions) {
        const updatedMission = { 
          ...mission, 
          ignoreAutoStatusChange: false,
          updated_at: new Date().toISOString()
        };
        await db.updateMission(mission.id, updatedMission);
      }
      
      toast.success(`${ignoredMissions.length} missions réactivées`);
      await loadIgnoredMissions();
    } catch (error) {
      console.error('Erreur lors de la réactivation de toutes les missions:', error);
      toast.error('Erreur lors de la réactivation');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-2">Chargement des missions ignorées...</span>
        </div>
      </div>
    );
  }

  if (ignoredMissions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Missions ignorées ({ignoredMissions.length})
        </h2>
        <button
          onClick={handleReactivateAll}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Réactiver toutes
        </button>
      </div>

      <div className="space-y-3">
        {ignoredMissions.map((mission) => (
          <div key={mission.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{mission.title}</h4>
                <p className="text-sm text-gray-600">Réf: {mission.reference}</p>
                <p className="text-sm text-gray-600">Organisation: {mission.organization}</p>
                <p className="text-sm text-gray-500">
                  Statut: <span className="font-medium">{mission.status}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Dernière mise à jour: {new Date(mission.updated_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => handleReactivate(mission)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Réactiver
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
