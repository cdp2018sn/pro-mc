import { useState, useEffect } from 'react';
import { Mission } from '../types/mission';
import { getDatabase } from '../database/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostgresService } from '../services/postgresService';
import { toast } from 'react-hot-toast';

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = async () => {
    try {
      const db = await getDatabase();
      const result = await db.all('SELECT * FROM missions ORDER BY created_at DESC');
      setMissions(result);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des missions:', err);
      setError('Erreur lors de la récupération des missions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const refreshMissions = () => {
    setLoading(true);
    fetchMissions();
  };

  const queryClient = useQueryClient();

  const { data: missionsQuery = [], isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      console.log('🔄 Début de la récupération des missions via React Query');
      const result = await PostgresService.getMissions();
      console.log('📊 Missions récupérées:', result);
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Rafraîchir à chaque focus
    refetchOnMount: true, // Rafraîchir à chaque montage
    refetchInterval: 60000 // Rafraîchir toutes les 60 secondes
  });

  // Fonction pour mettre à jour les missions dans le cache
  const updateMissionsCache = () => {
    console.log('🔄 Mise à jour du cache des missions');
    queryClient.invalidateQueries({ queryKey: ['missions'] });
    // Forcer un rafraîchissement
    setTimeout(() => {
      console.log('🔄 Forçage du rafraîchissement des missions');
      refetch();
    }, 500);
  };

  const addMissionMutation = useMutation({
    mutationFn: (mission: Omit<Mission, 'id'>) => PostgresService.createMission(mission),
    onSuccess: () => {
      toast.success('Mission ajoutée avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout de la mission: ${error.message}`);
    }
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, mission }: { id: string; mission: Partial<Mission> }) => 
      PostgresService.updateMission(id, mission),
    onSuccess: () => {
      toast.success('Mission mise à jour avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  const deleteMissionMutation = useMutation({
    mutationFn: (id: string) => PostgresService.deleteMission(id),
    onSuccess: () => {
      toast.success('Mission supprimée avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const addRemarkMutation = useMutation({
    mutationFn: ({ missionId, remark }: { missionId: string; remark: any }) => 
      supabaseService.addRemark(missionId, remark),
    onSuccess: () => {
      toast.success('Remarque ajoutée avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout de la remarque: ${error.message}`);
    }
  });

  const addSanctionMutation = useMutation({
    mutationFn: ({ missionId, sanction }: { missionId: string; sanction: any }) => 
      supabaseService.addSanction(missionId, sanction),
    onSuccess: () => {
      toast.success('Sanction ajoutée avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout de la sanction: ${error.message}`);
    }
  });

  const addFindingMutation = useMutation({
    mutationFn: ({ missionId, finding }: { missionId: string; finding: any }) => 
      supabaseService.addFinding(missionId, finding),
    onSuccess: () => {
      toast.success('Constat ajouté avec succès');
      updateMissionsCache();
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'ajout du constat: ${error.message}`);
    }
  });

  return {
    missions: missionsQuery,
    isLoading,
    error: queryError,
    refetchMissions: refetch,
    addMission: addMissionMutation.mutateAsync,
    updateMission: updateMissionMutation.mutateAsync,
    deleteMission: deleteMissionMutation.mutateAsync,
    addRemark: addRemarkMutation.mutateAsync,
    addSanction: addSanctionMutation.mutateAsync,
    addFinding: addFindingMutation.mutateAsync,
    loading,
    localError: error,
    refreshMissions
  };
};