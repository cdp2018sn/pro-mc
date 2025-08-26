 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MissionList } from './components/MissionList';
import { MissionForm } from './components/MissionForm';
import { Dashboard } from './components/Dashboard';
import { AdvancedSearch } from './components/AdvancedSearch';
import { useLocalMissions } from './hooks/useLocalMissions';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { StatusIndicator } from './components/StatusIndicator';
import { ImportMissions } from './components/ImportMissions';
import { DebugMissions } from './components/DebugMissions';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { UserManagement } from './components/UserManagement';
import { ChangePassword } from './components/ChangePassword';
import { useState, useEffect, useRef } from 'react';
import { UserRole } from './types/auth';

// Créer une instance de QueryClient en dehors du composant
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Composant de navigation avec authentification
function Navigation() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu déroulant quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'controller': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'supervisor': return 'Superviseur';
      case 'controller': return 'Contrôleur';
      case 'viewer': return 'Lecteur';
      case 'user': return 'User';
      default: return role;
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-[#e67e22]">
                CDP Control
              </span>
            </div>
            
            {/* Menu desktop */}
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              <Link
                to="/"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                to="/missions"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liste des missions
              </Link>
              <Link
                to="/nouvelle-mission"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nouvelle mission
              </Link>
              <Link
                to="/recherche"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recherche avancée
              </Link>
              <Link
                to="/import"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Importer missions
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/users"
                  className="cdp-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gestion utilisateurs
                </Link>
              )}
              <Link
                to="/debug"
                className="cdp-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Debug
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatusIndicator />
            </div>
          </div>
          
          {/* Menu utilisateur desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Informations utilisateur */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: 'rgb(230, 126, 34)' }}>
                {user?.name}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>

            {/* Menu déroulant utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu déroulant */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>Changer le mot de passe</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Déconnexion</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tableau de bord
              </Link>
              <Link
                to="/missions"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liste des missions
              </Link>
              <Link
                to="/nouvelle-mission"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nouvelle mission
              </Link>
              <Link
                to="/recherche"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recherche avancée
              </Link>
              <Link
                to="/import"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Importer missions
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/users"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Gestion utilisateurs
                </Link>
              )}
              <Link
                to="/debug"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Debug
              </Link>
              
              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2"></div>
              
              {/* Menu utilisateur mobile */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium" style={{ color: 'rgb(230, 126, 34)' }}>
                    {user?.name}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/change-password"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Changer le mot de passe
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Composant principal qui utilise useLocalMissions
function AppContent() {
  const { missions, refreshMissions, addMission } = useLocalMissions();
  const { isAuthenticated, isLoading } = useAuth();

  const handleSubmit = async (data: any) => {
    try {
      await addMission(data);
      toast.success('Mission ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la mission:', error);
      toast.error('Erreur lors de l\'ajout de la mission');
    }
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff3e0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e67e22] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#fff3e0]">
        <Toaster position="top-right" />
        {/* Barre supérieure */}
        <div className="bg-[#e67e22] text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <a href="mailto:contact@cdp.sn" className="text-sm hover:text-[#f39c12] transition-colors">
                  contact@cdp.sn
                </a>
                <a href="tel:+221338597030" className="text-sm hover:text-[#f39c12] transition-colors">
                +221 33 859 70 30
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <Navigation />

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#e67e22]">
                      Tableau de bord
                    </h1>
                    <p className="mt-2 text-[#5d4037]">
                      Vue d'ensemble des missions de contrôle
                    </p>
                  </div>
                  <Dashboard missions={missions} />
                </div>
              }
            />
            <Route
              path="/missions"
              element={
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#e67e22]">
                      Missions de contrôle
                    </h1>
                    <p className="mt-2 text-[#5d4037]">
                      Gérez et suivez toutes vos missions de contrôle de protection des données
                    </p>
                  </div>
                  <MissionList />
                </div>
              }
            />
            <Route
              path="/nouvelle-mission"
              element={
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#e67e22]">
                      Nouvelle mission
                    </h1>
                    <p className="mt-2 text-[#5d4037]">
                      Créez une nouvelle mission de contrôle
                    </p>
                  </div>
                  <div className="cdp-card bg-white rounded-lg shadow-md mb-8">
                    <div className="px-6 py-8">
                      <MissionForm onSubmit={handleSubmit} />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path="/recherche"
              element={
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#e67e22]">
                      Recherche avancée
                    </h1>
                    <p className="mt-2 text-[#5d4037]">
                      Recherchez des missions selon des critères spécifiques
                    </p>
                  </div>
                  <AdvancedSearch 
                    missions={missions}
                    onSearch={(filters) => console.log('Filtres appliqués:', filters)}
                  />
                </div>
              }
            />
            <Route path="/import" element={<ImportMissions onImportSuccess={refreshMissions} />} />
            <Route path="/debug" element={<DebugMissions />} />
            <Route path="/users" element={<UserManagement />} />
            <Route 
              path="/change-password" 
              element={
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#e67e22]">
                      Changer le mot de passe
                    </h1>
                    <p className="mt-2 text-[#5d4037]">
                      Modifiez votre mot de passe pour sécuriser votre compte
                    </p>
                  </div>
                  <ChangePassword />
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Pied de page */}
        <footer className="bg-[#e67e22] text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">À propos</h3>
                <p className="text-sm">
                  Plateforme de gestion des missions de contrôle de la Commission de Protection des Données Personnelles
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <p className="text-sm">Email: contact@cdp.sn</p>
                <p className="text-sm">Tél: +221 33 859 70 30</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-sm hover:text-[#f39c12] transition-colors">Accueil</Link></li>
                  <li><Link to="/missions" className="text-sm hover:text-[#f39c12] transition-colors">Missions</Link></li>
                  <li><Link to="/recherche" className="text-sm hover:text-[#f39c12] transition-colors">Recherche</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} CDP Control. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Composant racine qui fournit le QueryClient et l'AuthProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;