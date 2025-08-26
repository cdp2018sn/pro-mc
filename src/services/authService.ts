import { User, LoginCredentials, CreateUserData, UpdateUserData, ROLE_PERMISSIONS, UserRole, UserWithPassword, Permissions as UserPermissions } from '../types/auth';
import { PostgresService } from './postgresService';

// Fonction simple de hachage de mot de passe (pour la démo)
function hashPassword(password: string): string {
  return btoa(password + 'salt'); // Base64 encoding avec salt
}

// Utilisateur administrateur par défaut
const DEFAULT_ADMIN: UserWithPassword = {
  id: 'admin-1',
  email: 'abdoulaye.niang@cdp.sn',
  name: 'Abdoulaye Niang',
  role: 'admin',
  permissions: ROLE_PERMISSIONS.admin,
  created_at: new Date().toISOString(),
  isActive: true,
  department: 'Direction',
  phone: '',
  password: '' // L'admin par défaut n'a pas de hash
};

// Clés de stockage localStorage
const USERS_STORAGE_KEY = 'cdp_users';
const LOGIN_ATTEMPTS_STORAGE_KEY = 'cdp_login_attempts';

// Configuration de sécurité
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

class AuthService {
  private users: UserWithPassword[] = [];
  private loginAttempts: Record<string, { count: number; blockedUntil?: number }> = {};

  constructor() {
    this.loadUsers();
    this.loadLoginAttempts();
    this.syncWithPostgres(); // Synchroniser avec PostgreSQL au démarrage
  }

  // Synchroniser avec PostgreSQL
  private async syncWithPostgres(): Promise<void> {
    try {
      console.log('🔄 Synchronisation avec PostgreSQL...');
      
      // Récupérer les utilisateurs de PostgreSQL
      const postgresUsers = await PostgresService.getUsers();
      
      // Fusionner avec les utilisateurs locaux
      const localUserIds = new Set(this.users.map(u => u.id));
      
      for (const postgresUser of postgresUsers) {
        if (!localUserIds.has(postgresUser.id)) {
          // Ajouter les nouveaux utilisateurs de PostgreSQL
          const newUser: UserWithPassword = {
            ...postgresUser,
            password: '', // Le mot de passe n'est pas stocké localement pour la sécurité
            isActive: postgresUser.is_active || true
          };
          this.users.push(newUser);
          console.log(`✅ Utilisateur ajouté depuis PostgreSQL: ${postgresUser.email}`);
        }
      }
      
      this.saveUsers();
      console.log('✅ Synchronisation avec PostgreSQL terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec PostgreSQL:', error);
    }
  }

  // Charger les utilisateurs depuis localStorage
  private loadUsers(): void {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        // S'assurer que l'admin par défaut existe toujours
        if (!this.users.find(u => u.id === 'admin-1')) {
          this.users.unshift(DEFAULT_ADMIN);
        }
      } else {
        // Première initialisation
        this.users = [DEFAULT_ADMIN];
        this.saveUsers();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.users = [DEFAULT_ADMIN];
      this.saveUsers();
    }
  }

  // Sauvegarder les utilisateurs dans localStorage
  private saveUsers(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
    }
  }

  // Charger les tentatives de connexion depuis localStorage
  private loadLoginAttempts(): void {
    try {
      const storedAttempts = localStorage.getItem(LOGIN_ATTEMPTS_STORAGE_KEY);
      if (storedAttempts) {
        this.loginAttempts = JSON.parse(storedAttempts);
        // Nettoyer les tentatives expirées
        const now = Date.now();
        Object.keys(this.loginAttempts).forEach(email => {
          const attempts = this.loginAttempts[email];
          if (attempts.blockedUntil && attempts.blockedUntil < now) {
            delete this.loginAttempts[email];
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tentatives de connexion:', error);
      this.loginAttempts = {};
    }
  }

  // Sauvegarder les tentatives de connexion dans localStorage
  private saveLoginAttempts(): void {
    try {
      localStorage.setItem(LOGIN_ATTEMPTS_STORAGE_KEY, JSON.stringify(this.loginAttempts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tentatives de connexion:', error);
    }
  }

  // Connexion utilisateur
  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;

    // Vérifier si le compte est bloqué
    const attempts = this.loginAttempts[email];
    if (attempts && attempts.blockedUntil && attempts.blockedUntil > Date.now()) {
      const remainingTime = Math.ceil((attempts.blockedUntil - Date.now()) / 1000 / 60);
      throw new Error(`Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`);
    }

    // Trouver l'utilisateur
    const user = this.users.find(u => u.email === email);
    if (!user) {
      this.recordLoginAttempt(email);
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Vérifier le mot de passe
    let isValidPassword = false;
    if (user.id === 'admin-1') {
      isValidPassword = password === 'Passer';
    } else {
      isValidPassword = user.password === hashPassword(password);
    }

    if (!isValidPassword) {
      this.recordLoginAttempt(email);
      throw new Error('Email ou mot de passe incorrect');
    }

    // Réinitialiser les tentatives de connexion
    delete this.loginAttempts[email];
    this.saveLoginAttempts();

    // Mettre à jour la dernière connexion
    user.last_login = new Date().toISOString();
    this.saveUsers();

    // Synchroniser avec PostgreSQL
    try {
      await PostgresService.updateUser(user.id, { last_login: user.last_login });
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec PostgreSQL:', error);
    }

    // Créer la session
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions || ROLE_PERMISSIONS[user.role],
        created_at: user.created_at,
        last_login: user.last_login,
        isActive: user.isActive,
        department: user.department,
        phone: user.phone
      },
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
    };

    localStorage.setItem('session', btoa(JSON.stringify(sessionData)));
    return user;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('session');
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    try {
      const sessionData = localStorage.getItem('session');
      if (!sessionData) return null;

      const session = JSON.parse(atob(sessionData));
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('session');
        return null;
      }

      return session.user;
    } catch {
      localStorage.removeItem('session');
      return null;
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<User> {
    // Vérifier si l'email existe déjà
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Valider le mot de passe
    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    const newUser: UserWithPassword = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      permissions: ROLE_PERMISSIONS[userData.role],
      password: hashPassword(userData.password),
      created_at: new Date().toISOString(),
      isActive: true,
      department: userData.department || '',
      phone: userData.phone || ''
    };

    // Sauvegarder localement
    this.users.push(newUser);
    this.saveUsers();

    // Sauvegarder dans PostgreSQL
    try {
      console.log('🔄 Sauvegarde de l\'utilisateur dans PostgreSQL...');
      const postgresUser = await PostgresService.createUser({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions,
        is_active: newUser.isActive,
        department: newUser.department,
        phone: newUser.phone,
        created_at: newUser.created_at,
        updated_at: new Date().toISOString()
      });
             console.log('✅ Utilisateur sauvegardé dans PostgreSQL:', postgresUser.email);
    } catch (error) {
             console.error('❌ Erreur lors de la sauvegarde dans PostgreSQL:', error);
             // Ne pas échouer complètement si PostgreSQL n'est pas disponible
    }

    return { ...newUser, password: undefined } as User;
  }

  // Obtenir tous les utilisateurs
  getAllUsers(): User[] {
    return this.users.map(user => ({ ...user, password: undefined } as User));
  }

  // Mettre à jour un utilisateur
  async updateUser(userId: string, updates: UpdateUserData): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    const updatedUser = { ...this.users[userIndex], ...updates };
    if (updates.role) {
      updatedUser.permissions = ROLE_PERMISSIONS[updates.role];
    }

    // Mettre à jour localement
    this.users[userIndex] = updatedUser;
    this.saveUsers();

    // Mettre à jour dans PostgreSQL
    try {
      console.log('🔄 Mise à jour de l\'utilisateur dans PostgreSQL...');
      await PostgresService.updateUser(userId, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      console.log('✅ Utilisateur mis à jour dans PostgreSQL:', updatedUser.email);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour dans PostgreSQL:', error);
    }

    return { ...updatedUser, password: undefined } as User;
  }

  // Supprimer un utilisateur
  async deleteUser(userId: string): Promise<boolean> {
    // Empêcher la suppression de l'admin principal
    if (userId === 'admin-1') {
      throw new Error('Impossible de supprimer l\'administrateur principal');
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const deletedUser = this.users[userIndex];

    // Supprimer localement
    this.users.splice(userIndex, 1);
    this.saveUsers();

    // Supprimer dans PostgreSQL
    try {
      console.log('🔄 Suppression de l\'utilisateur dans PostgreSQL...');
      await PostgresService.deleteUser(userId);
      console.log('✅ Utilisateur supprimé dans PostgreSQL:', deletedUser.email);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression dans PostgreSQL:', error);
    }

    return true;
  }

  // Changer le mot de passe
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    // Vérifier l'ancien mot de passe
    let isValidCurrentPassword = false;
    if (user.id === 'admin-1') {
      isValidCurrentPassword = currentPassword === 'Passer';
    } else {
      isValidCurrentPassword = user.password === hashPassword(currentPassword);
    }

    if (!isValidCurrentPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Valider le nouveau mot de passe
    if (newPassword.length < 8) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    // Mettre à jour le mot de passe localement
    user.password = hashPassword(newPassword);
    this.saveUsers();

    // Note: Le mot de passe n'est pas synchronisé avec PostgreSQL pour des raisons de sécurité
    // PostgreSQL gère ses propres mots de passe via l'authentification

    return true;
  }

  // Obtenir les permissions d'un utilisateur
  getUserPermissions(userId: string): UserPermissions {
    const user = this.users.find(u => u.id === userId);
    return user?.permissions || ROLE_PERMISSIONS[user?.role || 'user'];
  }

  // Vérifier si un utilisateur a une permission spécifique
  hasPermission(userId: string, permission: keyof UserPermissions): boolean {
    const permissions = this.getUserPermissions(userId);
    return permissions[permission] || false;
  }

  // Obtenir les rôles disponibles avec descriptions
  getAvailableRoles(): Array<{value: UserRole, label: string, description: string}> {
    return [
      {
        value: 'admin',
        label: 'Administrateur',
        description: 'Accès complet à toutes les fonctionnalités'
      },
      {
        value: 'supervisor',
        label: 'Superviseur',
        description: 'Gestion des missions et rapports, pas de gestion utilisateurs'
      },
      {
        value: 'controller',
        label: 'Contrôleur',
        description: 'Création et modification de missions, accès limité'
      },
      {
        value: 'viewer',
        label: 'Lecteur',
        description: 'Consultation uniquement, pas de modifications'
      },
      {
        value: 'user',
        label: 'Utilisateur',
        description: 'Accès très limité, missions assignées uniquement'
      }
    ];
  }

  // Réinitialiser les utilisateurs (pour les tests)
  resetUsers(): void {
    this.users = [DEFAULT_ADMIN];
    this.saveUsers();
  }

  // Enregistrer une tentative de connexion échouée
  private recordLoginAttempt(email: string): void {
    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = { count: 0 };
    }

    this.loginAttempts[email].count++;

    if (this.loginAttempts[email].count >= MAX_LOGIN_ATTEMPTS) {
      this.loginAttempts[email].blockedUntil = Date.now() + BLOCK_DURATION;
    }

    this.saveLoginAttempts();
  }

  // Debug: Afficher les utilisateurs dans la console
  debugUsers(): void {
    console.log('=== DEBUG UTILISATEURS ===');
    console.log('Utilisateurs stockés:', this.users);
    console.log('localStorage users:', localStorage.getItem(USERS_STORAGE_KEY));
    console.log('========================');
  }
}

export const authService = new AuthService();
