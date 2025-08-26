import DOMPurify from 'dompurify';

export const MAX_INPUT_LENGTH = 255;

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const validateInput = (value: string, maxLength: number = MAX_INPUT_LENGTH): string => {
  if (!value) return '';
  const sanitized = sanitizeInput(value);
  return sanitized.substring(0, maxLength);
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const validateId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9-_]+$/.test(id);
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(7);
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const rateLimit = (() => {
  const requests: { [key: string]: number[] } = {};
  const limit = 100; // Nombre maximum de requêtes
  const interval = 60000; // Intervalle en millisecondes (1 minute)

  return (userId: string): boolean => {
    const now = Date.now();
    if (!requests[userId]) {
      requests[userId] = [now];
      return true;
    }

    // Nettoyer les anciennes requêtes
    requests[userId] = requests[userId].filter(time => time > now - interval);

    if (requests[userId].length >= limit) {
      return false;
    }

    requests[userId].push(now);
    return true;
  };
})(); 