// Types de rôles disponibles
export type UserRole = 'admin' | 'supervisor' | 'controller' | 'viewer' | 'user';

// Permissions disponibles
export interface Permissions {
  canCreateMissions: boolean;
  canEditMissions: boolean;
  canDeleteMissions: boolean;
  canViewAllMissions: boolean;
  canImportMissions: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canEditReports: boolean;
  canManageDocuments: boolean;
  canChangeStatus: boolean;
  canViewDebug: boolean;
}

// Configuration des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: true,
    canViewAllMissions: true,
    canImportMissions: true,
    canManageUsers: true,
    canViewReports: true,
    canEditReports: true,
    canManageDocuments: true,
    canChangeStatus: true,
    canViewDebug: true,
  },
  supervisor: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: false,
    canViewAllMissions: true,
    canImportMissions: true,
    canManageUsers: false,
    canViewReports: true,
    canEditReports: true,
    canManageDocuments: true,
    canChangeStatus: true,
    canViewDebug: false,
  },
  controller: {
    canCreateMissions: true,
    canEditMissions: true,
    canDeleteMissions: false,
    canViewAllMissions: false,
    canImportMissions: false,
    canManageUsers: false,
    canViewReports: false,
    canEditReports: false,
    canManageDocuments: true,
    canChangeStatus: true,
    canViewDebug: false,
  },
  viewer: {
    canCreateMissions: false,
    canEditMissions: false,
    canDeleteMissions: false,
    canViewAllMissions: true,
    canImportMissions: false,
    canManageUsers: false,
    canViewReports: true,
    canEditReports: false,
    canManageDocuments: false,
    canChangeStatus: false,
    canViewDebug: false,
  },
  user: {
    canCreateMissions: false,
    canEditMissions: false,
    canDeleteMissions: false,
    canViewAllMissions: false,
    canImportMissions: false,
    canManageUsers: false,
    canViewReports: false,
    canEditReports: false,
    canManageDocuments: false,
    canChangeStatus: false,
    canViewDebug: false,
  },
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: Permissions;
  created_at: string;
  last_login?: string;
  isActive: boolean;
  department?: string;
  phone?: string;
}

// Type interne pour les utilisateurs avec mot de passe (utilisé uniquement dans le service)
export interface UserWithPassword extends User {
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  department?: string;
  phone?: string;
  isActive?: boolean;
  last_login?: string;
}
