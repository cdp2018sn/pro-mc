import React, { useState, useEffect } from 'react';
import { Mission, Finding, Sanction, SanctionType } from '../types/mission';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';

interface MissionDetailsProps {
  mission: Mission;
  onAddRemark: (missionId: string, content: string) => Promise<void>;
  onAddSanction: (missionId: string, sanction: string | any) => Promise<void>;
  onAddFinding: (missionId: string, finding: string | any) => Promise<void>;
  onUpdate?: () => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({
  mission,
  onAddRemark,
  onAddSanction,
  onAddFinding,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'findings' | 'sanctions' | 'remarks' | 'documents'>('details');
  const [newRemark, setNewRemark] = useState('');
  const [newSanction, setNewSanction] = useState({
    type: 'AVERTISSEMENT' as SanctionType,
    description: '',
    amount: '',
    decision_date: new Date().toISOString().split('T')[0]
  });
  const [newFinding, setNewFinding] = useState({
    type: 'OBSERVATION' as Finding['type'],
    description: '',
    reference_legale: '',
    recommandation: '',
    delai_correction: '',
    date_constat: new Date().toISOString().split('T')[0]
  });
  const [editingSanction, setEditingSanction] = useState<string | null>(null);
  const [editSanctionData, setEditSanctionData] = useState<Partial<Sanction>>({});

  const getSanctionTypeLabel = (type: SanctionType): string => {
    switch (type) {
      case 'AVERTISSEMENT':
        return 'Avertissement';
      case 'MISE_EN_DEMEURE':
        return 'Mise en demeure';
      case 'PECUNIAIRE':
        return 'Sanction pécuniaire';
      case 'INJONCTION':
        return 'Injonction';
      case 'RESTRICTION_TRAITEMENT':
        return 'Restriction de traitement';
      default:
        return type;
    }
  };

  const getSanctionTypeClass = (type: SanctionType): string => {
    switch (type) {
      case 'AVERTISSEMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'MISE_EN_DEMEURE':
        return 'bg-orange-100 text-orange-800';
      case 'PECUNIAIRE':
        return 'bg-red-100 text-red-800';
      case 'INJONCTION':
        return 'bg-blue-100 text-blue-800';
      case 'RESTRICTION_TRAITEMENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    try {
      await onAddRemark(mission.id, newRemark);
      setNewRemark('');
      toast.success('Remarque ajoutée avec succès');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la remarque:', error);
      toast.error('Erreur lors de l\'ajout de la remarque');
    }
  };

  const handleAddSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSanction.description.trim()) return;

    try {
      const sanctionData = {
        type: newSanction.type,
        description: newSanction.description,
        amount: newSanction.type === 'PECUNIAIRE' && newSanction.amount ? parseFloat(newSanction.amount) : undefined,
        decision_date: newSanction.decision_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onAddSanction(mission.id, sanctionData);
      setNewSanction({
        type: 'AVERTISSEMENT',
        description: '',
        amount: '',
        decision_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Sanction ajoutée avec succès');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
      toast.error('Erreur lors de l\'ajout de la sanction');
    }
  };

  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinding.description.trim()) return;

    try {
      const findingData = {
        type: newFinding.type,
        description: newFinding.description,
        reference_legale: newFinding.reference_legale,
        recommandation: newFinding.recommandation,
        delai_correction: newFinding.delai_correction ? parseInt(newFinding.delai_correction) : undefined,
        date_constat: newFinding.date_constat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onAddFinding(mission.id, findingData);
      setNewFinding({
        type: 'OBSERVATION',
        description: '',
        reference_legale: '',
        recommandation: '',
        delai_correction: '',
        date_constat: new Date().toISOString().split('T')[0]
      });
      toast.success('Constat ajouté avec succès');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du constat:', error);
      toast.error('Erreur lors de l\'ajout du constat');
    }
  };

  const handleEditSanction = (sanction: Sanction) => {
    setEditingSanction(sanction.id);
    setEditSanctionData({
      type: sanction.type,
      description: sanction.description,
      amount: sanction.amount,
      decision_date: sanction.decision_date
    });
  };

  const handleSaveSanction = async () => {
    if (!editingSanction) return;

    try {
      await db.updateSanction(editingSanction, editSanctionData);
      setEditingSanction(null);
      setEditSanctionData({});
      toast.success('Sanction mise à jour avec succès');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sanction:', error);
      toast.error('Erreur lors de la mise à jour de la sanction');
    }
  };

  const handleDeleteSanction = async (sanctionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette sanction ?')) {
      return;
    }

    try {
      await db.deleteSanction(sanctionId);
      toast.success('Sanction supprimée avec succès');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de la suppression de la sanction:', error);
      toast.error('Erreur lors de la suppression de la sanction');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Organisation</p>
                    <p className="text-gray-900">{mission.organization}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Adresse</p>
                    <p className="text-gray-900">{mission.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Période</p>
                    <p className="text-gray-900">
                      Du {format(new Date(mission.start_date), 'dd MMMM yyyy', { locale: fr })} 
                      au {format(new Date(mission.end_date), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <UsersIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Équipe</p>
                    <div className="space-y-1">
                      {Array.isArray(mission.team_members) ? (
                        mission.team_members.map((member, index) => (
                          <p key={index} className="text-gray-900">{member}</p>
                        ))
                      ) : (
                        <p className="text-gray-900">{mission.team_members || 'Non spécifiée'}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Objectifs</p>
                    <div className="space-y-1">
                      {Array.isArray(mission.objectives) ? (
                        mission.objectives.map((objective, index) => (
                          <p key={index} className="text-gray-900">• {objective}</p>
                        ))
                      ) : (
                        <p className="text-gray-900">{mission.objectives || 'Non spécifiés'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-900">{mission.description}</p>
            </div>
          </div>
        );

      case 'findings':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {mission.findings && mission.findings.length > 0 ? (
                mission.findings.map((finding) => (
                  <div key={finding.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          finding.type === 'NON_CONFORMITE_MAJEURE' ? 'bg-red-100 text-red-800' :
                          finding.type === 'NON_CONFORMITE_MINEURE' ? 'bg-orange-100 text-orange-800' :
                          finding.type === 'OBSERVATION' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {finding.type === 'NON_CONFORMITE_MAJEURE' ? 'Non-conformité majeure' :
                           finding.type === 'NON_CONFORMITE_MINEURE' ? 'Non-conformité mineure' :
                           finding.type === 'OBSERVATION' ? 'Observation' :
                           'Point conforme'}
                        </span>
                        <p className="text-gray-900 font-medium">{finding.description}</p>
                        {finding.reference_legale && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Référence légale:</span> {finding.reference_legale}
                          </p>
                        )}
                        {finding.recommandation && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Recommandation:</span> {finding.recommandation}
                          </p>
                        )}
                        {finding.delai_correction && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Délai de correction:</span> {finding.delai_correction} jours
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(finding.date_constat), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun constat enregistré</p>
              )}
            </div>

            <form onSubmit={handleAddFinding} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ajouter un constat</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de constat</label>
                  <select
                    value={newFinding.type}
                    onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value as Finding['type'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="NON_CONFORMITE_MAJEURE">Non-conformité majeure</option>
                    <option value="NON_CONFORMITE_MINEURE">Non-conformité mineure</option>
                    <option value="OBSERVATION">Observation</option>
                    <option value="POINT_CONFORME">Point conforme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newFinding.description}
                    onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence légale</label>
                    <input
                      type="text"
                      value={newFinding.reference_legale}
                      onChange={(e) => setNewFinding({ ...newFinding, reference_legale: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date du constat</label>
                    <input
                      type="date"
                      value={newFinding.date_constat}
                      onChange={(e) => setNewFinding({ ...newFinding, date_constat: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Ajouter le constat
                </button>
              </div>
            </form>
          </div>
        );

      case 'sanctions':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {mission.sanctions && mission.sanctions.length > 0 ? (
                mission.sanctions.map((sanction) => (
                  <div key={sanction.id} className="bg-gray-50 rounded-lg p-4">
                    {editingSanction === sanction.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Type de sanction</label>
                          <select
                            value={editSanctionData.type || sanction.type}
                            onChange={(e) => setEditSanctionData({ ...editSanctionData, type: e.target.value as SanctionType })}
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
                            value={editSanctionData.description || sanction.description}
                            onChange={(e) => setEditSanctionData({ ...editSanctionData, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        {(editSanctionData.type === 'PECUNIAIRE' || sanction.type === 'PECUNIAIRE') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                            <input
                              type="number"
                              value={editSanctionData.amount || sanction.amount || ''}
                              onChange={(e) => setEditSanctionData({ ...editSanctionData, amount: parseFloat(e.target.value) })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date de décision</label>
                          <input
                            type="date"
                            value={editSanctionData.decision_date || sanction.decision_date}
                            onChange={(e) => setEditSanctionData({ ...editSanctionData, decision_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveSanction}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingSanction(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSanctionTypeClass(sanction.type)}`}>
                            {getSanctionTypeLabel(sanction.type)}
                          </span>
                          <p className="text-gray-900 font-medium">{sanction.description}</p>
                          {sanction.amount && (
                            <p className="text-sm text-red-600 font-medium">
                              Montant: {sanction.amount.toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Décision du {format(new Date(sanction.decision_date), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSanction(sanction)}
                            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            title="Modifier la sanction"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSanction(sanction.id)}
                            className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            title="Supprimer la sanction"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune sanction enregistrée</p>
              )}
            </div>

            <form onSubmit={handleAddSanction} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ajouter une sanction</h4>
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
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>

                {newSanction.type === 'PECUNIAIRE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                    <input
                      type="number"
                      value={newSanction.amount}
                      onChange={(e) => setNewSanction({ ...newSanction, amount: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
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
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Ajouter la sanction
                </button>
              </div>
            </form>
          </div>
        );

      case 'remarks':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {mission.remarks && mission.remarks.length > 0 ? (
                mission.remarks.map((remark) => (
                  <div key={remark.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{remark.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(remark.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune remarque enregistrée</p>
              )}
            </div>

            <form onSubmit={handleAddRemark} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Ajouter une remarque</h4>
              <div className="space-y-4">
                <textarea
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Saisissez votre remarque..."
                  required
                />
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Ajouter la remarque
                </button>
              </div>
            </form>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {mission.documents && mission.documents.length > 0 ? (
                mission.documents.map((document) => (
                  <div key={document.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                        <p className="text-sm text-gray-500">
                          {document.type} • Ajouté le {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun document ajouté</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      <div className="p-6">
        {/* En-tête de la mission */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mission.title}</h1>
              <p className="text-sm text-gray-500">Référence: {mission.reference}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              mission.status === 'PLANIFIEE' ? 'bg-blue-100 text-blue-800' :
              mission.status === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
              mission.status === 'TERMINEE' ? 'bg-green-100 text-green-800' :
              mission.status === 'ATTENTE_REPONSE' ? 'bg-purple-100 text-purple-800' :
              'bg-red-100 text-red-800'
            }`}>
              {mission.status === 'PLANIFIEE' ? 'Planifiée' :
               mission.status === 'EN_COURS' ? 'En cours' :
               mission.status === 'TERMINEE' ? 'Terminée' :
               mission.status === 'ATTENTE_REPONSE' ? 'En attente de réponse' :
               'Annulée'}
            </span>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', label: 'Détails', icon: DocumentTextIcon },
              { id: 'findings', label: 'Constats', icon: ExclamationTriangleIcon, count: mission.findings?.length },
              { id: 'sanctions', label: 'Sanctions', icon: ExclamationTriangleIcon, count: mission.sanctions?.length },
              { id: 'remarks', label: 'Remarques', icon: ChatBubbleLeftIcon, count: mission.remarks?.length },
              { id: 'documents', label: 'Documents', icon: DocumentTextIcon, count: mission.documents?.length }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        {renderTabContent()}
      </div>
    </div>
  );
};