import React, { useState } from 'react';
import { Mission, MissionStatus, MissionType, FindingType, SanctionType, Finding } from '../types/mission';
import { MissionDetails } from './MissionDetails';
import { db } from '../database/localStorageDb';

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results = missions.filter(mission => {
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
      // Rafraîchir les résultats de recherche
      const updatedMission = searchResults.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la remarque:', error);
    }
  };

  const handleAddSanction = async (missionId: string, content: string) => {
    try {
      await db.addSanction(missionId, content);
      // Rafraîchir les résultats de recherche
      const updatedMission = searchResults.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
    }
  };

  const handleAddFinding = async (missionId: string, finding: string | Omit<Finding, "id" | "mission_id" | "created_at" | "updated_at">) => {
    try {
      const content = typeof finding === 'string' ? finding : JSON.stringify(finding);
      await db.addFinding(missionId, content);
      // Rafraîchir les résultats de recherche
      const updatedMission = searchResults.find(m => m.id === missionId);
      if (updatedMission) {
        setSelectedMission(updatedMission);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du constat:', error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="cdp-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Référence</label>
            <input
              type="text"
              name="reference"
              onChange={handleFilterChange}
              className="cdp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              onChange={handleFilterChange}
              className="cdp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de Mission</label>
            <select
              name="type_mission"
              onChange={handleFilterChange}
              className="cdp-select"
            >
              <option value="">Tous</option>
              <option value="Contrôle sur place">Contrôle sur place</option>
              <option value="Contrôle sur pièces">Contrôle sur pièces</option>
              <option value="Contrôle en ligne">Contrôle en ligne</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              onChange={handleFilterChange}
              className="cdp-select"
            >
              <option value="">Tous</option>
              <option value="PLANIFIEE">Planifiée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Organisation</label>
            <input
              type="text"
              name="organization"
              onChange={handleFilterChange}
              className="cdp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="date"
              name="start_date"
              onChange={handleFilterChange}
              className="cdp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de fin</label>
            <input
              type="date"
              name="end_date"
              onChange={handleFilterChange}
              className="cdp-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de constat</label>
            <select
              name="finding_type"
              onChange={handleFilterChange}
              className="cdp-select"
            >
              <option value="">Tous</option>
              <option value="NON_CONFORMITE">Non-conformité</option>
              <option value="RECOMMANDATION">Recommandation</option>
              <option value="BONNE_PRATIQUE">Bonne pratique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de sanction</label>
            <select
              name="sanction_type"
              onChange={handleFilterChange}
              className="cdp-select"
            >
              <option value="">Tous</option>
              <option value="AVERTISSEMENT">Avertissement</option>
              <option value="MISE_EN_DEMEURE">Mise en demeure</option>
              <option value="PECUNIAIRE">Sanction pécuniaire</option>
              <option value="INJONCTION">Injonction</option>
              <option value="RESTRICTION_TRAITEMENT">Restriction de traitement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Motif de contrôle</label>
            <select
              name="motif_controle"
              onChange={handleFilterChange}
              className="cdp-select"
            >
              <option value="">Tous</option>
              <option value="CONTROLE_ROUTINIER">Contrôle routinier</option>
              <option value="PLAINTE">Plainte</option>
              <option value="SIGNALEMENT">Signalement</option>
              <option value="INSPECTION">Inspection</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="py-2 px-4 text-white bg-[#F15A24] rounded-md text-base font-normal hover:bg-[#d94e1f]"
          >
            Rechercher
          </button>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="cdp-card">
          <h3 className="text-lg font-medium text-[#1a5f7a] mb-4">Résultats de la recherche</h3>
          <div className="overflow-x-auto">
            <table className="cdp-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre</th>
                  <th>Organisation</th>
                  <th>Statut</th>
                  <th>Date de début</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((mission) => (
                  <tr 
                    key={mission.id}
                    onClick={() => setSelectedMission(mission)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td>{mission.reference}</td>
                    <td>{mission.title}</td>
                    <td>{mission.organization}</td>
                    <td>{mission.status}</td>
                    <td>
                      {new Date(mission.start_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedMission && (
        <MissionDetails
          mission={selectedMission}
          onAddRemark={handleAddRemark}
          onAddSanction={handleAddSanction}
          onAddFinding={handleAddFinding}
          onUpdate={() => {
            // Rafraîchir les résultats de recherche
            const updatedMission = searchResults.find(m => m.id === selectedMission.id);
            if (updatedMission) {
              setSelectedMission(updatedMission);
            }
          }}
        />
      )}
    </div>
  );
}; 