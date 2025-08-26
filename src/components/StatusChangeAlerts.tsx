import React, { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';
import { formatSenegalDateOnly } from '../utils/timeUtils';

interface StatusChangeAlertsProps {
  missions: Mission[];
  onRefresh: () => void;
}

interface UpcomingChanges {
  startingSoon: Mission[];
  endingSoon: Mission[];
}

interface DateEditModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mission: Mission) => void;
  type: 'start' | 'end';
}

const DateEditModal: React.FC<DateEditModalProps> = ({ mission, isOpen, onClose, onSave, type }) => {
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentDate = type === 'start' ? mission.start_date : mission.end_date;
      setNewDate(currentDate.split('T')[0]); // Format YYYY-MM-DD
    }
  }, [isOpen, mission, type]);

  const handleSave = async () => {
    if (!newDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    try {
      setLoading(true);
      const updatedMission = {
        ...mission,
        [type === 'start' ? 'start_date' : 'end_date']: new Date(newDate).toISOString(),
        updated_at: new Date().toISOString()
      };
      await onSave(updatedMission);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification de la date:', error);
      toast.error('Erreur lors de la modification de la date');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Modifier la date de {type === 'start' ? 'début' : 'fin'}
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Mission: <strong>{mission.title}</strong>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Référence: <strong>{mission.reference}</strong>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouvelle date de {type === 'start' ? 'début' : 'fin'}
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const StatusChangeAlerts: React.FC<StatusChangeAlertsProps> = ({ missions, onRefresh }) => {
  const [upcomingChanges, setUpcomingChanges] = useState<UpcomingChanges>({ startingSoon: [], endingSoon: [] });
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [dateEditModal, setDateEditModal] = useState<{
    isOpen: boolean;
    mission: Mission | null;
    type: 'start' | 'end';
  }>({ isOpen: false, mission: null, type: 'start' });

  useEffect(() => {
    const checkChanges = async () => {
      try {
        const changes = await db.checkUpcomingStatusChanges();
        setUpcomingChanges(changes);
      } catch (error) {
        console.error('Erreur lors de la vérification des changements:', error);
      }
    };

    checkChanges();
    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkChanges, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [missions]);

  const handleApproveChange = async (mission: Mission, newStatus: string) => {
    try {
      setLoading(true);
      setPendingActions(prev => new Set(prev).add(mission.id));

      // Mettre à jour le statut de la mission
      const updatedMission = { ...mission, status: newStatus as Mission['status'], updated_at: new Date().toISOString() };
      await db.updateMission(mission.id, updatedMission);

      // Rafraîchir les données
      await onRefresh();
      
      toast.success(`Statut de la mission ${mission.reference} mis à jour vers ${newStatus}`);
      
      // Retirer de la liste des actions en cours
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(mission.id);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(mission.id);
        return newSet;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectChange = async (mission: Mission) => {
    try {
      setLoading(true);
      setPendingActions(prev => new Set(prev).add(mission.id));

      // Marquer la mission comme "ignorée" pour cette session
      const updatedMission = { 
        ...mission, 
        updated_at: new Date().toISOString(),
        // Ajouter un flag pour ignorer les changements automatiques
        ignoreAutoStatusChange: true
      };
      await db.updateMission(mission.id, updatedMission);

      // Rafraîchir les données
      await onRefresh();
      
      toast.success(`Changement de statut ignoré pour la mission ${mission.reference}`);
      
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(mission.id);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur lors de l\'ignorance du changement:', error);
      toast.error('Erreur lors de l\'ignorance du changement');
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(mission.id);
        return newSet;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateEdit = async (updatedMission: Mission) => {
    try {
      await db.updateMission(updatedMission.id, updatedMission);
      await onRefresh();
      toast.success(`Date de la mission ${updatedMission.reference} modifiée avec succès`);
    } catch (error) {
      console.error('Erreur lors de la modification de la date:', error);
      toast.error('Erreur lors de la modification de la date');
    }
  };

  const openDateEditModal = (mission: Mission, type: 'start' | 'end') => {
    setDateEditModal({ isOpen: true, mission, type });
  };

  const closeDateEditModal = () => {
    setDateEditModal({ isOpen: false, mission: null, type: 'start' });
  };

  const handleAutoUpdate = async () => {
    try {
      setLoading(true);
      const result = await db.updateMissionStatuses();
      await onRefresh();
      
      if (result.updated > 0) {
        toast.success(`${result.updated} missions mises à jour automatiquement`);
      } else {
        toast.success('Aucune mission à mettre à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour automatique:', error);
      toast.error('Erreur lors de la mise à jour automatique');
    } finally {
      setLoading(false);
    }
  };

  const totalAlerts = upcomingChanges.startingSoon.length + upcomingChanges.endingSoon.length;

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Alertes de changement de statut ({totalAlerts})
          </h2>
          <button
            onClick={handleAutoUpdate}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
          >
            {loading ? 'Mise à jour...' : 'Mise à jour automatique'}
          </button>
        </div>

        {/* Missions qui vont commencer */}
        {upcomingChanges.startingSoon.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-blue-600 mb-3">
              🚀 Missions qui vont commencer ({upcomingChanges.startingSoon.length})
            </h3>
            <div className="space-y-3">
              {upcomingChanges.startingSoon.map((mission) => (
                <div key={mission.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{mission.title}</h4>
                      <p className="text-sm text-gray-600">Réf: {mission.reference}</p>
                      <p className="text-sm text-gray-600">Organisation: {mission.organization}</p>
                      <p className="text-sm text-blue-600">
                        Date de début: {formatSenegalDateOnly(mission.start_date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Statut actuel: <span className="font-medium text-orange-600">{mission.status}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openDateEditModal(mission, 'start')}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                        title="Modifier la date de début"
                      >
                        📅
                      </button>
                      <button
                        onClick={() => handleApproveChange(mission, 'EN_COURS')}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                      >
                        {pendingActions.has(mission.id) ? '...' : 'Valider'}
                      </button>
                      <button
                        onClick={() => handleRejectChange(mission)}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                      >
                        {pendingActions.has(mission.id) ? '...' : 'Ignorer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missions qui vont se terminer */}
        {upcomingChanges.endingSoon.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-red-600 mb-3">
              ⏰ Missions qui vont se terminer ({upcomingChanges.endingSoon.length})
            </h3>
            <div className="space-y-3">
              {upcomingChanges.endingSoon.map((mission) => (
                <div key={mission.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{mission.title}</h4>
                      <p className="text-sm text-gray-600">Réf: {mission.reference}</p>
                      <p className="text-sm text-gray-600">Organisation: {mission.organization}</p>
                      <p className="text-sm text-red-600">
                        Date de fin: {new Date(mission.end_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Statut actuel: <span className="font-medium text-blue-600">{mission.status}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openDateEditModal(mission, 'end')}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
                        title="Modifier la date de fin"
                      >
                        📅
                      </button>
                      <button
                        onClick={() => handleApproveChange(mission, 'TERMINEE')}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                      >
                        {pendingActions.has(mission.id) ? '...' : 'Valider'}
                      </button>
                      <button
                        onClick={() => handleRejectChange(mission)}
                        disabled={loading || pendingActions.has(mission.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                      >
                        {pendingActions.has(mission.id) ? '...' : 'Ignorer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de modification de date */}
      {dateEditModal.mission && (
        <DateEditModal
          mission={dateEditModal.mission}
          isOpen={dateEditModal.isOpen}
          onClose={closeDateEditModal}
          onSave={handleDateEdit}
          type={dateEditModal.type}
        />
      )}
    </>
  );
};
