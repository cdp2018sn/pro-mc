import { supabase } from '../config/supabase.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export interface Mission {
  id?: string;
  reference: string;
  title: string;
  description?: string;
  status: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  start_date: string;
  end_date: string;
  location: string;
  controller_name: string;
  entity_controlled: string;
  mission_type: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'controller' | 'viewer' | 'user';
  department?: string;
  phone?: string;
  is_active: boolean;
  permissions?: any;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseMissionModel {
  // Créer une nouvelle mission (avec vérification des permissions)
  static async create(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert({
        ...mission,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la mission: ${error.message}`);
    }

    return data;
  }

  // Obtenir toutes les missions (avec filtrage selon les permissions)
  static async findAll(userId: string, userRole: string): Promise<Mission[]> {
    let query = supabase.from('missions').select('*');

    // Les contrôleurs ne voient que leurs missions
    if (userRole === 'controller') {
      query = query.eq('created_by', userId);
    }
    // Les viewers voient toutes les missions
    // Les admins et supervisors voient toutes les missions

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des missions: ${error.message}`);
    }

    return data || [];
  }

  // Obtenir une mission par ID (avec vérification des permissions)
  static async findById(id: string, userId: string, userRole: string): Promise<Mission | null> {
    let query = supabase.from('missions').select('*').eq('id', id);

    // Les contrôleurs ne peuvent voir que leurs missions
    if (userRole === 'controller') {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Mission non trouvée
      }
      throw new Error(`Erreur lors de la récupération de la mission: ${error.message}`);
    }

    return data;
  }

  // Mettre à jour une mission (avec vérification des permissions)
  static async update(id: string, updates: Partial<Mission>, userId: string, userRole: string): Promise<Mission | null> {
    // Vérifier les permissions
    const existingMission = await this.findById(id, userId, userRole);
    if (!existingMission) {
      return null;
    }

    const { data, error } = await supabase
      .from('missions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la mission: ${error.message}`);
    }

    return data;
  }

  // Supprimer une mission (seuls les admins ou le créateur peuvent supprimer)
  static async delete(id: string, userId: string, userRole: string): Promise<boolean> {
    // Vérifier les permissions
    const existingMission = await this.findById(id, userId, userRole);
    if (!existingMission) {
      return false;
    }

    // Seuls les admins ou le créateur peuvent supprimer
    if (userRole !== 'admin' && existingMission.created_by !== userId) {
      throw new Error('Permissions insuffisantes pour supprimer cette mission');
    }

    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la mission: ${error.message}`);
    }

    return true;
  }

  // Mettre à jour automatiquement les statuts
  static async updateStatuses(): Promise<{ plannedToOngoing: number; ongoingToCompleted: number }> {
    const now = new Date().toISOString().split('T')[0];

    // Missions planifiées qui doivent passer en cours
    const { data: plannedMissions, error: plannedError } = await supabase
      .from('missions')
      .update({ 
        status: 'EN_COURS',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'PLANIFIEE')
      .lte('start_date', now)
      .select('id');

    if (plannedError) {
      throw new Error(`Erreur lors de la mise à jour des missions planifiées: ${plannedError.message}`);
    }

    // Missions en cours qui doivent se terminer
    const { data: ongoingMissions, error: ongoingError } = await supabase
      .from('missions')
      .update({ 
        status: 'TERMINEE',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'EN_COURS')
      .lte('end_date', now)
      .select('id');

    if (ongoingError) {
      throw new Error(`Erreur lors de la mise à jour des missions en cours: ${ongoingError.message}`);
    }

    return {
      plannedToOngoing: plannedMissions?.length || 0,
      ongoingToCompleted: ongoingMissions?.length || 0
    };
  }
}

export class SupabaseUserModel {
  // Créer un nouvel utilisateur (admin seulement)
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  // Obtenir tous les utilisateurs (admin seulement)
  static async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }

    return data || [];
  }

  // Obtenir un utilisateur par ID
  static async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  // Mettre à jour un utilisateur
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  // Supprimer un utilisateur (admin seulement)
  static async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }

    return true;
  }

  // Vérifier les identifiants de connexion
  static async verifyCredentials(email: string, password: string): Promise<User | null> {
    // Cette méthode sera gérée par Supabase Auth
    // Nous utilisons l'authentification intégrée de Supabase
    return null;
  }
}
