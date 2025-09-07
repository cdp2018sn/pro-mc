import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Gestionnaire d'erreurs global pour filtrer les erreurs des extensions
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args.join(' ');
  
  // Ignorer les erreurs des extensions Chrome
  if (errorMessage.includes('chrome-extension://') || 
      errorMessage.includes('i18next:') ||
      errorMessage.includes('message port closed') ||
      errorMessage.includes('Supabase request failed') ||
      errorMessage.includes('PGRST002') ||
      errorMessage.includes('Supabase non disponible') ||
      errorMessage.includes('Could not query the database for the schema cache')) {
    return;
  }
  
  // Afficher les autres erreurs normalement
  originalError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)