import React, { useState, useEffect } from 'react';
import { GlobalSyncService } from '../services/globalSyncService';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';
import { 
  CloudIcon, 
  WifiIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export const GlobalSyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<'connected' | 'offline' | 'syncing'>('offline');
  const [dataIntegrity, setDataIntegrity] = useState<{
    local: Record<string, number>;
    supabase: Record<string, number>;
    differences: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const checkSyncStatus = async () => {
    try {
      const status = GlobalSyncService.getConnectionStatus();
      setSyncStatus(status);
      
      if (status === 'connected') {
        const integrity = await db.verifyDataIntegrity();
        setDataIntegrity(integrity);
      }
    } catch (error) {
      console.error('Erreur vérification statut sync:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      setLoading(true);
      const success = await db.forceGlobalSync();
      
      if (success) {
        toast.success('Synchronisation forcée réussie');
        await checkSyncStatus();
      } else {
        toast.error('Échec de la synchronisation forcée');
      }
    } catch (error) {
      console.error('Erreur synchronisation forcée:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setLoading(true);
      const integrity = await db.verifyDataIntegrity();
      setDataIntegrity(integrity);
      toast.success('Vérification d\'intégrité terminée');
    } catch (error) {
      console.error('Erreur vérification intégrité:', error);
      toast.error('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected':
        return <CloudIcon className="h-5 w-5 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'offline':
        return <WifiIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'connected':
        return 'Connecté à Supabase';
      case 'syncing':
        return 'Synchronisation en cours...';
      case 'offline':
        return 'Mode hors ligne';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'syncing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'offline':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Statut de synchronisation globale
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            Vérifier l'intégrité
          </button>
          <button
            onClick={handleForceSync}
            disabled={loading || syncStatus === 'syncing'}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Sync...' : 'Forcer la sync'}
          </button>
        </div>
      </div>

      {/* Statut de connexion */}
      <div className={`p-4 rounded-lg border ${getStatusColor()} mb-4`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium">{getStatusText()}</span>
        </div>
        {syncStatus === 'connected' && (
          <p className="text-sm mt-2">
            ✅ Toutes les données sont automatiquement sauvegardées dans Supabase
          </p>
        )}
        {syncStatus === 'offline' && (
          <p className="text-sm mt-2">
            ⚠️ Données stockées localement - synchronisation à la reconnexion
          </p>
        )}
      </div>

      {/* Intégrité des données */}
      {dataIntegrity && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Intégrité des données</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Local (navigateur)</h5>
              <div className="space-y-1 text-xs text-blue-700">
                {Object.entries(dataIntegrity.local).map(([key, count]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded">
              <h5 className="text-sm font-medium text-green-800 mb-2">Supabase (cloud)</h5>
              <div className="space-y-1 text-xs text-green-700">
                {Object.entries(dataIntegrity.supabase).map(([key, count]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h5 className="text-sm font-medium text-gray-800 mb-2">Différences</h5>
              <div className="space-y-1 text-xs text-gray-700">
                {Object.entries(dataIntegrity.differences).map(([key, diff]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span>{key}:</span>
                    <div className="flex items-center">
                      {diff === 0 ? (
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <ExclamationTriangleIcon className="h-3 w-3 text-orange-500 mr-1" />
                      )}
                      <span className={`font-medium ${diff === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alertes de différences */}
          {Object.values(dataIntegrity.differences).some(diff => diff !== 0) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">
                    Différences détectées
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Certaines données locales ne sont pas synchronisées avec Supabase. 
                    Cliquez sur "Forcer la sync" pour résoudre.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informations d'accessibilité */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <CloudIcon className="h-5 w-5 text-blue-400 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              Accessibilité globale
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {syncStatus === 'connected' 
                ? '✅ Vos données sont accessibles depuis n\'importe quel appareil connecté à internet'
                : '⚠️ Données disponibles uniquement sur cet appareil (mode hors ligne)'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};