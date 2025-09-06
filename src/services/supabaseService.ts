import { supabase } from '../config/supabase';
import { Mission, Document, Finding, Sanction, Remark } from '../types/mission';
import { User, CreateUserData, UpdateUserData } from '../types/auth';

export class SupabaseService {
  // ==================== TEST DE CONNEXION ====================
  
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 TEST CONNEXION SUPABASE...');
      
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('❌ SUPABASE NON DISPONIBLE:', error.message);
        console.log('🚨 EXÉCUTEZ LE SCRIPT SQL DANS SUPABASE DASHBOARD !');
        return false;
      }
      
      console.log('✅ CONNEXION SUPABASE RÉUSSIE');
      return true;
    } catch (error) {
      console.log('❌ SUPABASE INACCESSIBLE:', error);
      return false;
    }
  }

  // ==================== UTILISATEURS ====================
  
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur utilisateurs: ${error.message}`);
      }

      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isActive: user.is_active,
        department: user.department,
        phone: user.phone,
        created_at: user.created_at,
        last_login: user.last_login
      }));
    } catch (error) {
      console.error('Erreur getUsers:', error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Erreur utilisateur: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        department: data.department,
        phone: data.phone,
        created_at: data.created_at,
        last_login: data.last_login
      };
    } catch (error) {
      console.error('Erreur getUserByEmail:', error);
      throw error;
    }
  }

  static async createUser(userData: CreateUserData & { id?: string; permissions?: any }): Promise<User> {
    try {
      console.log('📡 CRÉATION UTILISATEUR DANS SUPABASE:', userData.email);
      
      const userToCreate = {
        id: userData.id || crypto.randomUUID(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department || '',
        phone: userData.phone || '',
        is_active: true,
        permissions: userData.permissions || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(userToCreate)
        .select()
        .single();

      if (error) {
        console.log('❌ ERREUR CRÉATION UTILISATEUR SUPABASE:', error.message);
        throw new Error(`Erreur création utilisateur: ${error.message}`);
      }

      console.log('✅ UTILISATEUR CRÉÉ DANS SUPABASE:', data.email);
      
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        department: data.department,
        phone: data.phone,
        created_at: data.created_at,
        last_login: data.last_login
      };
    } catch (error) {
      console.error('Erreur createUser:', error);
      throw error;
    }
  }

  static async updateUser(id: string, updates: UpdateUserData & { last_login?: string }): Promise<User> {
    try {
      const updateData = {
        ...updates,
        is_active: updates.isActive,
        updated_at: new Date().toISOString()
      };

      delete (updateData as any).isActive;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur mise à jour utilisateur: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        isActive: data.is_active,
        department: data.department,
        phone: data.phone,
        created_at: data.created_at,
        last_login: data.last_login
      };
    } catch (error) {
      console.error('Erreur updateUser:', error);
      throw error;
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur suppression utilisateur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur deleteUser:', error);
      throw error;
    }
  }

  // ==================== MISSIONS ====================
  
  static async getMissions(): Promise<Mission[]> {
    try {
      // Récupérer d'abord les missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (missionsError) {
        throw new Error(`Erreur missions: ${missionsError.message}`);
      }

      // Pour chaque mission, récupérer les données associées séparément
      const missions = await Promise.all((missionsData || []).map(async mission => {
        const [documents, findings, sanctions, remarks] = await Promise.all([
          this.getDocuments(mission.id).catch(() => []),
          this.getFindings(mission.id).catch(() => []),
          this.getSanctions(mission.id).catch(() => []),
          this.getRemarks(mission.id).catch(() => [])
        ]);

        return {
          id: mission.id,
          reference: mission.reference,
          title: mission.title,
          description: mission.description,
          type_mission: mission.type_mission,
          organization: mission.organization,
          address: mission.address,
          start_date: mission.start_date,
          end_date: mission.end_date,
          status: mission.status,
          motif_controle: mission.motif_controle,
          decision_numero: mission.decision_numero,
          date_decision: mission.date_decision,
          team_members: mission.team_members || [],
          objectives: mission.objectives || [],
          findings,
          remarks,
          sanctions,
          documents,
          created_at: mission.created_at,
          updated_at: mission.updated_at,
          ignoreAutoStatusChange: mission.ignore_auto_status_change
        };
      }));

      return missions;
    } catch (error) {
      console.error('Erreur getMissions:', error);
      throw error;
    }
  }

  static async createMission(missionData: Omit<Mission, 'id' | 'created_at' | 'updated_at'>): Promise<Mission> {
    try {
      console.log('📡 CRÉATION MISSION DANS SUPABASE:', missionData.reference);
      
      const missionToCreate = {
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
        team_members: missionData.team_members || [],
        objectives: missionData.objectives || [],
        ignore_auto_status_change: missionData.ignoreAutoStatusChange || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('missions')
        .insert(missionToCreate)
        .select()
        .single();

      if (error) {
        console.log('❌ ERREUR CRÉATION MISSION SUPABASE:', error.message);
        throw new Error(`Erreur création mission: ${error.message}`);
      }

      console.log('✅ MISSION CRÉÉE DANS SUPABASE:', data.reference);
      
      return {
        id: data.id,
        reference: data.reference,
        title: data.title,
        description: data.description,
        type_mission: data.type_mission,
        organization: data.organization,
        address: data.address,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        motif_controle: data.motif_controle,
        decision_numero: data.decision_numero,
        date_decision: data.date_decision,
        team_members: data.team_members || [],
        objectives: data.objectives || [],
        findings: [],
        remarks: [],
        sanctions: [],
        documents: [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        ignoreAutoStatusChange: data.ignore_auto_status_change
      };
    } catch (error) {
      console.error('Erreur createMission:', error);
      throw error;
    }
  }

  static async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    try {
      const updateData = {
        ...updates,
        ignore_auto_status_change: updates.ignoreAutoStatusChange,
        updated_at: new Date().toISOString()
      };

      // Supprimer les champs qui ne correspondent pas à la DB
      delete (updateData as any).ignoreAutoStatusChange;
      delete (updateData as any).findings;
      delete (updateData as any).remarks;
      delete (updateData as any).sanctions;
      delete (updateData as any).documents;

      const { data, error } = await supabase
        .from('missions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur mise à jour mission: ${error.message}`);
      }

      return await this.getMissionById(id) || data;
    } catch (error) {
      console.error('Erreur updateMission:', error);
      throw error;
    }
  }

  static async getMissionById(id: string): Promise<Mission | null> {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Erreur récupération mission: ${error.message}`);
      }

      // Récupérer les données associées séparément
      const [documents, findings, sanctions, remarks] = await Promise.all([
        this.getDocuments(id).catch(() => []),
        this.getFindings(id).catch(() => []),
        this.getSanctions(id).catch(() => []),
        this.getRemarks(id).catch(() => [])
      ]);

      return {
        id: data.id,
        reference: data.reference,
        title: data.title,
        description: data.description,
        type_mission: data.type_mission,
        organization: data.organization,
        address: data.address,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        motif_controle: data.motif_controle,
        decision_numero: data.decision_numero,
        date_decision: data.date_decision,
        team_members: data.team_members || [],
        objectives: data.objectives || [],
        findings,
        remarks,
        sanctions,
        documents,
        created_at: data.created_at,
        updated_at: data.updated_at,
        ignoreAutoStatusChange: data.ignore_auto_status_change
      };
    } catch (error) {
      console.error('Erreur getMissionById:', error);
      throw error;
    }
  }

  static async deleteMission(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur suppression mission: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur deleteMission:', error);
      throw error;
    }
  }

  // ==================== DOCUMENTS ====================
  
  static async getDocuments(missionId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur documents: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getDocuments:', error);
      return [];
    }
  }

  static async createDocument(documentData: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur création document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur createDocument:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur suppression document: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur deleteDocument:', error);
      throw error;
    }
  }

  // ==================== CONSTATATIONS ====================
  
  static async getFindings(missionId: string): Promise<Finding[]> {
    try {
      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur constatations: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getFindings:', error);
      return [];
    }
  }

  static async createFinding(findingData: Omit<Finding, 'id' | 'created_at' | 'updated_at'>): Promise<Finding> {
    try {
      const { data, error } = await supabase
        .from('findings')
        .insert({
          ...findingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur création constatation: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur createFinding:', error);
      throw error;
    }
  }

  // ==================== SANCTIONS ====================
  
  static async getSanctions(missionId: string): Promise<Sanction[]> {
    try {
      const { data, error } = await supabase
        .from('sanctions')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur sanctions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getSanctions:', error);
      return [];
    }
  }

  static async createSanction(sanctionData: Omit<Sanction, 'id' | 'created_at' | 'updated_at'>): Promise<Sanction> {
    try {
      const { data, error } = await supabase
        .from('sanctions')
        .insert({
          ...sanctionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur création sanction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur createSanction:', error);
      throw error;
    }
  }

  static async updateSanction(id: string, updates: Partial<Sanction>): Promise<Sanction> {
    try {
      const { data, error } = await supabase
        .from('sanctions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur mise à jour sanction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur updateSanction:', error);
      throw error;
    }
  }

  static async deleteSanction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sanctions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur suppression sanction: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur deleteSanction:', error);
      throw error;
    }
  }

  // ==================== REMARQUES ====================
  
  static async getRemarks(missionId: string): Promise<Remark[]> {
    try {
      const { data, error } = await supabase
        .from('remarks')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur remarques: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur getRemarks:', error);
      return [];
    }
  }

  static async createRemark(remarkData: Omit<Remark, 'id' | 'created_at' | 'updated_at'>): Promise<Remark> {
    try {
      const { data, error } = await supabase
        .from('remarks')
        .insert({
          ...remarkData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur création remarque: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur createRemark:', error);
      throw error;
    }
  }

  // ==================== MISE À JOUR DES STATUTS ====================
  
  static async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    try {
      const now = new Date().toISOString().split('T')[0];
      
      // Missions planifiées qui doivent passer en cours
      const { data: startedMissions, error: startError } = await supabase
        .from('missions')
        .update({ 
          status: 'EN_COURS',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'PLANIFIEE')
        .lte('start_date', now)
        .neq('ignore_auto_status_change', true)
        .select('id');

      if (startError) {
        console.error('Erreur mise à jour planifiées:', startError);
      }

      // Missions en cours qui doivent se terminer
      const { data: completedMissions, error: completeError } = await supabase
        .from('missions')
        .update({ 
          status: 'TERMINEE',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'EN_COURS')
        .lte('end_date', now)
        .neq('ignore_auto_status_change', true)
        .select('id');

      if (completeError) {
        console.error('Erreur mise à jour en cours:', completeError);
      }

      const started = startedMissions?.length || 0;
      const completed = completedMissions?.length || 0;

      return {
        updated: started + completed,
        started,
        completed
      };
    } catch (error) {
      console.error('Erreur updateMissionStatuses:', error);
      throw error;
    }
  }

  // ==================== STATISTIQUES ====================
  
  static async getStatistics() {
    try {
      const missions = await this.getMissions();
      
      return {
        total: missions.length,
        en_cours: missions.filter(m => m.status === 'EN_COURS').length,
        planifiee: missions.filter(m => m.status === 'PLANIFIEE').length,
        terminee: missions.filter(m => m.status === 'TERMINEE').length,
        annulee: missions.filter(m => m.status === 'ANNULEE').length,
        attente: missions.filter(m => m.status === 'ATTENTE_REPONSE').length
      };
    } catch (error) {
      console.error('Erreur getStatistics:', error);
      return {
        total: 0,
        en_cours: 0,
        planifiee: 0,
        terminee: 0,
        annulee: 0,
        attente: 0
      };
    }
  }
}