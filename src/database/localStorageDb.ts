import { Mission, Document, Finding, Sanction, Remark, ReponseSuivi, MissionStatus } from '../types/mission';
import { User } from '../types/auth';
import { SupabaseService } from '../services/supabaseService';
import { GlobalSyncService } from '../services/globalSyncService';

// Service de base de données unifié qui utilise localStorage avec synchronisation Supabase
class UnifiedDatabase {
  private isSupabaseConnected = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    try {
      console.log('🔧 Initialisation de la base de données unifiée...');
      
      // Vérifier si Supabase est configuré
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('⚠️ Variables Supabase non configurées, mode localStorage uniquement');
        this.isSupabaseConnected = false;
        return;
      }

      this.isSupabaseConnected = await SupabaseService.testConnection();
      
      if (this.isSupabaseConnected) {
        console.log('✅ Base de données Supabase connectée');
        console.log('🔄 Synchronisation avec Supabase activée');
      } else {
        console.log('⚠️ Mode localStorage uniquement (Supabase non disponible)');
      }
    } catch (error) {
      console.log('⚠️ Erreur initialisation Supabase, mode localStorage:', error);
      this.isSupabaseConnected = false;
    }
  }

  private async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  private getStorageKey(table: string): string {
    return `cdp_${table}`;
  }

  private getLocalData<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erreur lecture localStorage ${table}:`, error);
      return [];
    }
  }

  private setLocalData<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur écriture localStorage ${table}:`, error);
    }
  }

  // ==================== MISSIONS ====================

  async getAllMissions(): Promise<Mission[]> {
    await this.ensureInitialized();
    
    try {
      // Récupérer depuis localStorage
      const localMissions = this.getLocalData<Mission>('missions');
      
      // Si Supabase est connecté, synchroniser
      if (this.isSupabaseConnected) {
        try {
          const supabaseMissions = await SupabaseService.getMissions();
          
          // Fusionner les données (Supabase a priorité)
          const mergedMissions = this.mergeMissions(localMissions, supabaseMissions);
          this.setLocalData('missions', mergedMissions);
          
          return mergedMissions;
        } catch (error) {
          console.log('⚠️ Erreur Supabase, utilisation localStorage:', error);
          return localMissions;
        }
      }
      
      return localMissions;
    } catch (error) {
      console.error('Erreur getAllMissions:', error);
      return [];
    }
  }

  private mergeMissions(local: Mission[], supabase: Mission[]): Mission[] {
    const merged = [...supabase];
    const supabaseIds = new Set(supabase.map(m => m.id));
    
    // Ajouter les missions locales qui ne sont pas dans Supabase
    local.forEach(mission => {
      if (!supabaseIds.has(mission.id)) {
        merged.push(mission);
      }
    });
    
    return merged;
  }

  async addMission(missionData: Omit<Mission, 'id'>): Promise<Mission> {
    await this.ensureInitialized();
    
    const newMission: Mission = {
      ...missionData,
      id: `mission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Sauvegarder localement
      const missions = this.getLocalData<Mission>('missions');
      missions.push(newMission);
      this.setLocalData('missions', missions);

      // Synchroniser avec Supabase si connecté
      if (this.isSupabaseConnected) {
        try {
          console.log('📡 Ajout mission dans Supabase...');
          await SupabaseService.createMission(newMission);
          console.log('✅ Mission ajoutée dans Supabase et localStorage');
          console.log(`✅ Mission synchronisée (création): ${newMission.reference}`);
        } catch (error) {
          console.log('⚠️ Erreur sync Supabase (mission sauvée localement):', error);
          // Ajouter à la file de synchronisation
          await GlobalSyncService.syncMission('create', newMission);
        }
      }

      return newMission;
    } catch (error) {
      console.error('Erreur addMission:', error);
      throw error;
    }
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Mettre à jour localement
      const missions = this.getLocalData<Mission>('missions');
      const index = missions.findIndex(m => m.id === id);
      
      if (index !== -1) {
        missions[index] = { 
          ...missions[index], 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase si connecté
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.updateMission(id, missions[index]);
            console.log(`✅ Mission synchronisée (mise à jour): ${missions[index].reference}`);
          } catch (error) {
            console.log('⚠️ Erreur sync mise à jour Supabase:', error);
            await GlobalSyncService.syncMission('update', missions[index]);
          }
        }
      }
    } catch (error) {
      console.error('Erreur updateMission:', error);
      throw error;
    }
  }

  async deleteMission(id: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // Supprimer localement
      const missions = this.getLocalData<Mission>('missions').filter(m => m.id !== id);
      this.setLocalData('missions', missions);

      // Synchroniser avec Supabase si connecté
      if (this.isSupabaseConnected) {
        try {
          await SupabaseService.deleteMission(id);
          console.log('✅ Mission supprimée de Supabase et localStorage');
        } catch (error) {
          console.log('⚠️ Erreur suppression Supabase:', error);
          await GlobalSyncService.syncMission('delete', { id });
        }
      }
    } catch (error) {
      console.error('Erreur deleteMission:', error);
      throw error;
    }
  }

  // ==================== DOCUMENTS ====================

  async getDocumentsForMission(missionId: string): Promise<Document[]> {
    await this.ensureInitialized();
    
    try {
      const missions = await this.getAllMissions();
      const mission = missions.find(m => m.id === missionId);
      return mission?.documents || [];
    } catch (error) {
      console.error('Erreur getDocumentsForMission:', error);
      return [];
    }
  }

  async addDocument(missionId: string, documentData: Omit<Document, 'id' | 'mission_id'>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const newDocument: Document = {
        ...documentData,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mission_id: missionId,
        created_at: new Date().toISOString()
      };

      // Ajouter au localStorage
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        if (!missions[missionIndex].documents) {
          missions[missionIndex].documents = [];
        }
        missions[missionIndex].documents.push(newDocument);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.createDocument(newDocument);
            console.log(`✅ Document synchronisé: ${newDocument.title}`);
          } catch (error) {
            console.log('⚠️ Erreur sync document Supabase:', error);
            await GlobalSyncService.syncDocument('create', newDocument);
          }
        }
      }
    } catch (error) {
      console.error('Erreur addDocument:', error);
      throw error;
    }
  }

  async deleteDocument(missionId: string, documentId: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1 && missions[missionIndex].documents) {
        missions[missionIndex].documents = missions[missionIndex].documents.filter(d => d.id !== documentId);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.deleteDocument(documentId);
            console.log('✅ Document supprimé de Supabase');
          } catch (error) {
            console.log('⚠️ Erreur suppression document Supabase:', error);
            await GlobalSyncService.syncDocument('delete', { id: documentId });
          }
        }
      }
    } catch (error) {
      console.error('Erreur deleteDocument:', error);
      throw error;
    }
  }

  // ==================== FINDINGS ====================

  async getFindingsForMission(missionId: string): Promise<Finding[]> {
    await this.ensureInitialized();
    
    try {
      const missions = await this.getAllMissions();
      const mission = missions.find(m => m.id === missionId);
      return mission?.findings || [];
    } catch (error) {
      console.error('Erreur getFindingsForMission:', error);
      return [];
    }
  }

  async addFinding(missionId: string, findingData: string | Omit<Finding, 'id' | 'mission_id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      let newFinding: Finding;
      
      if (typeof findingData === 'string') {
        newFinding = {
          id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mission_id: missionId,
          type: 'OBSERVATION',
          description: findingData,
          date_constat: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        newFinding = {
          ...findingData,
          id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mission_id: missionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Ajouter au localStorage
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        if (!missions[missionIndex].findings) {
          missions[missionIndex].findings = [];
        }
        missions[missionIndex].findings.push(newFinding);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.createFinding(newFinding);
            console.log(`✅ Constatation synchronisée: ${newFinding.description.substring(0, 50)}`);
          } catch (error) {
            console.log('⚠️ Erreur sync finding Supabase:', error);
            await GlobalSyncService.syncFinding('create', newFinding);
          }
        }
      }
    } catch (error) {
      console.error('Erreur addFinding:', error);
      throw error;
    }
  }

  // ==================== SANCTIONS ====================

  async getSanctionsForMission(missionId: string): Promise<Sanction[]> {
    await this.ensureInitialized();
    
    try {
      const missions = await this.getAllMissions();
      const mission = missions.find(m => m.id === missionId);
      return mission?.sanctions || [];
    } catch (error) {
      console.error('Erreur getSanctionsForMission:', error);
      return [];
    }
  }

  async addSanction(missionId: string, sanctionData: string | Omit<Sanction, 'id' | 'mission_id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      let newSanction: Sanction;
      
      if (typeof sanctionData === 'string') {
        newSanction = {
          id: `sanction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mission_id: missionId,
          type: 'AVERTISSEMENT',
          description: sanctionData,
          decision_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        newSanction = {
          ...sanctionData,
          id: `sanction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mission_id: missionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // Ajouter au localStorage
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        if (!missions[missionIndex].sanctions) {
          missions[missionIndex].sanctions = [];
        }
        missions[missionIndex].sanctions.push(newSanction);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.createSanction(newSanction);
            console.log(`✅ Sanction synchronisée: ${newSanction.type}`);
          } catch (error) {
            console.log('⚠️ Erreur sync sanction Supabase:', error);
            await GlobalSyncService.syncSanction('create', newSanction);
          }
        }
      }
    } catch (error) {
      console.error('Erreur addSanction:', error);
      throw error;
    }
  }

  async updateSanction(sanctionId: string, updates: Partial<Sanction>): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      
      for (const mission of missions) {
        if (mission.sanctions) {
          const sanctionIndex = mission.sanctions.findIndex(s => s.id === sanctionId);
          if (sanctionIndex !== -1) {
            mission.sanctions[sanctionIndex] = {
              ...mission.sanctions[sanctionIndex],
              ...updates,
              updated_at: new Date().toISOString()
            };
            mission.updated_at = new Date().toISOString();
            this.setLocalData('missions', missions);

            // Synchroniser avec Supabase
            if (this.isSupabaseConnected) {
              try {
                await SupabaseService.updateSanction(sanctionId, mission.sanctions[sanctionIndex]);
                console.log('✅ Sanction mise à jour dans Supabase');
              } catch (error) {
                console.log('⚠️ Erreur sync mise à jour sanction:', error);
                await GlobalSyncService.syncSanction('update', mission.sanctions[sanctionIndex]);
              }
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('Erreur updateSanction:', error);
      throw error;
    }
  }

  async deleteSanction(sanctionId: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      
      for (const mission of missions) {
        if (mission.sanctions) {
          const originalLength = mission.sanctions.length;
          mission.sanctions = mission.sanctions.filter(s => s.id !== sanctionId);
          
          if (mission.sanctions.length < originalLength) {
            mission.updated_at = new Date().toISOString();
            this.setLocalData('missions', missions);

            // Synchroniser avec Supabase
            if (this.isSupabaseConnected) {
              try {
                await SupabaseService.deleteSanction(sanctionId);
                console.log('✅ Sanction supprimée de Supabase');
              } catch (error) {
                console.log('⚠️ Erreur suppression sanction Supabase:', error);
                await GlobalSyncService.syncSanction('delete', { id: sanctionId });
              }
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('Erreur deleteSanction:', error);
      throw error;
    }
  }

  // ==================== REMARQUES ====================

  async getRemarksForMission(missionId: string): Promise<Remark[]> {
    await this.ensureInitialized();
    
    try {
      const missions = await this.getAllMissions();
      const mission = missions.find(m => m.id === missionId);
      return mission?.remarks || [];
    } catch (error) {
      console.error('Erreur getRemarksForMission:', error);
      return [];
    }
  }

  async addRemark(missionId: string, content: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const newRemark: Remark = {
        id: `remark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mission_id: missionId,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter au localStorage
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        if (!missions[missionIndex].remarks) {
          missions[missionIndex].remarks = [];
        }
        missions[missionIndex].remarks.push(newRemark);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.createRemark(newRemark);
            console.log(`✅ Remarque synchronisée: ${content.substring(0, 50)}`);
          } catch (error) {
            console.log('⚠️ Erreur sync remarque Supabase:', error);
            await GlobalSyncService.syncRemark('create', newRemark);
          }
        }
      }
    } catch (error) {
      console.error('Erreur addRemark:', error);
      throw error;
    }
  }

  // ==================== RÉPONSES SUIVI ====================

  async addReponseSuivi(missionId: string, reponse: ReponseSuivi): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        // Ajouter la réponse aux documents comme LETTRE_REPONSE
        const reponseDocument: Document = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          mission_id: missionId,
          title: `Réponse du ${new Date(reponse.date_reponse).toLocaleDateString('fr-FR')}`,
          type: 'LETTRE_REPONSE',
          file_path: '',
          file_content: reponse.contenu,
          created_at: reponse.created_at,
          reponse_recue: true,
          date_derniere_reponse: reponse.date_reponse
        };

        if (!missions[missionIndex].documents) {
          missions[missionIndex].documents = [];
        }
        missions[missionIndex].documents.push(reponseDocument);
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.createDocument(reponseDocument);
            console.log('✅ Réponse suivi synchronisée');
          } catch (error) {
            console.log('⚠️ Erreur sync réponse suivi:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur addReponseSuivi:', error);
      throw error;
    }
  }

  async updateMissionReponseStatus(missionId: string, reponseRecue: boolean, dateReponse?: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      const missionIndex = missions.findIndex(m => m.id === missionId);
      
      if (missionIndex !== -1) {
        // Mettre à jour le statut si une réponse est reçue
        if (reponseRecue && missions[missionIndex].status === 'ATTENTE_REPONSE') {
          missions[missionIndex].status = 'TERMINEE';
        }
        missions[missionIndex].updated_at = new Date().toISOString();
        this.setLocalData('missions', missions);

        // Synchroniser avec Supabase
        if (this.isSupabaseConnected) {
          try {
            await SupabaseService.updateMission(missionId, {
              status: missions[missionIndex].status,
              updated_at: missions[missionIndex].updated_at
            });
            console.log('✅ Statut réponse synchronisé');
          } catch (error) {
            console.log('⚠️ Erreur sync statut réponse:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur updateMissionReponseStatus:', error);
      throw error;
    }
  }

  // ==================== GESTION DES STATUTS ====================

  async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    await this.ensureInitialized();
    
    try {
      const missions = this.getLocalData<Mission>('missions');
      const now = new Date();
      let started = 0;
      let completed = 0;

      for (const mission of missions) {
        if (mission.ignoreAutoStatusChange) continue;

        let shouldUpdate = false;
        let newStatus = mission.status;

        // Missions planifiées qui doivent commencer
        if (mission.status === 'PLANIFIEE' && new Date(mission.start_date) <= now) {
          newStatus = 'EN_COURS';
          shouldUpdate = true;
          started++;
        }
        // Missions en cours qui doivent se terminer
        else if (mission.status === 'EN_COURS' && new Date(mission.end_date) <= now) {
          newStatus = 'TERMINEE';
          shouldUpdate = true;
          completed++;
        }

        if (shouldUpdate) {
          await this.updateMission(mission.id, {
            status: newStatus as MissionStatus,
            updated_at: new Date().toISOString()
          });
        }
      }

      return { updated: started + completed, started, completed };
    } catch (error) {
      console.error('Erreur updateMissionStatuses:', error);
      return { updated: 0, started: 0, completed: 0 };
    }
  }

  async checkUpcomingStatusChanges(): Promise<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }> {
    await this.ensureInitialized();
    
    try {
      const missions = await this.getAllMissions();
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const startingSoon = missions.filter(mission => {
        if (mission.status !== 'PLANIFIEE' || mission.ignoreAutoStatusChange) return false;
        const startDate = new Date(mission.start_date);
        return startDate >= now && startDate <= oneDayFromNow;
      });

      const endingSoon = missions.filter(mission => {
        if (mission.status !== 'EN_COURS' || mission.ignoreAutoStatusChange) return false;
        const endDate = new Date(mission.end_date);
        return endDate >= now && endDate <= oneWeekFromNow;
      });

      return { startingSoon, endingSoon };
    } catch (error) {
      console.error('Erreur checkUpcomingStatusChanges:', error);
      return { startingSoon: [], endingSoon: [] };
    }
  }

  // ==================== UTILITAIRES ====================

  async verifyDataIntegrity(): Promise<{
    local: Record<string, number>;
    supabase: Record<string, number>;
    differences: Record<string, number>;
  }> {
    await this.ensureInitialized();
    
    const result = {
      local: {} as Record<string, number>,
      supabase: {} as Record<string, number>,
      differences: {} as Record<string, number>
    };

    try {
      // Compter les données locales
      const localMissions = this.getLocalData<Mission>('missions');
      const localUsers = this.getLocalData<User>('users');
      
      result.local = {
        missions: localMissions.length,
        users: localUsers.length,
        documents: localMissions.reduce((sum, m) => sum + (m.documents?.length || 0), 0),
        findings: localMissions.reduce((sum, m) => sum + (m.findings?.length || 0), 0),
        sanctions: localMissions.reduce((sum, m) => sum + (m.sanctions?.length || 0), 0),
        remarks: localMissions.reduce((sum, m) => sum + (m.remarks?.length || 0), 0)
      };

      // Compter les données Supabase si connecté
      if (this.isSupabaseConnected) {
        try {
          const supabaseMissions = await SupabaseService.getMissions();
          const supabaseUsers = await SupabaseService.getUsers();
          
          result.supabase = {
            missions: supabaseMissions.length,
            users: supabaseUsers.length,
            documents: supabaseMissions.reduce((sum, m) => sum + (m.documents?.length || 0), 0),
            findings: supabaseMissions.reduce((sum, m) => sum + (m.findings?.length || 0), 0),
            sanctions: supabaseMissions.reduce((sum, m) => sum + (m.sanctions?.length || 0), 0),
            remarks: supabaseMissions.reduce((sum, m) => sum + (m.remarks?.length || 0), 0)
          };

          // Calculer les différences
          Object.keys(result.local).forEach(key => {
            const localCount = result.local[key] || 0;
            const supabaseCount = result.supabase[key] || 0;
            result.differences[key] = localCount - supabaseCount;
          });
        } catch (error) {
          console.log('⚠️ Erreur vérification Supabase:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur verifyDataIntegrity:', error);
      return result;
    }
  }

  // ==================== NETTOYAGE ====================

  async delete(): Promise<void> {
    const tables = ['missions', 'users', 'documents', 'findings', 'sanctions', 'remarks'];
    tables.forEach(table => {
      localStorage.removeItem(this.getStorageKey(table));
    });
  }

  async open(): Promise<void> {
    // Réinitialiser la connexion
    this.initPromise = this.initialize();
    await this.ensureInitialized();
  }
}

export const db = new UnifiedDatabase();