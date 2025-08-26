import React, { useState } from 'react';
import { Finding, FindingType } from '../types/mission';
import { format } from 'date-fns';

interface FindingsFormProps {
  missionId: string;
  onAddFinding: (missionId: string, finding: string | Omit<Finding, 'id' | 'mission_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  existingFindings?: Finding[];
}

const findingTypeLabels = {
  NON_CONFORMITE_MAJEURE: 'Non-conformité majeure',
  NON_CONFORMITE_MINEURE: 'Non-conformité mineure',
  OBSERVATION: 'Observation',
  POINT_CONFORME: 'Point conforme'
};

export const FindingsForm: React.FC<FindingsFormProps> = ({
  missionId,
  onAddFinding,
  existingFindings = []
}) => {
  const [newFinding, setNewFinding] = useState({
    type: 'NON_CONFORMITE_MAJEURE' as FindingType,
    description: '',
    reference_legale: '',
    recommandation: '',
    delai_correction: '',
    date_constat: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFinding(missionId, {
      ...newFinding,
      delai_correction: newFinding.delai_correction ? parseInt(newFinding.delai_correction) : undefined
    });
    setNewFinding({
      type: 'NON_CONFORMITE_MAJEURE',
      description: '',
      reference_legale: '',
      recommandation: '',
      delai_correction: '',
      date_constat: format(new Date(), 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600">
          <h3 className="text-lg font-semibold text-white">Manquements constatés</h3>
        </div>
        <div className="p-6">
          {/* Liste des constats existants */}
          <div className="space-y-4 mb-8">
            {existingFindings.map((finding) => (
              <div key={finding.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      finding.type === 'NON_CONFORMITE_MAJEURE' ? 'bg-red-100 text-red-800' :
                      finding.type === 'NON_CONFORMITE_MINEURE' ? 'bg-orange-100 text-orange-800' :
                      finding.type === 'OBSERVATION' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {findingTypeLabels[finding.type]}
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
            ))}
          </div>

          {/* Formulaire d'ajout */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="findingType" className="block text-sm font-medium text-gray-700">
                Type de manquement
              </label>
              <select
                id="findingType"
                value={newFinding.type}
                onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value as FindingType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                {Object.entries(findingTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description du manquement
              </label>
              <textarea
                id="description"
                value={newFinding.description}
                onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                Référence légale
              </label>
              <input
                type="text"
                id="reference"
                value={newFinding.reference_legale}
                onChange={(e) => setNewFinding({ ...newFinding, reference_legale: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Ex: Article 32 de la loi n°2008-12"
              />
            </div>

            <div>
              <label htmlFor="recommandation" className="block text-sm font-medium text-gray-700">
                Recommandation
              </label>
              <textarea
                id="recommandation"
                value={newFinding.recommandation}
                onChange={(e) => setNewFinding({ ...newFinding, recommandation: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="delai" className="block text-sm font-medium text-gray-700">
                  Délai de correction (jours)
                </label>
                <input
                  type="number"
                  id="delai"
                  value={newFinding.delai_correction}
                  onChange={(e) => setNewFinding({ ...newFinding, delai_correction: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="date_constat" className="block text-sm font-medium text-gray-700">
                  Date du constat
                </label>
                <input
                  type="date"
                  id="date_constat"
                  value={newFinding.date_constat}
                  onChange={(e) => setNewFinding({ ...newFinding, date_constat: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-md hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Ajouter le manquement
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};