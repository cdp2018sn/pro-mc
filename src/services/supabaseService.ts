import { supabase } from '../config/supabase';
import { Mission, Document, Finding, Sanction, Remark, ReponseSuivi } from '../types/mission';
import { User, CreateUserData, UpdateUserData } from '../types/auth';

export class SupabaseService {
  // ==================== UTILISATEURS ====================
  
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }

    return data || [];
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Pas trouvé
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        is_active: userData.isActive,
        permissions: userData.permissions,
        password_hash: userData.password ? await this.hashPassword(userData.password) : null
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  static async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  // ==================== MISSIONS ====================
  
  static async getMissions(): Promise<Mission[]> {
    const { data: missions, error } = await supabase
      .from('missions')
      .select(`
        *,
        documents(*),
        findings(*),
        sanctions(*),
        remarks(*),
        reponses_suivi(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      throw new Error(`Erreur lors de la récupération des missions: ${error.message}`);
    }

    return missions || [];
  }

  static async getMissionById(id: string): Promise<Mission | null> {
    const { data, error } = await supabase
      .from('missions')
      .select(`
        *,
        documents(*),
        findings(*),
        sanctions(*),
        remarks(*),
        reponses_suivi(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erreur lors de la récupération de la mission: ${error.message}`);
    }

    return data;
  }

  static async createMission(missionData: Omit<Mission, 'id' | 'created_at' | 'updated_at'>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert({
        reference: missionData.reference,
        title: missionData.title,
        description: missionData.description,
        type_mission: missionData.type_mission,
        organization: missionData.organization,
        address: missionData.address,
        start_date: missionData.start_date,
        end_date: missionData.end_date,
        status: missionData.status,
        motif_controle: missionData.motif_controle,
        decision_numero: missionData.decision_numero,
        date_decision: missionData.date_decision,
        team_members: missionData.team_members,
        objectives: missionData.objectives
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la mission: ${error.message}`);
    }

    return data;
  }

  static async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la mission: ${error.message}`);
    }

    return data;
  }

  static async deleteMission(id: string): Promise<void> {
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la mission: ${error.message}`);
    }
  }

  // ==================== DOCUMENTS ====================
  
  static async getDocuments(missionId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des documents: ${error.message}`);
    }

    return data || [];
  }

  static async createDocument(documentData: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du document: ${error.message}`);
    }

    return data;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression du document: ${error.message}`);
    }
  }

  // ==================== CONSTATATIONS ====================
  
  static async getFindings(missionId: string): Promise<Finding[]> {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des constatations: ${error.message}`);
    }

    return data || [];
  }

  static async createFinding(findingData: Omit<Finding, 'id' | 'created_at' | 'updated_at'>): Promise<Finding> {
    const { data, error } = await supabase
      .from('findings')
      .insert(findingData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la constatation: ${error.message}`);
    }

    return data;
  }

  static async updateFinding(id: string, updates: Partial<Finding>): Promise<Finding> {
    const { data, error } = await supabase
      .from('findings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la constatation: ${error.message}`);
    }

    return data;
  }

  static async deleteFinding(id: string): Promise<void> {
    const { error } = await supabase
      .from('findings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la constatation: ${error.message}`);
    }
  }

  // ==================== SANCTIONS ====================
  
  static async getSanctions(missionId: string): Promise<Sanction[]> {
    const { data, error } = await supabase
      .from('sanctions')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des sanctions: ${error.message}`);
    }

    return data || [];
  }

  static async createSanction(sanctionData: Omit<Sanction, 'id' | 'created_at' | 'updated_at'>): Promise<Sanction> {
    const { data, error } = await supabase
      .from('sanctions')
      .insert(sanctionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la sanction: ${error.message}`);
    }

    return data;
  }

  static async updateSanction(id: string, updates: Partial<Sanction>): Promise<Sanction> {
    const { data, error } = await supabase
      .from('sanctions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la sanction: ${error.message}`);
    }

    return data;
  }

  static async deleteSanction(id: string): Promise<void> {
    const { error } = await supabase
      .from('sanctions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la sanction: ${error.message}`);
    }
  }

  // ==================== REMARQUES ====================
  
  static async getRemarks(missionId: string): Promise<Remark[]> {
    const { data, error } = await supabase
      .from('remarks')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des remarques: ${error.message}`);
    }

    return data || [];
  }

  static async createRemark(remarkData: Omit<Remark, 'id' | 'created_at' | 'updated_at'>): Promise<Remark> {
    const { data, error } = await supabase
      .from('remarks')
      .insert(remarkData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la remarque: ${error.message}`);
    }

    return data;
  }

  static async deleteRemark(id: string): Promise<void> {
    const { error } = await supabase
      .from('remarks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la remarque: ${error.message}`);
    }
  }

  // ==================== RÉPONSES DE SUIVI ====================
  
  static async getReponsesSuivi(missionId: string): Promise<ReponseSuivi[]> {
    const { data, error } = await supabase
      .from('reponses_suivi')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des réponses: ${error.message}`);
    }

    return data || [];
  }

  static async createReponseSuivi(reponseData: Omit<ReponseSuivi, 'id' | 'created_at' | 'updated_at'>): Promise<ReponseSuivi> {
    const { data, error } = await supabase
      .from('reponses_suivi')
      .insert(reponseData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la réponse: ${error.message}`);
    }

    return data;
  }

  // ==================== STATISTIQUES ====================
  
  static async getStatistics() {
    const { data: missions, error } = await supabase
      .from('missions')
      .select('status');

    if (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }

    const stats = {
      total: missions?.length || 0,
      planifiee: missions?.filter(m => m.status === 'PLANIFIEE').length || 0,
      en_cours: missions?.filter(m => m.status === 'EN_COURS').length || 0,
      terminee: missions?.filter(m => m.status === 'TERMINEE').length || 0,
      attente_reponse: missions?.filter(m => m.status === 'ATTENTE_REPONSE').length || 0,
      annulee: missions?.filter(m => m.status === 'ANNULEE').length || 0
    };

    return stats;
  }

  // ==================== MISE À JOUR DES STATUTS ====================
  
  static async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    const now = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    // Missions planifiées qui doivent passer en cours
    const { data: startedMissions, error: startError } = await supabase
      .from('missions')
      .update({ status: 'EN_COURS' })
      .eq('status', 'PLANIFIEE')
      .lte('start_date', now)
      .eq('ignore_auto_status_change', false)
      .select('id');

    if (startError) {
      console.error('Erreur lors de la mise à jour des missions planifiées:', startError);
    }

    // Missions en cours qui doivent se terminer
    const { data: completedMissions, error: completeError } = await supabase
      .from('missions')
      .update({ status: 'TERMINEE' })
      .eq('status', 'EN_COURS')
      .lte('end_date', now)
      .eq('ignore_auto_status_change', false)
      .select('id');

    if (completeError) {
      console.error('Erreur lors de la mise à jour des missions en cours:', completeError);
    }

    const started = startedMissions?.length || 0;
    const completed = completedMissions?.length || 0;

    return {
      updated: started + completed,
      started,
      completed
    };
  }

  // ==================== UTILITAIRES ====================
  
  private static async hashPassword(password: string): Promise<string> {
    // Utiliser bcrypt côté client (ou envoyer au serveur pour hachage)
    // Pour la simplicité, on utilise un hash simple ici
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'cdp-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        return false;
      }

      console.log('✅ Connexion Supabase réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return false;
    }
  }
}