import { User, CreateUserData, UpdateUserData } from '../types/auth';

// Service qui utilise une API backend pour la synchronisation
// Cette version permet le partage de données entre navigateurs
export class PostgresService {
  private static readonly API_BASE_URL = 'http://localhost:3000/api';

  private static getAuthHeaders(): HeadersInit {
    try {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch {}
    return {};
  }

  // Méthodes pour les utilisateurs
  static async getUsers(): Promise<User[]> {
    try {
      // Vérifier d'abord si le serveur backend est disponible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Timeout de 2 secondes
      
      const response = await fetch(`${this.API_BASE_URL}/users`, {
        headers: {
          ...this.getAuthHeaders(),
        },
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      const users = await response.json();
      
      // Si pas d'utilisateurs, créer l'admin par défaut
      if (users.length === 0) {
        const defaultAdmin: User = {
          id: 'admin-1',
          email: 'abdoulaye.niang@cdp.sn',
          name: 'Abdoulaye Niang',
          role: 'admin',
          isActive: true,
          department: 'Direction',
          phone: '',
          created_at: new Date().toISOString(),
          last_login: undefined
        };
        
        await this.createUser(defaultAdmin);
        return [defaultAdmin];
      }
      
      return users;
    } catch (error) {
      console.log('🔄 Serveur backend non disponible, utilisation du mode local');
      // Fallback vers localStorage si l'API n'est pas disponible
      return this.getUsersFromLocalStorage();
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users?email=${encodeURIComponent(email)}`, {
        headers: {
          ...this.getAuthHeaders(),
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
      const users = await response.json();
      return users[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      // Fallback vers localStorage
      const users = await this.getUsersFromLocalStorage();
      return users.find(user => user.email === email) || null;
    }
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'utilisateur');
      }
      
      const newUser = await response.json();
      console.log('✅ Utilisateur créé avec succès:', newUser.email);
      return newUser;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      // Fallback vers localStorage
      return this.createUserInLocalStorage(userData);
    }
  }

  static async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
      }
      
      const updatedUser = await response.json();
      console.log('✅ Utilisateur mis à jour avec succès:', updatedUser.email);
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      // Fallback vers localStorage
      return this.updateUserInLocalStorage(id, userData);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'utilisateur');
      }
      
      console.log('✅ Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      // Fallback vers localStorage
      this.deleteUserFromLocalStorage(id);
    }
  }

  // Changer le mot de passe via l'API
  static async changePassword(userId: string, currentPassword: string | undefined, newPassword: string): Promise<void> {
    const response = await fetch(`${this.API_BASE_URL}/users/${userId}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || 'Erreur lors du changement de mot de passe');
    }
  }

  // Méthodes pour les missions
  static async getMissions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/missions`, {
        headers: {
          ...this.getAuthHeaders(),
        }
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des missions');
      }
      const missions = await response.json();
      
      // Si pas de missions, créer des missions par défaut
      if (missions.length === 0) {
        const defaultMissions = [
          {
            id: 'mission-1',
            title: 'Audit Financier Q1 2024',
            description: 'Audit financier du premier trimestre 2024',
            status: 'in_progress',
            priority: 'high',
            created_by: 'admin-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mission-2',
            title: 'Contrôle Qualité Produits',
            description: 'Contrôle qualité des produits manufacturés',
            status: 'pending',
            priority: 'medium',
            created_by: 'admin-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        for (const mission of defaultMissions) {
          await this.createMission(mission);
        }
        return defaultMissions;
      }
      
      return missions;
    } catch (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      // Fallback vers localStorage
      return this.getMissionsFromLocalStorage();
    }
  }

  static async createMission(missionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(missionData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la mission');
      }
      
      const newMission = await response.json();
      console.log('✅ Mission créée avec succès:', newMission.title);
      return newMission;
    } catch (error) {
      console.error('Erreur lors de la création de la mission:', error);
      // Fallback vers localStorage
      return this.createMissionInLocalStorage(missionData);
    }
  }

  static async updateMission(id: string, missionData: any): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/missions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(missionData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la mission');
      }
      
      const updatedMission = await response.json();
      console.log('✅ Mission mise à jour avec succès:', updatedMission.title);
      return updatedMission;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la mission:', error);
      // Fallback vers localStorage
      return this.updateMissionInLocalStorage(id, missionData);
    }
  }

  static async deleteMission(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/missions/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la mission');
      }
      
      console.log('✅ Mission supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la mission:', error);
      // Fallback vers localStorage
      this.deleteMissionFromLocalStorage(id);
    }
  }

  // Méthode pour tester la connexion
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Erreur de connexion API:', error);
      return false;
    }
  }

  // Méthode pour fermer le pool (simulation)
  static async closePool(): Promise<void> {
    console.log('✅ Connexion API fermée');
  }

  // Méthodes de fallback vers localStorage
  private static async getUsersFromLocalStorage(): Promise<User[]> {
    const stored = localStorage.getItem('cdp_postgres_users');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultAdmin: User = {
      id: 'admin-1',
      email: 'abdoulaye.niang@cdp.sn',
      name: 'Abdoulaye Niang',
      role: 'admin',
      isActive: true,
      department: 'Direction',
      phone: '',
      created_at: new Date().toISOString(),
      last_login: undefined
    };
    
    await this.saveUsersToLocalStorage([defaultAdmin]);
    return [defaultAdmin];
  }

  private static async createUserInLocalStorage(userData: any): Promise<User> {
    const users = await this.getUsersFromLocalStorage();
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isActive: userData.isActive,
      department: userData.department,
      phone: userData.phone,
      created_at: new Date().toISOString(),
      last_login: undefined
    };
    
    users.push(newUser);
    await this.saveUsersToLocalStorage(users);
    
    console.log('✅ Utilisateur créé avec succès (localStorage):', newUser.email);
    return newUser;
  }

  private static async updateUserInLocalStorage(id: string, userData: any): Promise<User> {
    const users = await this.getUsersFromLocalStorage();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    await this.saveUsersToLocalStorage(users);
    
    console.log('✅ Utilisateur mis à jour avec succès (localStorage):', updatedUser.email);
    return updatedUser;
  }

  private static async deleteUserFromLocalStorage(id: string): Promise<void> {
    const users = await this.getUsersFromLocalStorage();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) {
      throw new Error('Utilisateur non trouvé');
    }
    
    await this.saveUsersToLocalStorage(filteredUsers);
    console.log('✅ Utilisateur supprimé avec succès (localStorage)');
  }

  private static async saveUsersToLocalStorage(users: User[]): Promise<void> {
    localStorage.setItem('cdp_postgres_users', JSON.stringify(users));
  }

  // Méthodes similaires pour les missions
  private static async getMissionsFromLocalStorage(): Promise<any[]> {
    const stored = localStorage.getItem('cdp_postgres_missions');
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultMissions = [
      {
        id: 'mission-1',
        title: 'Audit Financier Q1 2024',
        description: 'Audit financier du premier trimestre 2024',
        status: 'in_progress',
        priority: 'high',
        created_by: 'admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mission-2',
        title: 'Contrôle Qualité Produits',
        description: 'Contrôle qualité des produits manufacturés',
        status: 'pending',
        priority: 'medium',
        created_by: 'admin-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    await this.saveMissionsToLocalStorage(defaultMissions);
    return defaultMissions;
  }

  private static async createMissionInLocalStorage(missionData: any): Promise<any> {
    const missions = await this.getMissionsFromLocalStorage();
    
    const newMission = {
      id: `mission-${Date.now()}`,
      title: missionData.title,
      description: missionData.description,
      status: missionData.status || 'pending',
      priority: missionData.priority || 'medium',
      created_by: missionData.created_by || 'admin-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    missions.push(newMission);
    await this.saveMissionsToLocalStorage(missions);
    
    console.log('✅ Mission créée avec succès (localStorage):', newMission.title);
    return newMission;
  }

  private static async updateMissionInLocalStorage(id: string, missionData: any): Promise<any> {
    const missions = await this.getMissionsFromLocalStorage();
    const missionIndex = missions.findIndex(m => m.id === id);
    
    if (missionIndex === -1) {
      throw new Error('Mission non trouvée');
    }
    
    const updatedMission = {
      ...missions[missionIndex],
      ...missionData,
      updated_at: new Date().toISOString()
    };
    
    missions[missionIndex] = updatedMission;
    await this.saveMissionsToLocalStorage(missions);
    
    console.log('✅ Mission mise à jour avec succès (localStorage):', updatedMission.title);
    return updatedMission;
  }

  private static async deleteMissionFromLocalStorage(id: string): Promise<void> {
    const missions = await this.getMissionsFromLocalStorage();
    const filteredMissions = missions.filter(m => m.id !== id);
    
    if (filteredMissions.length === missions.length) {
      throw new Error('Mission non trouvée');
    }
    
    await this.saveMissionsToLocalStorage(filteredMissions);
    console.log('✅ Mission supprimée avec succès (localStorage)');
  }

  private static async saveMissionsToLocalStorage(missions: any[]): Promise<void> {
    localStorage.setItem('cdp_postgres_missions', JSON.stringify(missions));
  }
}
