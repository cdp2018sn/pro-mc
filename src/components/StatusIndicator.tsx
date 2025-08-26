import React, { useState, useEffect } from 'react';
import { db } from '../database/localStorageDb';
import { Mission } from '../types/mission';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export const StatusIndicator: React.FC = () => {
  const [upcomingChanges, setUpcomingChanges] = useState<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }>({ startingSoon: [], endingSoon: [] });
  const [totalAlerts, setTotalAlerts] = useState(0);

  useEffect(() => {
    const checkChanges = async () => {
      try {
        const changes = await db.checkUpcomingStatusChanges();
        setUpcomingChanges(changes);
        setTotalAlerts(changes.startingSoon.length + changes.endingSoon.length);
      } catch (error) {
        console.error('Erreur lors de la vérification des changements:', error);
      }
    };

    checkChanges();
    // Vérifier toutes les minutes
    const interval = setInterval(checkChanges, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (totalAlerts === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-1 text-orange-600">
        <BellIcon className="h-5 w-5" />
        <span className="text-sm font-medium">{totalAlerts}</span>
      </div>
      
      {/* Badge de notification */}
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {totalAlerts}
      </div>
    </div>
  );
};
