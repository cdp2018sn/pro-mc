import React, { useMemo, useState } from 'react';
import { PostgresService } from '../services/postgresService';
import { toast } from 'react-hot-toast';

type MissionForm = {
  id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  location?: string;
  organization?: string;
  created_by?: string;
  assigned_to?: string | null;
};

interface MissionEditorProps {
  mission?: MissionForm;
  onSaved?: (mission: any) => void;
  onCancel?: () => void;
}

export const MissionEditor: React.FC<MissionEditorProps> = ({ mission, onSaved, onCancel }) => {
  const isEdit = !!mission?.id;
  const [form, setForm] = useState<MissionForm>(() => ({
    id: mission?.id,
    title: mission?.title || '',
    description: mission?.description || '',
    status: (mission?.status || 'pending'),
    priority: (mission?.priority || 'medium'),
    start_date: mission?.start_date || '',
    end_date: mission?.end_date || '',
    location: mission?.location || '',
    organization: mission?.organization || '',
    created_by: mission?.created_by,
    assigned_to: mission?.assigned_to ?? null,
  }));
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => form.title.trim().length >= 3, [form.title]);

  const handleChange = (field: keyof MissionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      let saved;
      if (isEdit && form.id) {
        const { id, ...payload } = form;
        saved = await PostgresService.updateMission(id, payload);
        toast.success('Mission mise à jour');
      } else {
        const payload = { ...form };
        delete (payload as any).id;
        saved = await PostgresService.createMission(payload);
        toast.success('Mission créée');
      }
      onSaved?.(saved);
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-3xl">
      <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Modifier la mission' : 'Nouvelle mission'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Titre</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Titre de la mission"
            required
            minLength={3}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={form.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Statut</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Priorité</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date de début</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.start_date || ''}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.end_date || ''}
              onChange={(e) => handleChange('end_date', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Organisation</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.organization || ''}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="Organisation"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lieu</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Lieu"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button type="button" className="px-4 py-2 border rounded" onClick={onCancel}>
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="bg-[#e67e22] disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {loading ? 'En cours...' : (isEdit ? 'Mettre à jour' : 'Créer')}
          </button>
        </div>
      </form>
    </div>
  );
};
