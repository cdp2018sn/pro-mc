import { User, LoginCredentials, CreateUserData, UpdateUserData, ROLE_PERMISSIONS, UserRole, UserWithPassword, Permissions as UserPermissions } from '../types/auth';
import { SupabaseService } from './supabaseService';

// Fonction simple de hachage de mot de passe (pour la démo)
function hashPassword(password: string): string {
  return btoa(password + 'salt'); // Base64 encoding avec salt
}

// Utilisateur administrateur par défaut
const DEFAULT_ADMIN: UserWithPassword = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'abdoulaye.niang@cdp.sn',
  name: 'Abdoulaye Niang',
  role: 'admin',
  permissions: ROLE_PERMISSIONS.admin,
  created_at: new Date().toISOString(),
  isActive: true,
  department: 'Direction',
  phone: '',
  password: ''
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
  private isSupabaseConnected = false;

  constructor() {
    this.loadUsers();
    this.loadLoginAttempts();
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    try {
      this.isSupabaseConnected = await SupabaseService.testConnection();
      
      if (this.isSupabaseConnected) {
        console.log('✅ Supabase connecté - synchronisation activée');
        await this.syncWithSupabase();
        await this.ensureAdminExists();
      } else {
        console.log('⚠️ Supabase non disponible - mode local');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Supabase:', error);
      this.isSupabaseConnected = false;
    }
  }

  private async ensureAdminExists() {
    try {
      if (this.isSupabaseConnected) {
        // Vérifier si l'admin existe dans Supabase
        const adminExists = await SupabaseService.getUserByEmail('abdoulaye.niang@cdp.sn');
        
        if (!adminExists) {
          console.log('🔧 Création de l\'admin par défaut dans Supabase...');
          await SupabaseService.createUser({
            id: DEFAULT_ADMIN.id,
            email: DEFAULT_ADMIN.email,
            name: DEFAULT_ADMIN.name,
            role: DEFAULT_ADMIN.role,
            permissions: DEFAULT_ADMIN.permissions,
            isActive: DEFAULT_ADMIN.isActive,
            department: DEFAULT_ADMIN.department,
            phone: DEFAULT_ADMIN.phone,
            password: 'Passer'
          });
          console.log('✅ Admin créé dans Supabase');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'admin:', error);
    }
  }

  private async syncWithSupabase(): Promise<void> {
    try {
      if (!this.isSupabaseConnected) return;
      
      console.log('🔄 Synchronisation avec Supabase...');
      
      // Récupérer les utilisateurs de Supabase
      const supabaseUsers = await SupabaseService.getUsers();
      
      // Fusionner avec les utilisateurs locaux
      const localUserIds = new Set(this.users.map(u => u.id));
      
      for (const supabaseUser of supabaseUsers) {
        if (!localUserIds.has(supabaseUser.id)) {
          const newUser: UserWithPassword = {
            ...supabaseUser,
            password: '', // Le mot de passe n'est pas stocké localement
            isActive: supabaseUser.isActive || true
          };
          this.users.push(newUser);
          console.log(`✅ Utilisateur ajouté depuis Supabase: ${supabaseUser.email}`);
        }
      }
      
      this.saveUsers();
      console.log('✅ Synchronisation avec Supabase terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Supabase:', error);
    }
  }

  private loadUsers(): void {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        // S'assurer que l'admin par défaut existe toujours
        if (!this.users.find(u => u.id === DEFAULT_ADMIN.id)) {
          this.users.unshift(DEFAULT_ADMIN);
        }
      } else {
        this.users = [DEFAULT_ADMIN];
        this.saveUsers();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      this.users = [DEFAULT_ADMIN];
      this.saveUsers();
    }
  }

  private saveUsers(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
    }
  }

  private loadLoginAttempts(): void {
    try {
      const storedAttempts = localStorage.getItem(LOGIN_ATTEMPTS_STORAGE_KEY);
      if (storedAttempts) {
        this.loginAttempts = JSON.parse(storedAttempts);
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

  private saveLoginAttempts(): void {
    try {
      localStorage.setItem(LOGIN_ATTEMPTS_STORAGE_KEY, JSON.stringify(this.loginAttempts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tentatives de connexion:', error);
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;

    // Vérifier si le compte est bloqué (sauf pour l'admin)
    const attempts = this.loginAttempts[email];
    if (attempts && attempts.blockedUntil && attempts.blockedUntil > Date.now() && email !== 'abdoulaye.niang@cdp.sn') {
      const remainingTime = Math.ceil((attempts.blockedUntil - Date.now()) / 1000 / 60);
      throw new Error(`Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`);
    }

    // Trouver l'utilisateur
    const user = this.users.find(u => u.email === email);
    if (!user) {
      if (email !== 'abdoulaye.niang@cdp.sn') {
        this.recordLoginAttempt(email);
      }
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new Error('Compte désactivé');
    }

    // Vérifier le mot de passe
    let isValidPassword = false;
    if (user.email === 'abdoulaye.niang@cdp.sn') {
      isValidPassword = password === 'Passer';
    } else {
      isValidPassword = user.password === hashPassword(password);
    }

    if (!isValidPassword) {
      if (email !== 'abdoulaye.niang@cdp.sn') {
        this.recordLoginAttempt(email);
      }
      throw new Error('Email ou mot de passe incorrect');
    }

    // Réinitialiser les tentatives de connexion
    delete this.loginAttempts[email];
    this.saveLoginAttempts();

    // Mettre à jour la dernière connexion
    user.last_login = new Date().toISOString();
    this.saveUsers();

    // Synchroniser avec Supabase si connecté
    if (this.isSupabaseConnected) {
      try {
        await SupabaseService.updateUser(user.id, { last_login: user.last_login });
      } catch (error) {
        console.error('Erreur lors de la synchronisation avec Supabase:', error);
      }
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
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    };

    localStorage.setItem('session', btoa(JSON.stringify(sessionData)));
    return user;
  }

  logout(): void {
    localStorage.removeItem('session');
  }

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

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Vérifier si l'email existe déjà
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const newUser: UserWithPassword = {
      id: generateUUID(),
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

    // Sauvegarder dans Supabase si connecté
    if (this.isSupabaseConnected) {
      try {
        console.log('🔄 Sauvegarde de l\'utilisateur dans Supabase...');
        await SupabaseService.createUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          permissions: newUser.permissions,
          isActive: newUser.isActive,
          department: newUser.department,
          phone: newUser.phone,
          password: userData.password
        });
        console.log('✅ Utilisateur sauvegardé dans Supabase:', newUser.email);
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde dans Supabase:', error);
        console.log('💾 Utilisateur sauvegardé localement uniquement');
      }
    }

    return { ...newUser, password: undefined } as User;
  }

  getAllUsers(): User[] {
    return this.users.map(user => ({ ...user, password: undefined } as User));
  }

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

    // Mettre à jour dans Supabase si connecté
    if (this.isSupabaseConnected) {
      try {
        console.log('🔄 Mise à jour de l\'utilisateur dans Supabase...');
        await SupabaseService.updateUser(userId, updates);
        console.log('✅ Utilisateur mis à jour dans Supabase:', updatedUser.email);
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour dans Supabase:', error);
      }
    }

    return { ...updatedUser, password: undefined } as User;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (userId === DEFAULT_ADMIN.id) {
      throw new Error('Impossible de supprimer l\'administrateur principal');
    }

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const deletedUser = this.users[userIndex];

    // Supprimer localement
    this.users.splice(userIndex, 1);
    this.saveUsers();

    // Supprimer dans Supabase si connecté
    if (this.isSupabaseConnected) {
      try {
        console.log('🔄 Suppression de l\'utilisateur dans Supabase...');
        await SupabaseService.deleteUser(userId);
        console.log('✅ Utilisateur supprimé dans Supabase:', deletedUser.email);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression dans Supabase:', error);
      }
    }

    return true;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    if (newPassword.length < 8) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    
    // Vérifier l'ancien mot de passe (sauf pour l'admin)
    if (user.email !== 'abdoulaye.niang@cdp.sn') {
      if (user.password !== hashPassword(currentPassword)) {
        throw new Error('Mot de passe actuel incorrect');
      }
    }
    
    user.password = hashPassword(newPassword);
    this.saveUsers();
    return true;
  }

  getUserPermissions(userId: string): UserPermissions {
    const user = this.users.find(u => u.id === userId);
    return user?.permissions || ROLE_PERMISSIONS[user?.role || 'user'];
  }

  hasPermission(userId: string, permission: keyof UserPermissions): boolean {
    const permissions = this.getUserPermissions(userId);
    return permissions[permission] || false;
  }

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

  resetUsers(): void {
    this.users = [DEFAULT_ADMIN];
    this.saveUsers();
  }

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

  debugUsers(): void {
    console.log('=== DEBUG UTILISATEURS ===');
    console.log('Utilisateurs stockés:', this.users);
    console.log('Supabase connecté:', this.isSupabaseConnected);
    console.log('localStorage users:', localStorage.getItem(USERS_STORAGE_KEY));
    console.log('========================');
  }

  // Méthode pour forcer la reconnexion Supabase
  async reconnectSupabase(): Promise<boolean> {
    this.isSupabaseConnected = await SupabaseService.testConnection();
    if (this.isSupabaseConnected) {
      await this.syncWithSupabase();
      await this.ensureAdminExists();
    }
    return this.isSupabaseConnected;
  }

  getConnectionStatus(): 'supabase' | 'localStorage' {
    return this.isSupabaseConnected ? 'supabase' : 'localStorage';
  }
}

export const authService = new AuthService();