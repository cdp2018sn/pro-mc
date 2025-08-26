import React, { useMemo, useState, useEffect } from 'react';
import { db } from '../database/localStorageDb';
import { Mission } from '../types/mission';
import { toast } from 'react-hot-toast';

export const ImportTestMissions: React.FC = () => {
	const [isImporting, setIsImporting] = useState(false);
	const [testMissions, setTestMissions] = useState<Mission[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Charger les données JSON via fetch
	useEffect(() => {
		const loadTestMissions = async () => {
			try {
				const response = await fetch('/data/test-missions.json');
				if (!response.ok) {
					throw new Error('Impossible de charger le fichier de données');
				}
				const data = await response.json();
				setTestMissions(data);
			} catch (error) {
				console.error('Erreur lors du chargement des missions de test:', error);
				toast.error('Erreur lors du chargement des données de test');
			} finally {
				setIsLoading(false);
			}
		};

		loadTestMissions();
	}, []);

	const stats = useMemo(() => {
		return {
			total: testMissions.length,
			planifiee: testMissions.filter(m => m.status === 'PLANIFIEE').length,
			enCours: testMissions.filter(m => m.status === 'EN_COURS').length,
			terminee: testMissions.filter(m => m.status === 'TERMINEE').length,
		};
	}, [testMissions]);

	const handleImport = async () => {
		try {
			setIsImporting(true);
			// Supprimer d'abord les anciennes missions de test existantes (par référence)
			const existing = await db.getAllMissions();
			const toDelete = existing.filter(m => m.reference.startsWith('TEST-STATUS-'));
			for (const m of toDelete) {
				await db.deleteMission(m.id);
			}

			// Insérer les missions (en omettant l'id car il est autogénéré par notre DB locale)
			for (const mission of testMissions) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { id: _ignoredId, ...withoutId } = mission as Mission & { id?: string };
				await db.addMission(withoutId as Omit<Mission, 'id'>);
			}

			toast.success(`${testMissions.length} missions importées`);
		} catch (error) {
			console.error(error);
			toast.error("Erreur lors de l'import des missions");
		} finally {
			setIsImporting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-3xl mx-auto">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
						<span className="ml-2">Chargement des données de test...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto">
			<div className="bg-white rounded-lg shadow p-6">
				<h1 className="text-2xl font-semibold text-gray-900 mb-2">Importer des missions de test</h1>
				<p className="text-sm text-gray-600 mb-4">
					Ce jeu contient {stats.total} missions: {stats.planifiee} planifiée(s), {stats.enCours} en cours, {stats.terminee} terminée(s).
				</p>
				<button
					className="px-4 py-2 bg-[#e67e22] text-white rounded hover:bg-[#cf6e15] disabled:opacity-50"
					onClick={handleImport}
					disabled={isImporting}
				>
					{isImporting ? 'Import en cours...' : 'Importer les missions de test'}
				</button>
			</div>
			<div className="mt-6 text-sm text-gray-500">
				<p>Après import, consultez la page "Liste des missions" et le tableau de bord pour voir les alertes de statut.</p>
			</div>
		</div>
	);
};
