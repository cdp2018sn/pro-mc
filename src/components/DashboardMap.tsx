import React from 'react';
import { Mission } from '../types/mission';

interface DashboardMapProps {
  missions: Mission[];
}

export const DashboardMap: React.FC<DashboardMapProps> = ({ missions }) => {
  const missionsWithLocation = missions.filter(mission => mission.address && mission.address.trim() !== '');
  
  if (missionsWithLocation.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-gray-500">Aucune mission avec adresse disponible</p>
        <p className="text-sm text-gray-400 mt-2">Ajoutez des adresses aux missions pour les voir sur la carte</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missionsWithLocation.slice(0, 6).map((mission) => (
          <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{mission.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{mission.reference}</p>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {mission.address}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    mission.status === 'PLANIFIEE' ? 'bg-blue-100 text-blue-800' :
                    mission.status === 'EN_COURS' ? 'bg-orange-100 text-orange-800' :
                    mission.status === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mission.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(mission.start_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {missionsWithLocation.length > 6 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Et {missionsWithLocation.length - 6} autres missions avec adresse...
          </p>
        </div>
      )}
    </div>
  );
}; 