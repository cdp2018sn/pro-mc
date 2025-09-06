import { SupabaseService } from './supabaseService';
import { Mission, Document, Finding, Sanction, Remark } from '../types/mission';
import { User } from '../types/auth';

/**
 * Service de synchronisation globale pour assurer que toutes les données
 * sont stockées dans Supabase et accessibles partout
 */
export class GlobalSyncService {
  private static isSupabaseConnected = false;
  private static syncQueue: Array<{ type: string; action: string; data: any }> = [];
  private static isSyncing = false;

  // Initialiser la connexion Supabase
  static async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initialisation GlobalSyncService...');
      this.isSupabaseConnected = await SupabaseService.testConnection();
      
      if (this.isSupabaseConnected) {
        console.log('✅ GlobalSyncService: Supabase connecté');
        await this.processSyncQueue();
      } else {
        console.log('⚠️ GlobalSyncService: Mode hors ligne');
      }
      
      return this.isSupabaseConnected;
    } catch (error) {
      console.error('❌ Erreur initialisation GlobalSyncService:', error);
      this.isSupabaseConnected = false;
      return false;
    }
  }

  // Vérifier le statut de connexion
  static getConnectionStatus(): 'connected' | 'offline' | 'syncing' {
    if (this.isSyncing) return 'syncing';
    return this.isSupabaseConnected ? 'connected' : 'offline';
  }

  // Synchroniser un utilisateur
  static async syncUser(action: 'create' | 'update' | 'delete', userData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('user', action, userData);
      return false;
    }

    try {
      switch (action) {
        case 'create':
          await SupabaseService.createUser(userData);
          console.log('✅ Utilisateur synchronisé (création):', userData.email);
          break;
        case 'update':
          await SupabaseService.updateUser(userData.id, userData);
          console.log('✅ Utilisateur synchronisé (mise à jour):', userData.email);
          break;
        case 'delete':
          await SupabaseService.deleteUser(userData.id);
          console.log('✅ Utilisateur synchronisé (suppression):', userData.id);
          break;
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur sync utilisateur:', error);
      this.addToSyncQueue('user', action, userData);
      return false;
    }
  }

  // Synchroniser une mission
  static async syncMission(action: 'create' | 'update' | 'delete', missionData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('mission', action, missionData);
      return false;
    }

    try {
      switch (action) {
        case 'create':
          await SupabaseService.createMission(missionData);
          console.log('✅ Mission synchronisée (création):', missionData.reference);
          break;
        case 'update':
          await SupabaseService.updateMission(missionData.id, missionData);
          console.log('✅ Mission synchronisée (mise à jour):', missionData.reference);
          break;
        case 'delete':
          await SupabaseService.deleteMission(missionData.id);
          console.log('✅ Mission synchronisée (suppression):', missionData.id);
          break;
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur sync mission:', error);
      this.addToSyncQueue('mission', action, missionData);
      return false;
    }
  }

  // Synchroniser un document
  static async syncDocument(action: 'create' | 'delete', documentData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('document', action, documentData);
      return false;
    }

    try {
      switch (action) {
        case 'create':
          await SupabaseService.createDocument(documentData);
          console.log('✅ Document synchronisé (création):', documentData.title);
          break;
        case 'delete':
          await SupabaseService.deleteDocument(documentData.id);
          console.log('✅ Document synchronisé (suppression):', documentData.id);
          break;
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur sync document:', error);
      this.addToSyncQueue('document', action, documentData);
      return false;
    }
  }

  // Synchroniser une constatation
  static async syncFinding(action: 'create', findingData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('finding', action, findingData);
      return false;
    }

    try {
      await SupabaseService.createFinding(findingData);
      console.log('✅ Constatation synchronisée:', findingData.description?.substring(0, 50));
      return true;
    } catch (error) {
      console.error('❌ Erreur sync constatation:', error);
      this.addToSyncQueue('finding', action, findingData);
      return false;
    }
  }

  // Synchroniser une sanction
  static async syncSanction(action: 'create' | 'update' | 'delete', sanctionData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('sanction', action, sanctionData);
      return false;
    }

    try {
      switch (action) {
        case 'create':
          await SupabaseService.createSanction(sanctionData);
          console.log('✅ Sanction synchronisée (création):', sanctionData.type);
          break;
        case 'update':
          await SupabaseService.updateSanction(sanctionData.id, sanctionData);
          console.log('✅ Sanction synchronisée (mise à jour):', sanctionData.type);
          break;
        case 'delete':
          await SupabaseService.deleteSanction(sanctionData.id);
          console.log('✅ Sanction synchronisée (suppression):', sanctionData.id);
          break;
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur sync sanction:', error);
      this.addToSyncQueue('sanction', action, sanctionData);
      return false;
    }
  }

  // Synchroniser une remarque
  static async syncRemark(action: 'create', remarkData: any): Promise<boolean> {
    if (!this.isSupabaseConnected) {
      this.addToSyncQueue('remark', action, remarkData);
      return false;
    }

    try {
      await SupabaseService.createRemark(remarkData);
      console.log('✅ Remarque synchronisée:', remarkData.content?.substring(0, 50));
      return true;
    } catch (error) {
      console.error('❌ Erreur sync remarque:', error);
      this.addToSyncQueue('remark', action, remarkData);
      return false;
    }
  }

  // Ajouter à la file d'attente de synchronisation
  private static addToSyncQueue(type: string, action: string, data: any): void {
    this.syncQueue.push({ type, action, data });
    console.log(`📋 Ajouté à la file de sync: ${type} ${action}`);
  }

  // Traiter la file d'attente de synchronisation
  static async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    console.log(`🔄 Traitement de ${this.syncQueue.length} éléments en attente...`);

    const processedItems = [];

    for (const item of this.syncQueue) {
      try {
        let success = false;

        switch (item.type) {
          case 'user':
            success = await this.syncUser(item.action as any, item.data);
            break;
          case 'mission':
            success = await this.syncMission(item.action as any, item.data);
            break;
          case 'document':
            success = await this.syncDocument(item.action as any, item.data);
            break;
          case 'finding':
            success = await this.syncFinding(item.action as any, item.data);
            break;
          case 'sanction':
            success = await this.syncSanction(item.action as any, item.data);
            break;
          case 'remark':
            success = await this.syncRemark(item.action as any, item.data);
            break;
        }

        if (success) {
          processedItems.push(item);
        }
      } catch (error) {
        console.error(`❌ Erreur traitement ${item.type}:`, error);
      }
    }

    // Retirer les éléments traités avec succès
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item));
    
    console.log(`✅ ${processedItems.length} éléments synchronisés`);
    if (this.syncQueue.length > 0) {
      console.log(`⚠️ ${this.syncQueue.length} éléments restent en attente`);
    }

    this.isSyncing = false;
  }

  // Forcer la reconnexion et synchronisation
  static async forceSync(): Promise<boolean> {
    try {
      console.log('🔄 Tentative de reconnexion Supabase...');
      this.isSupabaseConnected = await SupabaseService.testConnection();
      
      if (this.isSupabaseConnected) {
        console.log('✅ Reconnexion réussie');
        await this.processSyncQueue();
        return true;
      } else {
        console.log('❌ Reconnexion échouée');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur reconnexion:', error);
      return false;
    }
  }

  // Obtenir le statut de la file d'attente
  static getSyncQueueStatus(): { pending: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    
    this.syncQueue.forEach(item => {
      types[item.type] = (types[item.type] || 0) + 1;
    });

    return {
      pending: this.syncQueue.length,
      types
    };
  }

  // Vider la file d'attente (pour les tests)
  static clearSyncQueue(): void {
    this.syncQueue = [];
    console.log('🧹 File de synchronisation vidée');
  }

  // Vérifier l'intégrité des données
  static async verifyDataIntegrity(): Promise<{
    local: Record<string, number>;
    supabase: Record<string, number>;
    differences: Record<string, number>;
  }> {
    const result = {
      local: {} as Record<string, number>,
      supabase: {} as Record<string, number>,
      differences: {} as Record<string, number>
    };

    try {
      // Compter les données locales (localStorage)
      const localMissions = JSON.parse(localStorage.getItem('cdp_missions') || '[]');
      const localUsers = JSON.parse(localStorage.getItem('cdp_users') || '[]');
      
      result.local = {
        missions: localMissions.length,
        users: localUsers.length,
        documents: localMissions.reduce((sum: number, m: any) => sum + (m.documents?.length || 0), 0),
        findings: localMissions.reduce((sum: number, m: any) => sum + (m.findings?.length || 0), 0),
        sanctions: localMissions.reduce((sum: number, m: any) => sum + (m.sanctions?.length || 0), 0),
        remarks: localMissions.reduce((sum: number, m: any) => sum + (m.remarks?.length || 0), 0)
      };

      // Compter les données Supabase
      if (this.isSupabaseConnected) {
        const tables = ['users', 'missions', 'documents', 'findings', 'sanctions', 'remarks'];
        
        for (const table of tables) {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && data) {
              result.supabase[table] = data.length;
            } else {
              result.supabase[table] = 0;
            }
          } catch (err) {
            result.supabase[table] = 0;
          }
        }

        // Calculer les différences
        Object.keys(result.local).forEach(key => {
          const localCount = result.local[key] || 0;
          const supabaseCount = result.supabase[key] || 0;
          result.differences[key] = localCount - supabaseCount;
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur vérification intégrité:', error);
      return result;
    }
  }
}