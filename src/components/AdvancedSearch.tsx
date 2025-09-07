import React, { useState } from 'react';
import { Mission, MissionStatus, MissionType, FindingType, SanctionType, Finding } from '../types/mission';
import { MissionDetails } from './MissionDetails';
import { db } from '../database/localStorageDb';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SearchFilters {
  reference?: string;
  title?: string;
  type_mission?: MissionType;
  status?: MissionStatus;
  organization?: string;
  start_date?: string;
  end_date?: string;
  finding_type?: FindingType;
  sanction_type?: SanctionType;
  motif_controle?: string;
}

interface AdvancedSearchProps {
  missions: Mission[];
  onSearch: (filters: SearchFilters) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ missions, onSearch }) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentMissions, setCurrentMissions] = useState<Mission[]>(missions);

  // Mettre à jour les missions locales quand les props changent
  React.useEffect(() => {
    setCurrentMissions(missions);
    console.log('📋 Missions mises à jour dans AdvancedSearch:', missions?.length || 0);
  }, [missions]);



  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchResults([]);
    onSearch({});
  };

  const refreshData = async () => {
    try {
      const allMissions = await db.getAllMissions();
      setCurrentMissions(allMissions);
      console.log('🔄 Données rafraîchies:', allMissions?.length || 0, 'missions');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setCurrentMissions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = currentMissions.filter(mission => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        switch (key) {
          case 'reference':
            return mission.reference.toLowerCase().includes(value.toLowerCase());
          case 'title':
            return mission.title.toLowerCase().includes(value.toLowerCase());
          case 'type_mission':
            return mission.type_mission === value;
          case 'status':
            return mission.status === value;
          case 'organization':
            return mission.organization.toLowerCase().includes(value.toLowerCase());
          case 'start_date':
            return new Date(mission.start_date) >= new Date(value);
          case 'end_date':
            return new Date(mission.end_date) <= new Date(value);
          case 'finding_type':
            return mission.findings?.some(finding => finding.type === value);
          case 'sanction_type':
            return mission.sanctions?.some(sanction => sanction.type === value);
          case 'motif_controle':
            return mission.motif_controle === value;
          default:
            return true;
        }
      });
    });
    
    setSearchResults(results);
    onSearch(filters);
  };

  const handleAddRemark = async (missionId: string, content: string) => {
    try {
      await db.addRemark(missionId, content);
      // Rafraîchir toutes les missions depuis la base de données
      const allMissions = await db.getAllMissions();
      setCurrentMissions(allMissions);
      
      // Rafraîchir les résultats de recherche
      const updatedMission = allMissions.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la remarque:', error);
    }
  };

  const handleAddSanction = async (missionId: string, sanction: string | any) => {
    try {
      await db.addSanction(missionId, sanction);
      // Rafraîchir toutes les missions depuis la base de données
      const allMissions = await db.getAllMissions();
      setCurrentMissions(allMissions);
      
      // Rafraîchir les résultats de recherche
      const updatedMission = allMissions.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
    }
  };

  const handleAddFinding = async (missionId: string, finding: any) => {
    try {
      if (typeof finding === 'string') {
        // Si c'est une chaîne, créer un objet finding
        await db.addFinding(missionId, {
          type: 'OBSERVATION',
          description: finding,
          reference_legale: '',
          recommandation: '',
          delai_correction: 30,
          date_constat: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Si c'est déjà un objet, l'utiliser directement
        await db.addFinding(missionId, finding);
      }
      // Rafraîchir toutes les missions depuis la base de données
      const allMissions = await db.getAllMissions();
      setCurrentMissions(allMissions);
      
      // Rafraîchir les résultats de recherche
      const updatedMission = allMissions.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du constat:', error);
    }
  };

  const getStatusLabel = (status: MissionStatus) => {
    switch (status) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return status;
    }
  };

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'PLANIFIEE': return 'bg-blue-100 text-blue-800';
      case 'EN_COURS': return 'bg-orange-100 text-orange-800';
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de recherche */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MagnifyingGlassIcon className="h-6 w-6 mr-2 text-orange-500" />
            Recherche avancée
          </h2>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={refreshData}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              title="Rafraîchir les données"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              {showAdvancedFilters ? 'Masquer' : 'Afficher'} les filtres avancés
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Filtres de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                name="reference"
                value={filters.reference || ''}
                onChange={handleFilterChange}
                placeholder="Entrez la référence..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                name="title"
                value={filters.title || ''}
                onChange={handleFilterChange}
                placeholder="Entrez le titre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
              <input
                type="text"
                name="organization"
                value={filters.organization || ''}
                onChange={handleFilterChange}
                placeholder="Entrez l'organisation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres avancés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de Mission</label>
                  <select
                    name="type_mission"
                    value={filters.type_mission || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les types</option>
                    <option value="Contrôle sur place">Contrôle sur place</option>
                    <option value="Contrôle sur pièces">Contrôle sur pièces</option>
                    <option value="Contrôle en ligne">Contrôle en ligne</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    name="status"
                    value={filters.status || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motif de contrôle</label>
                  <select
                    name="motif_controle"
                    value={filters.motif_controle || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les motifs</option>
                    <option value="CONTROLE_ROUTINIER">Contrôle routinier</option>
                    <option value="PLAINTE">Plainte</option>
                    <option value="SIGNALEMENT">Signalement</option>
                    <option value="INSPECTION">Inspection</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de constat</label>
                  <select
                    name="finding_type"
                    value={filters.finding_type || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les types</option>
                    <option value="NON_CONFORMITE_MAJEURE">Non-conformité majeure</option>
                    <option value="NON_CONFORMITE_MINEURE">Non-conformité mineure</option>
                    <option value="OBSERVATION">Observation</option>
                    <option value="POINT_CONFORME">Point conforme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de sanction</label>
                  <select
                    name="sanction_type"
                    value={filters.sanction_type || ''}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les types</option>
                    <option value="AVERTISSEMENT">Avertissement</option>
                    <option value="MISE_EN_DEMEURE">Mise en demeure</option>
                    <option value="PECUNIAIRE">Sanction pécuniaire</option>
                    <option value="INJONCTION">Injonction</option>
                    <option value="RESTRICTION_TRAITEMENT">Restriction de traitement</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Rechercher
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Effacer
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="text-sm text-gray-600">
                {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Résultats de la recherche ({searchResults.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((mission) => (
                  <tr 
                    key={mission.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mission.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mission.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mission.organization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                        {getStatusLabel(mission.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(mission.start_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMission(mission);
                        }}
                        className="text-orange-600 hover:text-orange-900 font-medium"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {searchResults.length === 0 && Object.keys(filters).some(key => filters[key as keyof SearchFilters]) && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        </div>
      )}

      {/* Modal des détails de mission */}
      {selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Détails de la mission - {selectedMission.title}
              </h2>
              <button
                onClick={() => setSelectedMission(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <MissionDetails
                mission={selectedMission}
                onAddRemark={handleAddRemark}
                onAddSanction={handleAddSanction}
                onAddFinding={handleAddFinding}
                onUpdate={() => {
                  const updatedMission = searchResults.find(m => m.id === selectedMission.id);
                  if (updatedMission) {
                    setSelectedMission(updatedMission);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 