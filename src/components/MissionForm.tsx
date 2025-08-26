import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mission, MissionType, MissionStatus, MotifControleType } from '../types/mission';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';
import { getSenegalNow, toSenegalISOString } from '../utils/timeUtils';

interface MissionFormProps {
  onSubmit: (data: Partial<Mission>) => Promise<void>;
  initialData?: Partial<Mission>;
}

export const MissionForm: React.FC<MissionFormProps> = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Mission>>({
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: any) => {
    try {
      const now = getSenegalNow();
      
      const newMission: Omit<Mission, 'id'> = {
        ...data,
        status: 'PLANIFIEE' as MissionStatus,
        created_at: toSenegalISOString(now),
        updated_at: toSenegalISOString(now),
        start_date: data.start_date,
        end_date: data.end_date,
        findings: [],
        remarks: [],
        sanctions: [],
        documents: []
      };

      await db.addMission(newMission);
      toast.success('Mission créée avec succès !');
      navigate('/missions');
    } catch (error) {
      console.error('Erreur lors de la création de la mission:', error);
      toast.error('Erreur lors de la création de la mission');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Référence *
          </label>
          <input
            type="text"
            {...register('reference', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">La référence est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Titre *
          </label>
          <input
            type="text"
            {...register('title', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">Le titre est requis</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register('description', { required: true })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">La description est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type de mission *
          </label>
          <select
            {...register('type_mission', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="">Sélectionnez un type</option>
            <option value="Contrôle sur place">Contrôle sur place</option>
            <option value="Contrôle sur pièces">Contrôle sur pièces</option>
            <option value="Contrôle en ligne">Contrôle en ligne</option>
          </select>
          {errors.type_mission && (
            <p className="mt-1 text-sm text-red-600">Le type de mission est requis</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Statut *
          </label>
          <select
            {...register('status', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="">Sélectionnez un statut</option>
            <option value="PLANIFIEE">Planifiée</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
            <option value="ATTENTE_REPONSE">Attente de réponse</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">Le statut est requis</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Organisation *
          </label>
          <input
            type="text"
            {...register('organization', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.organization && (
            <p className="mt-1 text-sm text-red-600">L'organisation est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Adresse *
          </label>
          <input
            type="text"
            {...register('address', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">L'adresse est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de début *
          </label>
          <input
            type="date"
            {...register('start_date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.start_date && (
            <p className="mt-1 text-sm text-red-600">La date de début est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de fin *
          </label>
          <input
            type="date"
            {...register('end_date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.end_date && (
            <p className="mt-1 text-sm text-red-600">La date de fin est requise</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Motif de contrôle *
          </label>
          <select
            {...register('motif_controle', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="">Sélectionnez un motif</option>
            <option value="Suite a une plainte">Suite à une plainte</option>
            <option value="Decision de la session pleniere">Décision de la session plénière</option>
            <option value="Programme annuel">Programme annuel</option>
            <option value="Autres">Autres</option>
          </select>
          {errors.motif_controle && (
            <p className="mt-1 text-sm text-red-600">Le motif de contrôle est requis</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Numéro de décision *
          </label>
          <input
            type="text"
            {...register('decision_numero', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.decision_numero && (
            <p className="mt-1 text-sm text-red-600">Le numéro de décision est requis</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de décision *
          </label>
          <input
            type="date"
            {...register('date_decision', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.date_decision && (
            <p className="mt-1 text-sm text-red-600">La date de décision est requise</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Membres de l'équipe *
          </label>
          <textarea
            {...register('team_members', { required: true })}
            rows={2}
            placeholder="Entrez les noms séparés par des virgules"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.team_members && (
            <p className="mt-1 text-sm text-red-600">Au moins un membre de l'équipe est requis</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Objectifs *
          </label>
          <textarea
            {...register('objectives', { required: true })}
            rows={4}
            placeholder="Entrez les objectifs, un par ligne"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
          {errors.objectives && (
            <p className="mt-1 text-sm text-red-600">Au moins un objectif est requis</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/missions')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isSubmitting ? 'Création en cours...' : 'Créer la mission'}
        </button>
      </div>
    </form>
  );
};