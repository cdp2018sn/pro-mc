import React from 'react';

// Configuration pour l'heure du Sénégal (UTC+0)
const SENEGAL_TIMEZONE = 'Africa/Dakar';

/**
 * Obtient la date et l'heure actuelles du Sénégal
 */
export const getSenegalNow = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: SENEGAL_TIMEZONE }));
};

/**
 * Convertit une date en heure du Sénégal
 */
export const toSenegalTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.toLocaleString("en-US", { timeZone: SENEGAL_TIMEZONE }));
};

/**
 * Formate une date en format lisible pour le Sénégal
 */
export const formatSenegalDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: SENEGAL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  return dateObj.toLocaleString('fr-FR', { ...defaultOptions, ...options });
};

/**
 * Formate seulement la date (sans l'heure) pour le Sénégal
 */
export const formatSenegalDateOnly = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    timeZone: SENEGAL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formate seulement l'heure pour le Sénégal
 */
export const formatSenegalTimeOnly = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('fr-FR', {
    timeZone: SENEGAL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Vérifie si une date est dans le passé par rapport à l'heure du Sénégal
 */
export const isPastInSenegal = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const senegalNow = getSenegalNow();
  return toSenegalTime(dateObj) < senegalNow;
};

/**
 * Vérifie si une date est dans le futur par rapport à l'heure du Sénégal
 */
export const isFutureInSenegal = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const senegalNow = getSenegalNow();
  return toSenegalTime(dateObj) > senegalNow;
};

/**
 * Calcule la différence en jours entre deux dates en heure du Sénégal
 */
export const getDaysDifferenceInSenegal = (date1: Date | string, date2: Date | string): number => {
  const senegalDate1 = toSenegalTime(date1);
  const senegalDate2 = toSenegalTime(date2);
  const diffTime = Math.abs(senegalDate2.getTime() - senegalDate1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Obtient le timestamp actuel du Sénégal
 */
export const getSenegalTimestamp = (): number => {
  return getSenegalNow().getTime();
};

/**
 * Crée une date ISO string en heure du Sénégal
 */
export const toSenegalISOString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toSenegalTime(dateObj).toISOString();
};

/**
 * Hook pour obtenir l'heure actuelle du Sénégal avec mise à jour automatique
 */
export const useSenegalTime = () => {
  const [senegalNow, setSenegalNow] = React.useState(getSenegalNow());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSenegalNow(getSenegalNow());
    }, 1000); // Mise à jour toutes les secondes

    return () => clearInterval(interval);
  }, []);

  return senegalNow;
};

/**
 * Composant pour afficher l'heure actuelle du Sénégal
 */
export const SenegalTimeDisplay: React.FC<{ showSeconds?: boolean }> = ({ showSeconds = true }) => {
  const senegalNow = useSenegalTime();
  
  return React.createElement('span', { className: 'font-mono' }, formatSenegalTimeOnly(senegalNow));
};

/**
 * Composant pour afficher la date actuelle du Sénégal
 */
export const SenegalDateDisplay: React.FC = () => {
  const senegalNow = useSenegalTime();
  
  return React.createElement('span', {}, formatSenegalDateOnly(senegalNow));
};
