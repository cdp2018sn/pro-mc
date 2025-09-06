import { Mission, Document, Sanction, Remark, Finding } from '../types/mission';
import { SupabaseService } from '../services/supabaseService';

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
      console.log('🔧 Initialisation de la base de données...');
      this.useSupabase = await SupabaseService.testConnection();
      this.isInitialized = true;
      
      if (this.useSupabase) {
        console.log('✅ Base de données Supabase connectée');
        await this.syncLocalToSupabase();
      } else {
        console.log('⚠️ Mode localStorage - Supabase non disponible');
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      this.useSupabase = false;
      this.isInitialized = true;
    }
  }

  private async ensureInitialized() {
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
  }

  // ==================== MISSIONS ====================
  
  async getAllMissions(): Promise<Mission[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        const missions = await SupabaseService.getMissions();
        this.saveMissionsToLocalStorage(missions);
        return missions;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getMissionsFromLocalStorage();
  }

  async addMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        const newMission = await SupabaseService.createMission(mission);
        this.addMissionToLocalStorage(newMission);
        return newMission;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.addMissionToLocalStorage(mission);
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        await SupabaseService.updateMission(id, updates);
        this.updateMissionInLocalStorage(id, updates);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.updateMissionInLocalStorage(id, updates);
  }

  async deleteMission(id: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteMission(id);
        this.deleteMissionFromLocalStorage(id);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.deleteMissionFromLocalStorage(id);
  }

  // ==================== DOCUMENTS ====================
  
  async getDocumentsForMission(missionId: string): Promise<Document[]> {
    await this.ensureInitialized();
    
    if (this.useSupabase) {
      try {
        return await SupabaseService.getDocuments(missionId);
      } catch (error) {
        console.error('Erreur Supabase documents, fallback localStorage:', error);
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
        return;
      } catch (error) {
        console.error('Erreur Supabase document, fallback localStorage:', error);
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
        return;
      } catch (error) {
        console.error('Erreur Supabase suppression document, fallback localStorage:', error);
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
        console.error('Erreur Supabase findings, fallback localStorage:', error);
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
      findingData = finding;
    }
    
    const fullFindingData = { ...findingData, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createFinding(fullFindingData);
        return;
      } catch (error) {
        console.error('Erreur Supabase finding, fallback localStorage:', error);
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
        console.error('Erreur Supabase sanctions, fallback localStorage:', error);
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
      sanctionData = sanction;
    }
    
    const fullSanctionData = { ...sanctionData, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createSanction(fullSanctionData);
        return;
      } catch (error) {
        console.error('Erreur Supabase sanction, fallback localStorage:', error);
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
        return;
      } catch (error) {
        console.error('Erreur Supabase mise à jour sanction, fallback localStorage:', error);
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
        return;
      } catch (error) {
        console.error('Erreur Supabase suppression sanction, fallback localStorage:', error);
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
        console.error('Erreur Supabase remarques, fallback localStorage:', error);
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
        return;
      } catch (error) {
        console.error('Erreur Supabase remarque, fallback localStorage:', error);
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
        console.error('Erreur Supabase statuts, fallback localStorage:', error);
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
      return stored ? JSON.parse(stored) : [];
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
      documents: (missionData as Mission).documents || []
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
          } catch (error) {
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

  // Méthodes pour la compatibilité avec l'ancien code
  async updateMissionReponseStatus(missionId: string, reponseRecue: boolean, dateReponse?: string): Promise<void> {
    await this.updateMission(missionId, {
      reponse_recue: reponseRecue,
      date_derniere_reponse: dateReponse
    });
  }

  async addReponseSuivi(missionId: string, reponse: any): Promise<void> {
    await this.addRemark(missionId, `Réponse du ${reponse.date_reponse}: ${reponse.contenu}`);
  }

  async reconnectSupabase(): Promise<boolean> {
    this.useSupabase = await SupabaseService.testConnection();
    return this.useSupabase;
  }

  getConnectionStatus(): 'supabase' | 'localStorage' {
    return this.useSupabase ? 'supabase' : 'localStorage';
  }
}

// Instance unique de la base de données
export const db = new UnifiedDatabase();