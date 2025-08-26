import React, { useState, useEffect } from 'react';
import { db } from '../database/localStorageDb';
import { Mission } from '../types/mission';
import { DatabaseStatus } from './DatabaseStatus';

export const DebugMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMissions = async () => {
      try {
        setLoading(true);
        console.log('🔍 Debug: Chargement des missions...');
        const result = await db.getAllMissions();
        console.log('📊 Debug: Missions récupérées:', result);
        setMissions(result);
        setError(null);
      } catch (err) {
        console.error('❌ Debug: Erreur lors du chargement:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const result = await db.getAllMissions();
      setMissions(result);
      console.log('🔄 Debug: Missions après rafraîchissement:', result);
    } catch (err) {
      console.error('❌ Debug: Erreur lors du rafraîchissement:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    try {
      const allMissions = await db.getAllMissions();
      for (const mission of allMissions) {
        await db.deleteMission(mission.id);
      }
      setMissions([]);
      console.log('🗑️ Debug: Toutes les missions supprimées');
    } catch (err) {
      console.error('❌ Debug: Erreur lors de la suppression:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Statut de la base de données */}
      <DatabaseStatus />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug - Missions</h1>
        
        <div className="mb-4 flex space-x-4">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Rafraîchir
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Supprimer toutes les missions
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">État du chargement</h2>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Loading:</strong> {loading ? 'Oui' : 'Non'}</p>
            <p><strong>Error:</strong> {error || 'Aucune erreur'}</p>
            <p><strong>Nombre de missions:</strong> {missions.length}</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Chargement en cours...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Aucune mission trouvée.</strong> Utilisez la page d'import pour ajouter des missions de test.
          </div>
        )}

        {missions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Missions ({missions.length})</h2>
            <div className="space-y-2">
              {missions.map((mission) => (
                <div key={mission.id} className="border border-gray-200 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{mission.title}</h3>
                      <p className="text-sm text-gray-600">Réf: {mission.reference}</p>
                      <p className="text-sm text-gray-600">Organisation: {mission.organization}</p>
                      <p className="text-sm text-gray-600">Statut: {mission.status}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>ID: {mission.id}</p>
                      <p>Créé: {new Date(mission.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
