import { Mission, Document, Sanction, Remark, Finding, ReponseSuivi } from '../types/mission';
import { SupabaseService } from '../services/supabaseService';
import { GlobalSyncService } from '../services/globalSyncService';

// Base de données unifiée avec Supabase comme source principale et localStorage comme fallback
export class UnifiedDatabase {
  private useSupabase = false;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize() {
    try {
      console.log('🔧 Initialisation de la base de données unifiée...');
      
      // Forcer l'utilisation de Supabase en priorité
      console.log('🔍 Test de connexion Supabase...');
      this.useSupabase = await SupabaseService.testConnection();
      
      // Initialiser le service de synchronisation globale
      await GlobalSyncService.initialize();
      
      this.isInitialized = true;
      
      if (this.useSupabase) {
        console.log('✅ Base de données Supabase connectée');
        console.log('🔄 Synchronisation avec Supabase activée');
        await this.syncLocalToSupabase();
      } else {
        console.log('⚠️ Mode localStorage - Supabase non disponible');
        console.log('💡 Les données seront synchronisées dès que Supabase sera disponible');
        this.ensureLocalStorageStructure();
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      this.useSupabase = false;
      this.isInitialized = true;
      this.ensureLocalStorageStructure();
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
  }

  private ensureLocalStorageStructure() {
    try {
      // S'assurer que la structure localStorage existe
      if (!localStorage.getItem('cdp_missions')) {
        localStorage.setItem('cdp_missions', JSON.stringify([]));
      }
      if (!localStorage.getItem('cdp_users')) {
        localStorage.setItem('cdp_users', JSON.stringify([]));
      }
      console.log('✅ Structure localStorage initialisée');
    } catch (error) {
      console.error('Erreur initialisation localStorage:', error);
    }
  }

  // ==================== MISSIONS ====================
  
  async getAllMissions(): Promise<Mission[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        console.log('📡 Récupération des missions depuis Supabase...');
        const missions = await SupabaseService.getMissions();
        this.saveMissionsToLocalStorage(missions);
        console.log(`✅ ${missions.length} missions récupérées depuis Supabase`);
        return missions;
      } catch (error) {
        console.error('❌ Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    console.log('💾 Récupération des missions depuis localStorage...');
    const missions = this.getMissionsFromLocalStorage();
    console.log(`✅ ${missions.length} missions récupérées depuis localStorage`);
    return missions;
  }

  async addMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        console.log('📡 Ajout mission dans Supabase...');
        const newMission = await SupabaseService.createMission(mission);
        this.addMissionToLocalStorage(newMission);
        
        // Synchronisation globale
        await GlobalSyncService.syncMission('create', newMission);
        
        console.log('✅ Mission ajoutée dans Supabase et localStorage');
        return newMission;
      } catch (error) {
        console.error('❌ Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    console.log('💾 Ajout mission dans localStorage...');
    const newMission = this.addMissionToLocalStorage(mission);
    console.log('✅ Mission ajoutée dans localStorage');
    return newMission;
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        console.log('📡 Mise à jour mission dans Supabase...');
        await SupabaseService.updateMission(id, updates);
        this.updateMissionInLocalStorage(id, updates);
        
        // Synchronisation globale
        await GlobalSyncService.syncMission('update', { id, ...updates });
        
        console.log('✅ Mission mise à jour dans Supabase et localStorage');
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    console.log('💾 Mise à jour mission dans localStorage...');
    this.updateMissionInLocalStorage(id, updates);
    console.log('✅ Mission mise à jour dans localStorage');
  }

  async deleteMission(id: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        console.log('📡 Suppression mission dans Supabase...');
        await SupabaseService.deleteMission(id);
        this.deleteMissionFromLocalStorage(id);
        
        // Synchronisation globale
        await GlobalSyncService.syncMission('delete', { id });
        
        console.log('✅ Mission supprimée dans Supabase et localStorage');
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    console.log('💾 Suppression mission dans localStorage...');
    this.deleteMissionFromLocalStorage(id);
    console.log('✅ Mission supprimée dans localStorage');
  }

  // ==================== DOCUMENTS ====================
  
  async getDocumentsForMission(missionId: string): Promise<Document[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.getDocuments(missionId);
      } catch (error) {
        console.error('❌ Erreur Supabase documents, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getDocumentsFromLocalStorage(missionId);
  }

  async addDocument(missionId: string, document: Omit<Document, 'id' | 'mission_id'>): Promise<void> {
    await this.ensureInitialized();
    
    const documentData = { ...document, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createDocument(documentData);
        this.addDocumentToLocalStorage(missionId, document);
        
        // Synchronisation globale
        await GlobalSyncService.syncDocument('create', { ...documentData, mission_id: missionId });
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase document, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addDocumentToLocalStorage(missionId, document);
  }

  async deleteDocument(missionId: string, documentId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteDocument(documentId);
        this.deleteDocumentFromLocalStorage(missionId, documentId);
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase suppression document, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.deleteDocumentFromLocalStorage(missionId, documentId);
  }

  // ==================== CONSTATATIONS ====================
  
  async getFindingsForMission(missionId: string): Promise<Finding[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.getFindings(missionId);
      } catch (error) {
        console.error('❌ Erreur Supabase findings, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getFindingsFromLocalStorage(missionId);
  }

  async addFinding(missionId: string, finding: string | Omit<Finding, 'id' | 'mission_id'>): Promise<void> {
    await this.ensureInitialized();
    
    let findingData: Omit<Finding, 'id' | 'mission_id'>;
    
    if (typeof finding === 'string') {
      findingData = {
        type: 'OBSERVATION',
        description: finding,
        reference_legale: '',
        recommandation: '',
        delai_correction: 30,
        date_constat: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      findingData = {
        ...finding,
        created_at: finding.created_at || new Date().toISOString(),
        updated_at: finding.updated_at || new Date().toISOString()
      };
    }
    
    const fullFindingData = { ...findingData, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createFinding(fullFindingData);
        this.addFindingToLocalStorage(missionId, findingData);
        
        // Synchronisation globale
        await GlobalSyncService.syncFinding('create', fullFindingData);
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase finding, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addFindingToLocalStorage(missionId, findingData);
  }

  // ==================== SANCTIONS ====================
  
  async getSanctionsForMission(missionId: string): Promise<Sanction[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.getSanctions(missionId);
      } catch (error) {
        console.error('❌ Erreur Supabase sanctions, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getSanctionsFromLocalStorage(missionId);
  }

  async addSanction(missionId: string, sanction: string | Omit<Sanction, 'id' | 'mission_id'>): Promise<void> {
    await this.ensureInitialized();
    
    let sanctionData: Omit<Sanction, 'id' | 'mission_id'>;
    
    if (typeof sanction === 'string') {
      sanctionData = {
        type: 'AVERTISSEMENT',
        description: sanction,
        decision_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      sanctionData = {
        ...sanction,
        created_at: sanction.created_at || new Date().toISOString(),
        updated_at: sanction.updated_at || new Date().toISOString()
      };
    }
    
    const fullSanctionData = { ...sanctionData, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createSanction(fullSanctionData);
        this.addSanctionToLocalStorage(missionId, sanctionData);
        
        // Synchronisation globale
        await GlobalSyncService.syncSanction('create', fullSanctionData);
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase sanction, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addSanctionToLocalStorage(missionId, sanctionData);
  }

  async updateSanction(sanctionId: string, updates: Partial<Sanction>): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        await SupabaseService.updateSanction(sanctionId, updates);
        this.updateSanctionInLocalStorage(sanctionId, updates);
        
        // Synchronisation globale
        await GlobalSyncService.syncSanction('update', { id: sanctionId, ...updates });
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase mise à jour sanction, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.updateSanctionInLocalStorage(sanctionId, updates);
  }

  async deleteSanction(sanctionId: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteSanction(sanctionId);
        this.deleteSanctionFromLocalStorage(sanctionId);
        
        // Synchronisation globale
        await GlobalSyncService.syncSanction('delete', { id: sanctionId });
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase suppression sanction, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.deleteSanctionFromLocalStorage(sanctionId);
  }

  // ==================== REMARQUES ====================
  
  async getRemarksForMission(missionId: string): Promise<Remark[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.getRemarks(missionId);
      } catch (error) {
        console.error('❌ Erreur Supabase remarques, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getRemarksFromLocalStorage(missionId);
  }

  async addRemark(missionId: string, content: string): Promise<void> {
    await this.ensureInitialized();
    
    const remarkData = {
      mission_id: missionId,
      content,
      author_name: 'Utilisateur actuel'
    };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createRemark(remarkData);
        this.addRemarkToLocalStorage(missionId, content);
        
        // Synchronisation globale
        await GlobalSyncService.syncRemark('create', remarkData);
        
        return;
      } catch (error) {
        console.error('❌ Erreur Supabase remarque, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addRemarkToLocalStorage(missionId, content);
  }

  // ==================== UTILITAIRES ====================
  
  async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.updateMissionStatuses();
      } catch (error) {
        console.error('❌ Erreur Supabase statuts, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.updateStatusesInLocalStorage();
  }

  async checkUpcomingStatusChanges(): Promise<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }> {
    await this.ensureInitialized();
    
    const missions = await this.getAllMissions();
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startingSoon = missions.filter(mission => {
      if (mission.ignoreAutoStatusChange) return false;
      if (mission.status !== 'PLANIFIEE') return false;
      const startDate = new Date(mission.start_date);
      return startDate >= now && startDate <= oneDayFromNow;
    });

    const endingSoon = missions.filter(mission => {
      if (mission.ignoreAutoStatusChange) return false;
      if (mission.status !== 'EN_COURS') return false;
      const endDate = new Date(mission.end_date);
      return endDate >= now && endDate <= oneWeekFromNow;
    });

    return { startingSoon, endingSoon };
  }

  // ==================== MÉTHODES LOCALSTORAGE ====================
  
  private getMissionsFromLocalStorage(): Mission[] {
    try {
      const stored = localStorage.getItem('cdp_missions');
      const missions = stored ? JSON.parse(stored) : [];
      
      // S'assurer que chaque mission a la structure complète
      return missions.map((mission: any) => ({
        ...mission,
        findings: mission.findings || [],
        remarks: mission.remarks || [],
        sanctions: mission.sanctions || [],
        documents: mission.documents || [],
        team_members: mission.team_members || [],
        objectives: mission.objectives || []
      }));
    } catch (error) {
      console.error('Erreur localStorage missions:', error);
      return [];
    }
  }

  private saveMissionsToLocalStorage(missions: Mission[]): void {
    try {
      localStorage.setItem('cdp_missions', JSON.stringify(missions));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
  }

  private addMissionToLocalStorage(missionData: Omit<Mission, 'id'> | Mission): Mission {
    const missions = this.getMissionsFromLocalStorage();
    
    const newMission: Mission = {
      ...missionData,
      id: (missionData as Mission).id || `mission-${Date.now()}`,
      created_at: (missionData as Mission).created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      findings: (missionData as Mission).findings || [],
      remarks: (missionData as Mission).remarks || [],
      sanctions: (missionData as Mission).sanctions || [],
      documents: (missionData as Mission).documents || [],
      team_members: (missionData as Mission).team_members || [],
      objectives: (missionData as Mission).objectives || []
    };
    
    missions.push(newMission);
    this.saveMissionsToLocalStorage(missions);
    return newMission;
  }

  private updateMissionInLocalStorage(id: string, updates: Partial<Mission>): void {
    const missions = this.getMissionsFromLocalStorage();
    const index = missions.findIndex(m => m.id === id);
    if (index !== -1) {
      missions[index] = { 
        ...missions[index], 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private deleteMissionFromLocalStorage(id: string): void {
    const missions = this.getMissionsFromLocalStorage();
    const filtered = missions.filter(m => m.id !== id);
    this.saveMissionsToLocalStorage(filtered);
  }

  private getDocumentsFromLocalStorage(missionId: string): Document[] {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    return mission?.documents || [];
  }

  private addDocumentToLocalStorage(missionId: string, document: Omit<Document, 'id' | 'mission_id'>): void {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      if (!mission.documents) mission.documents = [];
      mission.documents.push({
        ...document,
        id: `doc-${Date.now()}`,
        mission_id: missionId
      });
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private deleteDocumentFromLocalStorage(missionId: string, documentId: string): void {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    if (mission && mission.documents) {
      mission.documents = mission.documents.filter(d => d.id !== documentId);
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private getFindingsFromLocalStorage(missionId: string): Finding[] {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    return mission?.findings || [];
  }

  private addFindingToLocalStorage(missionId: string, finding: Omit<Finding, 'id' | 'mission_id'>): void {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      if (!mission.findings) mission.findings = [];
      mission.findings.push({
        ...finding,
        id: `finding-${Date.now()}`,
        mission_id: missionId,
        created_at: finding.created_at || new Date().toISOString(),
        updated_at: finding.updated_at || new Date().toISOString()
      });
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private getSanctionsFromLocalStorage(missionId: string): Sanction[] {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    return mission?.sanctions || [];
  }

  private addSanctionToLocalStorage(missionId: string, sanction: Omit<Sanction, 'id' | 'mission_id'>): void {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      if (!mission.sanctions) mission.sanctions = [];
      mission.sanctions.push({
        ...sanction,
        id: `sanction-${Date.now()}`,
        mission_id: missionId,
        created_at: sanction.created_at || new Date().toISOString(),
        updated_at: sanction.updated_at || new Date().toISOString()
      });
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private updateSanctionInLocalStorage(sanctionId: string, updates: Partial<Sanction>): void {
    const missions = this.getMissionsFromLocalStorage();
    for (const mission of missions) {
      if (mission.sanctions) {
        const index = mission.sanctions.findIndex(s => s.id === sanctionId);
        if (index !== -1) {
          mission.sanctions[index] = { 
            ...mission.sanctions[index], 
            ...updates, 
            updated_at: new Date().toISOString() 
          };
          this.saveMissionsToLocalStorage(missions);
          break;
        }
      }
    }
  }

  private deleteSanctionFromLocalStorage(sanctionId: string): void {
    const missions = this.getMissionsFromLocalStorage();
    for (const mission of missions) {
      if (mission.sanctions) {
        mission.sanctions = mission.sanctions.filter(s => s.id !== sanctionId);
        this.saveMissionsToLocalStorage(missions);
        break;
      }
    }
  }

  private getRemarksFromLocalStorage(missionId: string): Remark[] {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    return mission?.remarks || [];
  }

  private addRemarkToLocalStorage(missionId: string, content: string): void {
    const missions = this.getMissionsFromLocalStorage();
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      if (!mission.remarks) mission.remarks = [];
      mission.remarks.push({
        id: `remark-${Date.now()}`,
        mission_id: missionId,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      this.saveMissionsToLocalStorage(missions);
    }
  }

  private updateStatusesInLocalStorage(): { updated: number; started: number; completed: number } {
    const missions = this.getMissionsFromLocalStorage();
    const now = new Date();
    let started = 0;
    let completed = 0;

    for (const mission of missions) {
      if (mission.ignoreAutoStatusChange) continue;

      const startDate = new Date(mission.start_date);
      const endDate = new Date(mission.end_date);

      if (mission.status === 'PLANIFIEE' && now >= startDate) {
        mission.status = 'EN_COURS';
        mission.updated_at = new Date().toISOString();
        started++;
      } else if (mission.status === 'EN_COURS' && now > endDate) {
        mission.status = 'TERMINEE';
        mission.updated_at = new Date().toISOString();
        completed++;
      }
    }

    this.saveMissionsToLocalStorage(missions);
    return { updated: started + completed, started, completed };
  }

  // ==================== SYNCHRONISATION ====================
  
  private async syncLocalToSupabase(): Promise<void> {
    try {
      const localMissions = this.getMissionsFromLocalStorage();
      
      if (localMissions.length > 0) {
        console.log(`🔄 Synchronisation de ${localMissions.length} missions locales vers Supabase...`);
        
        for (const mission of localMissions) {
          try {
            const existing = await SupabaseService.getMissionById(mission.id);
            if (!existing) {
              await SupabaseService.createMission(mission);
              console.log(`✅ Mission ${mission.reference} synchronisée`);
            }
          } catch (error: any) {
            if (!error.message.includes('duplicate')) {
              console.error(`❌ Erreur sync mission ${mission.reference}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }

  // ==================== MÉTHODES COMPATIBILITÉ ====================
  
  async updateMissionReponseStatus(missionId: string, reponseRecue: boolean, dateReponse?: string): Promise<void> {
    await this.updateMission(missionId, {
      reponse_recue: reponseRecue,
      date_derniere_reponse: dateReponse
    });
  }

  async addReponseSuivi(missionId: string, reponse: ReponseSuivi): Promise<void> {
    await this.addRemark(missionId, `Réponse du ${reponse.date_reponse}: ${reponse.contenu}`);
  }

  async reconnectSupabase(): Promise<boolean> {
    this.useSupabase = await SupabaseService.testConnection();
    if (this.useSupabase) {
      await this.syncLocalToSupabase();
    }
    return this.useSupabase;
  }

  getConnectionStatus(): 'supabase' | 'localStorage' {
    return this.useSupabase ? 'supabase' : 'localStorage';
  }

  // Nouvelle méthode pour vérifier l'intégrité des données
  async verifyDataIntegrity(): Promise<{
    local: Record<string, number>;
    supabase: Record<string, number>;
    differences: Record<string, number>;
  }> {
    return await GlobalSyncService.verifyDataIntegrity();
  }

  // Nouvelle méthode pour forcer la synchronisation
  async forceGlobalSync(): Promise<boolean> {
    return await GlobalSyncService.forceSync();
  }

  // Obtenir le statut de synchronisation
  getGlobalSyncStatus(): 'connected' | 'offline' | 'syncing' {
    return GlobalSyncService.getConnectionStatus();
  }

  // ==================== MÉTHODES PUBLIQUES POUR COMPATIBILITÉ ====================
  
  async open(): Promise<void> {
    await this.ensureInitialized();
  }

  async delete(): Promise<void> {
    try {
      localStorage.removeItem('cdp_missions');
      localStorage.removeItem('cdp_users');
      this.ensureLocalStorageStructure();
    } catch (error) {
      console.error('Erreur suppression localStorage:', error);
    }
  }
}

// Instance unique de la base de données
export const db = new UnifiedDatabase();