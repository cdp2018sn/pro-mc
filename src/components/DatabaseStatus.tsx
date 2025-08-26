import React, { useState, useEffect } from 'react';
import { db } from '../database/localStorageDb';
import { Mission, Document, Finding, Sanction, Remark } from '../types/mission';
import { toast } from 'react-hot-toast';

interface DatabaseStats {
  missions: number;
  documents: number;
  findings: number;
  sanctions: number;
  remarks: number;
  lastUpdate: string;
}

export const DatabaseStatus: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les données
      const missions = await db.getAllMissions();
      
      let totalDocuments = 0;
      let totalFindings = 0;
      let totalSanctions = 0;
      let totalRemarks = 0;

      // Compter les éléments associés aux missions
      for (const mission of missions) {
        const documents = await db.getDocumentsForMission(mission.id);
        const findings = await db.getFindingsForMission(mission.id);
        const sanctions = await db.getSanctionsForMission(mission.id);
        const remarks = await db.getRemarksForMission(mission.id);

        totalDocuments += documents.length;
        totalFindings += findings.length;
        totalSanctions += sanctions.length;
        totalRemarks += remarks.length;
      }

      setStats({
        missions: missions.length,
        documents: totalDocuments,
        findings: totalFindings,
        sanctions: totalSanctions,
        remarks: totalRemarks,
        lastUpdate: new Date().toLocaleString('fr-FR')
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques de la base de données');
    } finally {
      setLoading(false);
    }
  };

  const runIntegrityTest = async () => {
    try {
      setIsRunningTest(true);
      
      // Test simple d'intégrité
      const missions = await db.getAllMissions();
      
      // Vérifier la structure d'une mission
      if (missions.length > 0) {
        const sampleMission = missions[0];
        const requiredFields = ['id', 'reference', 'title', 'status', 'start_date', 'end_date'];
        const missingFields = requiredFields.filter(field => !(field in sampleMission));
        
        if (missingFields.length > 0) {
          toast.error(`Structure de mission invalide: champs manquants ${missingFields.join(', ')}`);
          return;
        }
      }

      // Test d'ajout/suppression d'une mission de test
      const testMission: Omit<Mission, 'id'> = {
        reference: `TEST-${Date.now()}`,
        title: 'Test d\'intégrité',
        description: 'Mission de test temporaire',
        type_mission: 'Contrôle sur place',
        organization: 'Test',
        address: 'Test',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'PLANIFIEE',
        motif_controle: 'Programme annuel',
        decision_numero: 'TEST',
        date_decision: new Date().toISOString(),
        team_members: [],
        objectives: [],
        findings: [],
        remarks: [],
        sanctions: [],
        documents: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const addedMission = await db.addMission(testMission);
      
      // Test d'ajout d'un document
      const testDocument: Omit<Document, 'id' | 'mission_id'> = {
        title: 'Test document',
        type: 'RAPPORT_CONTROLE',
        file_path: 'test.pdf',
        created_at: new Date().toISOString()
      };
      
      await db.addDocument(addedMission.id, testDocument);
      
      // Vérifier que le document a été ajouté
      const documents = await db.getDocumentsForMission(addedMission.id);
      if (documents.length === 0) {
        throw new Error('Le document de test n\'a pas été ajouté correctement');
      }
      
      // Nettoyer - supprimer la mission de test
      await db.deleteMission(addedMission.id);
      
      toast.success('Test d\'intégrité réussi ! La base de données fonctionne correctement.');
      
      // Recharger les statistiques
      await loadDatabaseStats();
      
    } catch (err) {
      console.error('Erreur lors du test d\'intégrité:', err);
      toast.error(`Test d'intégrité échoué: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir vider complètement la base de données ? Cette action est irréversible.')) {
      return;
    }

    try {
      setLoading(true);
      await db.delete();
      await db.open();
      toast.success('Base de données vidée avec succès');
      await loadDatabaseStats();
    } catch (err) {
      console.error('Erreur lors du vidage de la base de données:', err);
      toast.error('Erreur lors du vidage de la base de données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut de la base de données</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut de la base de données</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erreur:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Statut de la base de données</h3>
        <div className="flex space-x-2">
          <button
            onClick={runIntegrityTest}
            disabled={isRunningTest}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunningTest ? 'Test en cours...' : 'Test d\'intégrité'}
          </button>
          <button
            onClick={clearDatabase}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Vider la DB
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.missions}</div>
            <div className="text-sm text-gray-600">Missions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.documents}</div>
            <div className="text-sm text-gray-600">Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.findings}</div>
            <div className="text-sm text-gray-600">Constatations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.sanctions}</div>
            <div className="text-sm text-gray-600">Sanctions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.remarks}</div>
            <div className="text-sm text-gray-600">Remarques</div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Dernière mise à jour: {stats?.lastUpdate}
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-green-800">Base de données opérationnelle</span>
        </div>
      </div>
    </div>
  );
};
