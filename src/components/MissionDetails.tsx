import React, { useState, useEffect } from 'react';
import { Mission, Remark, Sanction, SanctionType, Finding, FindingType, Document as MissionDocument, DocumentType } from '../types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FindingsForm } from './FindingsForm';
import { MissionDocuments } from './MissionDocuments';
import { TrashIcon, EyeIcon, DocumentTextIcon, DocumentDuplicateIcon, DocumentCheckIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';

interface MissionDetailsProps {
  mission: Mission;
  onAddRemark: (missionId: string, content: string) => Promise<void>;
  onAddSanction: (missionId: string, content: string) => Promise<void>;
  onAddFinding: (missionId: string, finding: string | Omit<Finding, "id" | "mission_id" | "created_at" | "updated_at">) => Promise<void>;
  onUpdate: () => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({ 
  mission: initialMission, 
  onAddRemark, 
  onAddSanction, 
  onAddFinding,
  onUpdate
}) => {
  const [mission, setMission] = useState<Mission>(initialMission);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editStartDate, setEditStartDate] = useState<string>(initialMission.start_date ? initialMission.start_date.split('T')[0] : '');
  const [editEndDate, setEditEndDate] = useState<string>(initialMission.end_date ? initialMission.end_date.split('T')[0] : '');
  const [activeTab, setActiveTab] = useState<'details' | 'findings' | 'documents' | 'sanctions'>('details');
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [documents, setDocuments] = useState<MissionDocument[]>([]);
  const [newSanction, setNewSanction] = useState({
    type: 'AVERTISSEMENT' as SanctionType,
    description: '',
    decision_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });

  // Charger les sanctions initiales et les documents
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les sanctions
        const sanctions = await db.getSanctionsForMission(mission.id);
        
        // Charger les documents
        const docs = await db.getDocumentsForMission(mission.id);
        setDocuments(docs);
        
        // Charger la mission mise à jour
        const allMissions = await db.getAllMissions();
        const updatedMission = allMissions.find(m => m.id === mission.id);
        
        if (updatedMission) {
          setMission(prevMission => ({
            ...prevMission,
            ...updatedMission,
            sanctions
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    loadData();
  }, [mission.id]);

  // Synchroniser les champs d'édition quand la mission change
  useEffect(() => {
    setEditStartDate(mission.start_date ? mission.start_date.split('T')[0] : '');
    setEditEndDate(mission.end_date ? mission.end_date.split('T')[0] : '');
  }, [mission.start_date, mission.end_date]);

  const handleSaveDates = async () => {
    try {
      const updatedMission: Mission = {
        ...mission,
        start_date: new Date(editStartDate).toISOString(),
        end_date: new Date(editEndDate).toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.updateMission(mission.id, updatedMission);
      setMission(updatedMission);
      setIsEditingDates(false);
      onUpdate();
      toast.success('Dates de la mission mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dates:', error);
      toast.error('Erreur lors de la mise à jour des dates');
    }
  };

  const handleDeleteSanction = async (sanctionId: string) => {
    try {
      await db.deleteSanction(sanctionId);
      // Rafraîchir les données de la mission
      const sanctions = await db.getSanctionsForMission(mission.id);
      setMission(prevMission => ({
        ...prevMission,
        sanctions
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de la sanction:', error);
    }
  };

  const handleAddSanction = async (missionId: string, sanction: Omit<Sanction, 'id' | 'mission_id' | 'created_at' | 'updated_at'>) => {
    try {
      // S'assurer que la date de décision est au format ISO
      const formattedSanction = {
        ...sanction,
        decision_date: new Date(sanction.decision_date).toISOString()
      };

      await onAddSanction(missionId, JSON.stringify(formattedSanction));
      setShowSanctionForm(false);
      // Rafraîchir les données de la mission
      const missions = await db.getAllMissions();
      const updatedMission = missions.find(m => m.id === missionId);
      if (updatedMission) {
        const sanctions = await db.getSanctionsForMission(missionId);
        setMission(prevMission => ({
          ...prevMission,
          ...updatedMission,
          sanctions
        }));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
      toast.error('Erreur lors de l\'ajout de la sanction');
    }
  };

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Référence</p>
            <p className="text-sm text-gray-900">{mission.reference}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Type de mission</p>
            <p className="text-sm text-gray-900">{mission.type_mission}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Statut</p>
            <p className="text-sm text-gray-900">
              {mission.status === 'PLANIFIEE' ? 'Planifiée' :
               mission.status === 'EN_COURS' ? 'En cours' :
               mission.status === 'TERMINEE' ? 'Terminée' :
               mission.status === 'ATTENTE_REPONSE' ? 'Attente de réponse' : 'Annulée'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Organisation</p>
            <p className="text-sm text-gray-900">{mission.organization}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date de début</p>
            {!isEditingDates ? (
              <p className="text-sm text-gray-900">
                {format(new Date(mission.start_date), 'dd/MM/yyyy', { locale: fr })}
              </p>
            ) : (
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date de fin</p>
            {!isEditingDates ? (
              <p className="text-sm text-gray-900">
                {format(new Date(mission.end_date), 'dd/MM/yyyy', { locale: fr })}
              </p>
            ) : (
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Motif de contrôle</p>
            <p className="text-sm text-gray-900">{mission.motif_controle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Adresse</p>
            <p className="text-sm text-gray-900">{mission.address}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          {!isEditingDates ? (
            <button
              onClick={() => setIsEditingDates(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Modifier les dates
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditingDates(false);
                  setEditStartDate(mission.start_date ? mission.start_date.split('T')[0] : '');
                  setEditEndDate(mission.end_date ? mission.end_date.split('T')[0] : '');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveDates}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section Documents */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents de la mission</h3>
        {documents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOpenDocument(doc)}
              >
                <div className="flex items-center">
                  {getDocumentIcon(doc.type)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Type:</span> {getDocumentTypeLabel(doc.type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Date d'ajout:</span> {format(new Date(doc.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-blue-500">
                  <EyeIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm">Voir</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun document disponible</p>
        )}
      </div>
    </div>
  );

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'RAPPORT_CONTROLE':
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case 'LETTRE_NOTIFICATION':
        return <DocumentDuplicateIcon className="h-6 w-6 text-yellow-500" />;
      case 'LETTRE_REPONSE':
        return <DocumentCheckIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'RAPPORT_CONTROLE':
        return 'Rapport de mission de contrôle';
      case 'LETTRE_NOTIFICATION':
        return 'Lettre de notification des manquements';
      case 'LETTRE_REPONSE':
        return 'Lettre de réponse du responsable de traitement';
      default:
        return 'Autre document';
    }
  };

  const handleOpenDocument = (document: MissionDocument) => {
    if (document.file_content) {
      // Créer un blob à partir du contenu base64
      const byteString = atob(document.file_content.split(',')[1]);
      const mimeString = document.file_content.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    } else {
      toast.error('Le contenu du document n\'est pas disponible');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{mission.title}</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('findings')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'findings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Constats
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents & Réponses
            </button>
            <button
              onClick={() => setActiveTab('sanctions')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'sanctions'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sanctions
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'details' && (
          renderDetails()
        )}

        {activeTab === 'findings' && (
          <FindingsForm
            missionId={mission.id}
            onAddFinding={onAddFinding}
            existingFindings={mission.findings}
          />
        )}

        {activeTab === 'documents' && (
          <MissionDocuments
            missionId={mission.id}
            onUpdate={onUpdate}
          />
        )}

        {activeTab === 'sanctions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sanctions</h3>
              <button
                onClick={() => setShowSanctionForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Ajouter une sanction
              </button>
            </div>

            {showSanctionForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-4">Nouvelle sanction</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de sanction</label>
                    <select
                      value={newSanction.type}
                      onChange={(e) => setNewSanction({ ...newSanction, type: e.target.value as SanctionType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="AVERTISSEMENT">Avertissement</option>
                      <option value="MISE_EN_DEMEURE">Mise en demeure</option>
                      <option value="PECUNIAIRE">Sanction pécuniaire</option>
                      <option value="INJONCTION">Injonction</option>
                      <option value="RESTRICTION_TRAITEMENT">Restriction de traitement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newSanction.description}
                      onChange={(e) => setNewSanction({ ...newSanction, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  {(newSanction.type === 'PECUNIAIRE') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                      <input
                        type="number"
                        value={newSanction.amount}
                        onChange={(e) => setNewSanction({ ...newSanction, amount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        min="0"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de décision</label>
                    <input
                      type="date"
                      value={newSanction.decision_date}
                      onChange={(e) => setNewSanction({ ...newSanction, decision_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowSanctionForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleAddSanction(mission.id, newSanction)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {mission.sanctions && mission.sanctions.length > 0 ? (
                mission.sanctions.map((sanction) => (
                  <div key={sanction.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          sanction.type === 'AVERTISSEMENT' ? 'bg-yellow-100 text-yellow-800' :
                          sanction.type === 'MISE_EN_DEMEURE' ? 'bg-orange-100 text-orange-800' :
                          sanction.type === 'PECUNIAIRE' ? 'bg-red-100 text-red-800' :
                          sanction.type === 'INJONCTION' ? 'bg-blue-100 text-blue-800' :
                          sanction.type === 'RESTRICTION_TRAITEMENT' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {sanction.type === 'AVERTISSEMENT' ? 'Avertissement' :
                           sanction.type === 'MISE_EN_DEMEURE' ? 'Mise en demeure' :
                           sanction.type === 'PECUNIAIRE' ? 'Sanction pécuniaire' :
                           sanction.type === 'INJONCTION' ? 'Injonction' :
                           sanction.type === 'RESTRICTION_TRAITEMENT' ? 'Restriction de traitement' :
                           'Sanction pécuniaire'}
                        </span>
                        <p className="mt-2 text-gray-700">{sanction.description}</p>
                        {(sanction.type === 'PECUNIAIRE') && sanction.amount && (
                          <p className="mt-1 text-sm font-medium text-red-600">
                            Montant: {sanction.amount.toLocaleString('fr-FR')} FCFA
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          Décision du {sanction.decision_date ? format(new Date(sanction.decision_date), 'dd/MM/yyyy', { locale: fr }) : 'Date non disponible'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSanction(sanction.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune sanction</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};