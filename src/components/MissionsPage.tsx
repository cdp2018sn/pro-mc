import React, { useMemo, useState } from 'react';
import { useMissions } from '../hooks/useMissions';
import { MissionEditor } from './MissionEditor';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';

export const MissionsPage: React.FC = () => {
  const { missions: missionsList, isLoading, error, refetchMissions, deleteMission } = useMissions() as any;
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const currentUser = authService.getCurrentUser();

  const canCreate = currentUser && ['admin', 'supervisor', 'controller'].includes(currentUser.role);
  const canEdit = currentUser && ['admin', 'supervisor', 'controller'].includes(currentUser.role);
  const canDelete = currentUser && ['admin', 'supervisor'].includes(currentUser.role);

  const missions = useMemo(() => missionsList || [], [missionsList]);

  const onCreate = () => {
    if (!canCreate) {
      toast.error('Permission insuffisante');
      return;
    }
    setEditing(null);
    setShowEditor(true);
  };

  const onEdit = (mission: any) => {
    if (!canEdit) {
      toast.error('Permission insuffisante');
      return;
    }
    setEditing(mission);
    setShowEditor(true);
  };

  const onDelete = async (id: string) => {
    if (!canDelete) {
      toast.error('Permission insuffisante');
      return;
    }
    try {
      await deleteMission(id);
      toast.success('Mission supprimée');
      refetchMissions();
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Missions de contrôle</h1>
          {canCreate ? (
            <button onClick={onCreate} className="bg-[#e67e22] text-white px-4 py-2 rounded">Nouvelle mission</button>
          ) : (
            <button className="bg-gray-300 cursor-not-allowed text-white px-4 py-2 rounded" title="Permission insuffisante" disabled>
              Nouvelle mission
            </button>
          )}
        </div>

        {showEditor && (
          <div className="mb-6">
            <MissionEditor
              mission={editing || undefined}
              onSaved={() => {
                setShowEditor(false);
                setEditing(null);
                refetchMissions();
              }}
              onCancel={() => {
                setShowEditor(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        {isLoading && <div>Chargement des missions…</div>}
        {error && <div className="text-red-600">Erreur: {String(error)}</div>}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {missions.map((m: any) => (
                <tr key={m.id}>
                  <td className="px-3 md:px-6 py-2 md:py-3 whitespace-normal break-words text-sm font-medium text-gray-900 max-w-[240px]">{m.title}</td>
                  <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-700">{m.status}</td>
                  <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-700">{m.priority}</td>
                  <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {canEdit ? (
                        <button onClick={() => onEdit(m)} className="px-3 py-1 border rounded">Éditer</button>
                      ) : (
                        <button className="px-3 py-1 border rounded cursor-not-allowed opacity-50" disabled title="Permission insuffisante">Éditer</button>
                      )}
                      {canDelete ? (
                        <button onClick={() => onDelete(m.id)} className="px-3 py-1 border rounded text-red-600">Supprimer</button>
                      ) : (
                        <button className="px-3 py-1 border rounded text-red-600 cursor-not-allowed opacity-50" disabled title="Permission insuffisante">Supprimer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {missions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-3 md:px-6 py-6 text-center text-sm text-gray-500">
                    Aucune mission trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


