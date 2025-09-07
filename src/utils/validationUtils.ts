// Utilitaires de validation pour l'application CDP Missions

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): { isValid: boolean; message?: string } => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} est requis` };
  }
  return { isValid: true };
};

export const validateDate = (date: string): { isValid: boolean; message?: string } => {
  if (!date) {
    return { isValid: false, message: 'Date requise' };
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Format de date invalide' };
  }
  
  return { isValid: true };
};

export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; message?: string } => {
  const startValidation = validateDate(startDate);
  if (!startValidation.isValid) {
    return { isValid: false, message: `Date de début: ${startValidation.message}` };
  }
  
  const endValidation = validateDate(endDate);
  if (!endValidation.isValid) {
    return { isValid: false, message: `Date de fin: ${endValidation.message}` };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return { isValid: false, message: 'La date de fin doit être postérieure à la date de début' };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone) return { isValid: true }; // Optionnel
  
  // Format sénégalais: +221 XX XXX XX XX
  const phoneRegex = /^(\+221|221)?[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Format de téléphone invalide (ex: +221 XX XXX XX XX)' };
  }
  
  return { isValid: true };
};

export const validateAmount = (amount: number | string): { isValid: boolean; message?: string } => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Montant invalide' };
  }
  
  if (numAmount < 0) {
    return { isValid: false, message: 'Le montant ne peut pas être négatif' };
  }
  
  if (numAmount > 999999999) {
    return { isValid: false, message: 'Montant trop élevé' };
  }
  
  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Supprimer les caractères dangereux
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

export const validateMissionReference = (reference: string): { isValid: boolean; message?: string } => {
  if (!reference) {
    return { isValid: false, message: 'Référence requise' };
  }
  
  // Format: XXX-XXXXXX-XXX
  const refRegex = /^[A-Z]{3}-[0-9]{6}-[A-Z0-9]{3}$/;
  if (!refRegex.test(reference)) {
    return { isValid: false, message: 'Format de référence invalide (ex: MIS-123456-ABC)' };
  }
  
  return { isValid: true };
};

export const generateMissionReference = (): string => {
  const prefix = 'MIS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): { isValid: boolean; message?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { isValid: false, message: `Le fichier ne doit pas dépasser ${maxSizeMB} MB` };
  }
  
  return { isValid: true };
};

export const validateFileType = (file: File, allowedTypes: string[]): { isValid: boolean; message?: string } => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    return { isValid: false, message: `Types de fichiers autorisés: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
};