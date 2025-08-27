import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatusChangeAlerts } from './StatusChangeAlerts';
import { IgnoredMissions } from './IgnoredMissions';
 

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Chargement dynamique des composants
const DynamicPie = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Pie })));
const DynamicBar = lazy(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })));

interface DashboardProps {
  missions: Mission[];
}

export const Dashboard: React.FC<DashboardProps> = ({ missions }) => {
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState({
    totalMissions: 0,
    missionsEnCours: 0,
    missionsTerminees: 0,
    missionsEnAttente: 0,
    tauxCompletion: 0,
  });

  const loadMissions = async () => {
    // Cette fonction sera appelée pour rafraîchir les missions
    window.location.reload();
  };

  const calculateStatistics = (missions: Mission[]) => {
    const enCours = missions.filter(m => m.status === 'EN_COURS').length;
    const terminees = missions.filter(m => m.status === 'TERMINEE').length;
    const enAttente = missions.filter(m => m.status === 'ATTENTE_REPONSE').length;
    
    return {
      totalMissions: missions.length,
      missionsEnCours: enCours,
      missionsTerminees: terminees,
      missionsEnAttente: enAttente,
      tauxCompletion: missions.length > 0 ? (terminees / missions.length) * 100 : 0,
    };
  };

  useEffect(() => {
    // Activer le rendu client pour les graphiques
    setIsClient(true);

    const loadMissions = async () => {
      try {
        const allMissions = await db.getAllMissions();
        setStats(calculateStatistics(allMissions));
      } catch (error) {
        console.error('Erreur lors du chargement des missions:', error);
      }
    };

    loadMissions();
  }, []);

  const renderCharts = () => {
    if (!isClient) return null;

    const statusData = {
      labels: ['Planifiée', 'En cours', 'Terminée', 'Annulée', 'En attente'],
      datasets: [{
        data: [
          missions.filter(m => m.status === 'PLANIFIEE').length,
          missions.filter(m => m.status === 'EN_COURS').length,
          missions.filter(m => m.status === 'TERMINEE').length,
          missions.filter(m => m.status === 'ANNULEE').length,
          missions.filter(m => m.status === 'ATTENTE_REPONSE').length,
        ],
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',  // Bleu pour planifiée
          'rgba(230, 126, 34, 0.7)',  // Orange pour en cours
          'rgba(46, 204, 113, 0.7)',  // Vert pour terminée
          'rgba(231, 76, 60, 0.7)',   // Rouge pour annulée
          'rgba(241, 196, 15, 0.7)',  // Jaune pour en attente
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(231, 76, 60, 1)',
          'rgba(241, 196, 15, 1)',
        ],
        borderWidth: 1,
      }],
    };

    // Calcul des missions par mois pour l'année en cours
    const currentYear = new Date().getFullYear();
    const monthlyData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        label: 'Missions créées',
        data: Array(12).fill(0).map((_, i) => 
          missions.filter(m => {
            const missionDate = new Date(m.created_at);
            return missionDate.getFullYear() === currentYear && missionDate.getMonth() === i;
          }).length
        ),
        backgroundColor: 'rgba(230, 126, 34, 0.7)',
        borderColor: 'rgba(230, 126, 34, 1)',
        borderWidth: 1,
      }],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    const barOptions = {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          },
          title: {
            display: true,
            text: 'Nombre de missions'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Mois'
          }
        }
      }
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6">
        <div className="bg-white p-4 rounded-lg shadow-md h-64 sm:h-80 md:h-[400px]">
          <h2 className="text-lg font-semibold mb-4">État des missions</h2>
          <div className="h-[calc(100%-2rem)]">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Chargement du graphique...</div>}>
              <DynamicPie data={statusData} options={chartOptions} />
            </Suspense>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-64 sm:h-80 md:h-[400px]">
          <h2 className="text-lg font-semibold mb-4">Missions par mois</h2>
          <div className="h-[calc(100%-2rem)]">
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Chargement du graphique...</div>}>
              <DynamicBar data={monthlyData} options={barOptions} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">Total Missions</h3>
        <p className="text-3xl font-bold text-[#e67e22]">{stats.totalMissions}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">En cours</h3>
        <p className="text-3xl font-bold text-[#e67e22]">{stats.missionsEnCours}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">Terminées</h3>
        <p className="text-3xl font-bold text-[#2ecc71]">{stats.missionsTerminees}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-600">Taux de complétion</h3>
        <p className="text-3xl font-bold text-[#2ecc71]">{stats.tauxCompletion.toFixed(1)}%</p>
      </div>
    </div>
  );

  const renderRecentMissions = () => {
    const recentMissions = missions
      .filter(mission => {
        // Afficher les missions en cours et terminées
        const isRecent = mission.status === 'EN_COURS' || mission.status === 'TERMINEE';
        return isRecent;
      })
      .sort((a, b) => {
        // Priorité aux missions en cours
        if (a.status === 'EN_COURS' && b.status !== 'EN_COURS') return -1;
        if (a.status !== 'EN_COURS' && b.status === 'EN_COURS') return 1;
        // Ensuite tri par date de début
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      })
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg shadow-md mt-6 mx-4 sm:mx-6">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Missions récentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentMissions.length > 0 ? (
                  recentMissions.map((mission) => {
                    const dateDebut = new Date(mission.start_date);
                    const formattedDate = !isNaN(dateDebut.getTime()) 
                      ? format(dateDebut, 'dd MMM yyyy', { locale: fr })
                      : 'Date non disponible';

                    return (
                      <tr key={mission.id}>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formattedDate}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-normal md:whitespace-nowrap break-words text-sm font-medium text-gray-900 max-w-[200px] md:max-w-none">
                          {mission.title}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${mission.status === 'EN_COURS' ? 'bg-orange-100 text-orange-800' : 
                              mission.status === 'TERMINEE' ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {mission.status === 'EN_COURS' ? 'En cours' : 
                             mission.status === 'TERMINEE' ? 'Terminée' : 
                             'En attente'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-normal md:whitespace-nowrap break-words text-sm text-gray-500 max-w-[160px] md:max-w-none">
                          {mission.organization}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 md:px-6 py-2 md:py-4 text-center text-sm text-gray-500">
                      Aucune mission récente à afficher
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

  const renderUpcomingMissions = () => {
    const now = new Date();
    const upcomingMissions = missions
      .filter(mission => {
        // Inclure les missions planifiées ou dont la date de début est dans le futur
        return mission.status === 'PLANIFIEE' || 
               (mission.start_date && new Date(mission.start_date) > now);
      })
      .sort((a, b) => {
        // Priorité aux missions planifiées
        if (a.status === 'PLANIFIEE' && b.status !== 'PLANIFIEE') return -1;
        if (a.status !== 'PLANIFIEE' && b.status === 'PLANIFIEE') return 1;
        // Ensuite tri par date de début
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      })
      .slice(0, 5);

    return (
      <div className="bg-white rounded-lg shadow-md mt-6 mx-4 sm:mx-6">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Missions à venir</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMissions.length > 0 ? (
                  upcomingMissions.map((mission) => {
                    const dateDebut = new Date(mission.start_date);
                    const formattedDate = !isNaN(dateDebut.getTime()) 
                      ? format(dateDebut, 'dd MMM yyyy', { locale: fr })
                      : 'Date non disponible';

                    return (
                      <tr key={mission.id}>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-500">
                          {formattedDate}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-normal md:whitespace-nowrap break-words text-sm font-medium text-gray-900 max-w-[200px] md:max-w-none">
                          {mission.title}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${mission.status === 'PLANIFIEE' ? 'bg-blue-100 text-blue-800' : 
                              mission.status === 'EN_COURS' ? 'bg-orange-100 text-orange-800' : 
                              mission.status === 'TERMINEE' ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {mission.status === 'PLANIFIEE' ? 'Planifiée' :
                             mission.status === 'EN_COURS' ? 'En cours' : 
                             mission.status === 'TERMINEE' ? 'Terminée' : 
                             'En attente'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-4 whitespace-normal md:whitespace-nowrap break-words text-sm text-gray-500 max-w-[160px] md:max-w-none">
                          {mission.organization}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 md:px-6 py-2 md:py-4 text-center text-sm text-gray-500">
                      Aucune mission à venir à afficher
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {/* Alertes de changement de statut */}
        <StatusChangeAlerts missions={missions} onRefresh={loadMissions} />
        
        {/* Missions ignorées */}
        <IgnoredMissions />
        
        {/* Statistiques */}
        {renderStats()}
        
        {/* Graphiques */}
        {renderCharts()}
        
        {/* Missions récentes */}
        {renderRecentMissions()}
        
        {/* Missions à venir */}
        {renderUpcomingMissions()}
      </div>
    </div>
  );
};