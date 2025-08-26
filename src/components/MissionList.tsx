import React, { useState } from 'react';
import { Mission, Finding } from '../types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PencilIcon, TrashIcon, CalendarIcon, MapPinIcon, UsersIcon, ChatBubbleLeftIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronRightIcon, DocumentIcon, BuildingOfficeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ClockIcon as ClockIconSolid, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { MissionDetails } from './MissionDetails';
import { toast } from 'react-hot-toast';
import { useLocalMissions } from '../hooks/useLocalMissions';
import { db } from '../database/localStorageDb';
import { getSenegalNow, toSenegalTime, formatSenegalDateOnly } from '../utils/timeUtils';

export const MissionList: React.FC = () => {
  const { missions, loading, error, refreshMissions } = useLocalMissions();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newRemark, setNewRemark] = useState('');
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState<string | null>(null);

  console.log('🔄 MissionList - Missions reçues:', missions);
  console.log('📊 Nombre de missions:', missions?.length || 0);

  const handleAddRemark = async (missionId: string, content: string) => {
    if (!content.trim()) {
      toast.error('Veuillez saisir une remarque');
      return;
    }
    try {
      await db.addRemark(missionId, content);
      setNewRemark('');
      toast.success('Remarque ajoutée avec succès');
      refreshMissions();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la remarque:', error);
      toast.error('Erreur lors de l\'ajout de la remarque');
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission?')) {
      try {
        await db.deleteMission(id);
        toast.success('Mission supprimée avec succès');
        refreshMissions();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la mission');
      }
    }
  };

  const handleAddSanction = async (missionId: string, content: string) => {
    try {
      await db.addSanction(missionId, content);
      toast.success('Sanction ajoutée avec succès');
      refreshMissions();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
      toast.error('Erreur lors de l\'ajout de la sanction');
    }
  };

  const handleAddFinding = async (missionId: string, finding: string | Omit<Finding, "id" | "mission_id" | "created_at" | "updated_at">) => {
    try {
      await db.addFinding(missionId, typeof finding === 'string' ? finding : JSON.stringify(finding));
      toast.success('Constat ajouté avec succès');
      refreshMissions();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du constat:', error);
      toast.error('Erreur lors de l\'ajout du constat');
    }
  };

  const handleStatusChange = async (missionId: string, newStatus: string) => {
    try {
      setStatusChangeLoading(missionId);
      const mission = missions.find(m => m.id === missionId);
      if (!mission) {
        toast.error('Mission non trouvée');
        return;
      }

      // Vérifier la cohérence entre le nouveau statut et les dates
      const coherenceCheck = checkStatusDateCoherence(newStatus, mission.start_date, mission.end_date);
      
      if (!coherenceCheck.isCoherent) {
        // Proposer de modifier les dates automatiquement
        const shouldUpdateDates = window.confirm(
          `Incohérence détectée : ${coherenceCheck.message}\n\n` +
          `Voulez-vous que l'application ajuste automatiquement les dates ?\n\n` +
          `Nouvelle date de début : ${coherenceCheck.suggestedStartDate}\n` +
          `Nouvelle date de fin : ${coherenceCheck.suggestedEndDate}`
        );

        if (shouldUpdateDates) {
          const updatedMission = {
            ...mission,
            status: newStatus as any,
            start_date: coherenceCheck.suggestedStartDate,
            end_date: coherenceCheck.suggestedEndDate,
            updated_at: new Date().toISOString()
          };

          await db.updateMission(missionId, updatedMission);
          toast.success(`Statut et dates de la mission mis à jour vers ${getStatusLabel(newStatus)}`);
        } else {
          // L'utilisateur a choisi de ne pas modifier les dates
          const updatedMission = {
            ...mission,
            status: newStatus as any,
            updated_at: new Date().toISOString()
          };

          await db.updateMission(missionId, updatedMission);
          toast.success(`Statut de la mission mis à jour vers ${getStatusLabel(newStatus)} (dates conservées)`);
        }
      } else {
        // Pas d'incohérence, mise à jour normale
        const updatedMission = {
          ...mission,
          status: newStatus as any,
          updated_at: new Date().toISOString()
        };

        await db.updateMission(missionId, updatedMission);
        toast.success(`Statut de la mission mis à jour vers ${getStatusLabel(newStatus)}`);
      }

      refreshMissions();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Erreur lors du changement de statut');
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const checkStatusDateCoherence = (newStatus: string, startDate: string, endDate: string) => {
    const now = getSenegalNow();
    const start = toSenegalTime(startDate);
    const end = toSenegalTime(endDate);
    
    let isCoherent = true;
    let message = '';
    let suggestedStartDate = startDate;
    let suggestedEndDate = endDate;

    switch (newStatus) {
      case 'PLANIFIEE':
        // Une mission planifiée doit avoir des dates futures
        if (start <= now) {
          isCoherent = false;
          message = 'Une mission planifiée doit avoir une date de début future';
          suggestedStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Dans 7 jours
          suggestedEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // Dans 14 jours
        }
        break;

      case 'EN_COURS':
        // Une mission en cours doit avoir une date de début passée et une date de fin future
        if (start > now) {
          isCoherent = false;
          message = 'Une mission en cours doit avoir une date de début passée';
          suggestedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Il y a 7 jours
        }
        if (end <= now) {
          isCoherent = false;
          message = message ? message + ' et une date de fin future' : 'Une mission en cours doit avoir une date de fin future';
          suggestedEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Dans 7 jours
        }
        break;

      case 'TERMINEE':
        // Une mission terminée doit avoir une date de fin passée
        if (end > now) {
          isCoherent = false;
          message = 'Une mission terminée doit avoir une date de fin passée';
          suggestedEndDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(); // Hier
        }
        break;

      case 'ATTENTE_REPONSE':
        // Une mission en attente de réponse doit avoir une date de fin passée
        if (end > now) {
          isCoherent = false;
          message = 'Une mission en attente de réponse doit avoir une date de fin passée';
          suggestedEndDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(); // Hier
        }
        break;

      case 'ANNULEE':
        // Une mission annulée peut avoir n'importe quelle date
        isCoherent = true;
        break;
    }

    return {
      isCoherent,
      message,
      suggestedStartDate,
      suggestedEndDate
    };
  };

  const checkCurrentStatusDateCoherence = (mission: Mission) => {
    return checkStatusDateCoherence(mission.status, mission.start_date, mission.end_date);
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'PLANIFIEE': 'Planifiée',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ATTENTE_REPONSE': 'En attente de réponse',
      'ANNULEE': 'Annulée'
    };
    return statusLabels[status] || status;
  };

  const toggleStatus = (status: string) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  // Grouper les missions par statut
  const missionsByStatus: Record<string, Mission[]> = {};
  missions.forEach(mission => {
    if (!missionsByStatus[mission.status]) {
      missionsByStatus[mission.status] = [];
    }
    missionsByStatus[mission.status].push(mission);
  });

  // Ordre d'affichage des statuts
  const statusOrder = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ATTENTE_REPONSE', 'ANNULEE'];

  // Labels des statuts
  const statusLabels: Record<string, string> = {
    'PLANIFIEE': 'Missions à venir',
    'EN_COURS': 'Missions en cours',
    'TERMINEE': 'Missions terminées',
    'ATTENTE_REPONSE': 'En attente de réponse',
    'ANNULEE': 'Missions annulées'
  };

  // Couleurs des statuts
  const statusColors: Record<string, { bg: string, text: string, border: string }> = {
    'PLANIFIEE': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'EN_COURS': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'TERMINEE': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'ATTENTE_REPONSE': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'ANNULEE': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  };

  // Icônes des statuts
  const statusIcons: Record<string, React.ReactNode> = {
    'PLANIFIEE': <CalendarIcon className="h-5 w-5 text-blue-500" />,
    'EN_COURS': <ClockIcon className="h-5 w-5 text-yellow-500" />,
    'TERMINEE': <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    'ATTENTE_REPONSE': <ClockIconSolid className="h-5 w-5 text-purple-500" />,
    'ANNULEE': <XCircleIcon className="h-5 w-5 text-red-500" />
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Liste des missions de contrôle</h1>
      
      {statusOrder.map(status => {
        const statusMissions = missionsByStatus[status] || [];
        if (statusMissions.length === 0) return null;

        const isExpanded = expandedStatus === status;
        const statusColor = statusColors[status];

        return (
          <div key={status} className="mb-6">
            <div 
              className={`${statusColor.bg} ${statusColor.border} rounded-lg p-4 cursor-pointer hover:bg-opacity-80 transition-colors flex justify-between items-center border-l-4 ${statusColor.border}`}
              onClick={() => toggleStatus(status)}
            >
              <div className="flex items-center">
                <div className="mr-3">
                  {statusIcons[status]}
                </div>
                <h2 className={`text-xl font-bold ${statusColor.text}`}>
                  {statusLabels[status]} ({statusMissions.length})
                </h2>
              </div>
              {isExpanded ? (
                <ChevronDownIcon className={`h-6 w-6 ${statusColor.text}`} />
              ) : (
                <ChevronRightIcon className={`h-6 w-6 ${statusColor.text}`} />
              )}
            </div>

            {isExpanded && (
              <div className="mt-2 space-y-4">
                {statusMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{mission.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">Référence: {mission.reference}</p>
                        </div>
                        <div className="flex space-x-2">
                          {/* Menu de changement de statut */}
                          <div className="relative">
                            <select
                              value={mission.status}
                              onChange={(e) => handleStatusChange(mission.id, e.target.value)}
                              disabled={statusChangeLoading === mission.id}
                              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                            >
                              <option value="PLANIFIEE">Planifiée</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="TERMINEE">Terminée</option>
                              <option value="ATTENTE_REPONSE">En attente</option>
                              <option value="ANNULEE">Annulée</option>
                            </select>
                            <ChevronUpDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            {statusChangeLoading === mission.id && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => setSelectedMission(mission)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Voir les détails"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMission(mission.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Supprimer la mission"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-start">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Organisation</p>
                            <p className="text-sm text-gray-600">{mission.organization}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Adresse</p>
                            <p className="text-sm text-gray-600">{mission.address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Période</p>
                            <p className="text-sm text-gray-600">
                              Du {formatSenegalDateOnly(mission.start_date)} au {formatSenegalDateOnly(mission.end_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <UsersIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Équipe</p>
                            <p className="text-sm text-gray-600">
                              {Array.isArray(mission.team_members) 
                                ? mission.team_members.join(', ') 
                                : mission.team_members || 'Non spécifiée'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {/* Indicateur d'incohérence de dates */}
                          {(() => {
                            const coherenceCheck = checkCurrentStatusDateCoherence(mission);
                            if (!coherenceCheck.isCoherent) {
                              return (
                                <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs border border-red-200">
                                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                  Incohérence de dates
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {mission.documents && mission.documents.length > 0 && (
                            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                              <DocumentIcon className="h-4 w-4 mr-1" />
                              {mission.documents.length} document{mission.documents.length > 1 ? 's' : ''}
                            </div>
                          )}
                          
                          {mission.findings && mission.findings.length > 0 && (
                            <div className="flex items-center bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {mission.findings.length} constat{mission.findings.length > 1 ? 's' : ''}
                            </div>
                          )}
                          
                          {mission.remarks && mission.remarks.length > 0 && (
                            <div className="flex items-center bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs">
                              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                              {mission.remarks.length} remarque{mission.remarks.length > 1 ? 's' : ''}
                            </div>
                          )}
                          
                          {mission.sanctions && mission.sanctions.length > 0 && (
                            <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {mission.sanctions.length} sanction{mission.sanctions.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {selectedMission && (
        <MissionDetails
          mission={selectedMission}
          onAddRemark={handleAddRemark}
          onAddSanction={handleAddSanction}
          onAddFinding={handleAddFinding}
          onUpdate={refreshMissions}
        />
      )}
    </div>
  );
};