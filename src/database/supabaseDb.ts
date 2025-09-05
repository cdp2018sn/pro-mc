import { SupabaseService } from '../services/supabaseService';
import { Mission, Document, Finding, Sanction, Remark, ReponseSuivi } from '../types/mission';

// Classe pour gérer la base de données Supabase avec fallback localStorage
export class SupabaseDatabase {
  private useSupabase = true;

  constructor() {
    // Mode local uniquement - pas de connexion Supabase
    this.useSupabase = false;
    console.log('⚠️ Mode local activé - pas de connexion Supabase');
  }

  private async checkSupabaseConnection() {
    try {
      this.useSupabase = await SupabaseService.testConnection();
      if (this.useSupabase) {
        console.log('✅ Base de données Supabase connectée');
      } else {
        console.log('⚠️ Fallback vers localStorage');
      }
    } catch (error) {
      console.error('Erreur de connexion Supabase:', error);
      this.useSupabase = false;
    }
  }

  // ==================== MISSIONS ====================
  
  async getAllMissions(): Promise<Mission[]> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.getMissions();
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    // Fallback localStorage
    return this.getMissionsFromLocalStorage();
  }

  async addMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
    if (this.useSupabase) {
      try {
        const newMission = await SupabaseService.createMission(mission);
        // Aussi sauvegarder en localStorage pour la synchronisation
        this.saveMissionToLocalStorage(newMission);
        return newMission;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    // Fallback localStorage
    return this.addMissionToLocalStorage(mission);
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<void> {
    if (this.useSupabase) {
      try {
        await SupabaseService.updateMission(id, updates);
        // Aussi mettre à jour en localStorage
        this.updateMissionInLocalStorage(id, updates);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    // Fallback localStorage
    this.updateMissionInLocalStorage(id, updates);
  }

  async deleteMission(id: string): Promise<void> {
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteMission(id);
        // Aussi supprimer de localStorage
        this.deleteMissionFromLocalStorage(id);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    // Fallback localStorage
    this.deleteMissionFromLocalStorage(id);
  }

  // ==================== DOCUMENTS ====================
  
  async getDocumentsForMission(missionId: string): Promise<Document[]> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.getDocuments(missionId);
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getDocumentsFromLocalStorage(missionId);
  }

  async addDocument(missionId: string, document: Omit<Document, 'id' | 'mission_id'>): Promise<void> {
    const documentData = { ...document, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createDocument(documentData);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addDocumentToLocalStorage(missionId, document);
  }

  async deleteDocument(missionId: string, documentId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteDocument(documentId);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.deleteDocumentFromLocalStorage(missionId, documentId);
  }

  // ==================== CONSTATATIONS ====================
  
  async getFindingsForMission(missionId: string): Promise<Finding[]> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.getFindings(missionId);
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getFindingsFromLocalStorage(missionId);
  }

  async addFinding(missionId: string, finding: Omit<Finding, 'id' | 'mission_id'>): Promise<void> {
    const findingData = { ...finding, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createFinding(findingData);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addFindingToLocalStorage(missionId, finding);
  }

  // ==================== SANCTIONS ====================
  
  async getSanctionsForMission(missionId: string): Promise<Sanction[]> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.getSanctions(missionId);
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getSanctionsFromLocalStorage(missionId);
  }

  async addSanction(missionId: string, sanction: Omit<Sanction, 'id' | 'mission_id'>): Promise<void> {
    const sanctionData = { ...sanction, mission_id: missionId };
    
    if (this.useSupabase) {
      try {
        await SupabaseService.createSanction(sanctionData);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addSanctionToLocalStorage(missionId, sanction);
  }

  async updateSanction(sanctionId: string, updates: Partial<Sanction>): Promise<void> {
    if (this.useSupabase) {
      try {
        await SupabaseService.updateSanction(sanctionId, updates);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.updateSanctionInLocalStorage(sanctionId, updates);
  }

  async deleteSanction(sanctionId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        await SupabaseService.deleteSanction(sanctionId);
        return;
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.deleteSanctionFromLocalStorage(sanctionId);
  }

  // ==================== REMARQUES ====================
  
  async getRemarksForMission(missionId: string): Promise<Remark[]> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.getRemarks(missionId);
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    return this.getRemarksFromLocalStorage(missionId);
  }

  async addRemark(missionId: string, content: string): Promise<void> {
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
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    this.addRemarkToLocalStorage(missionId, content);
  }

  // ==================== MÉTHODES LOCALSTORAGE ====================
  
  private getMissionsFromLocalStorage(): Mission[] {
    try {
      const stored = localStorage.getItem('cdp_missions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur localStorage:', error);
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

  private saveMissionToLocalStorage(mission: Mission): void {
    const missions = this.getMissionsFromLocalStorage();
    missions.push(mission);
    this.saveMissionsToLocalStorage(missions);
  }

  private addMissionToLocalStorage(missionData: Omit<Mission, 'id'>): Mission {
    const newMission: Mission = {
      ...missionData,
      id: `mission-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.saveMissionToLocalStorage(newMission);
    return newMission;
  }

  private updateMissionInLocalStorage(id: string, updates: Partial<Mission>): void {
    const missions = this.getMissionsFromLocalStorage();
    const index = missions.findIndex(m => m.id === id);
    if (index !== -1) {
      missions[index] = { ...missions[index], ...updates, updated_at: new Date().toISOString() };
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

  // ==================== UTILITAIRES ====================
  
  async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    if (this.useSupabase) {
      try {
        return await SupabaseService.updateMissionStatuses();
      } catch (error) {
        console.error('Erreur Supabase, fallback localStorage:', error);
        this.useSupabase = false;
      }
    }
    
    // Fallback localStorage
    return this.updateStatusesInLocalStorage();
  }

  private updateStatusesInLocalStorage(): { updated: number; started: number; completed: number } {
    const missions = this.getMissionsFromLocalStorage();
    const now = new Date();
    let started = 0;
    let completed = 0;

    for (const mission of missions) {
      if (mission.ignore_auto_status_change) continue;

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

  async checkUpcomingStatusChanges(): Promise<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }> {
    const missions = await this.getAllMissions();
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startingSoon = missions.filter(mission => {
      if (mission.ignore_auto_status_change) return false;
      if (mission.status !== 'PLANIFIEE') return false;
      const startDate = new Date(mission.start_date);
      return startDate >= now && startDate <= oneDayFromNow;
    });

    const endingSoon = missions.filter(mission => {
      if (mission.ignore_auto_status_change) return false;
      if (mission.status !== 'EN_COURS') return false;
      const endDate = new Date(mission.end_date);
      return endDate >= now && endDate <= oneWeekFromNow;
    });

    return { startingSoon, endingSoon };
  }

  // Méthode pour forcer la synchronisation avec Supabase
  async syncWithSupabase(): Promise<void> {
    if (!this.useSupabase) {
      console.log('Supabase non disponible, synchronisation impossible');
      return;
    }

    try {
      // Récupérer les données locales
      const localMissions = this.getMissionsFromLocalStorage();
      
      // Synchroniser chaque mission
      for (const mission of localMissions) {
        try {
          await SupabaseService.createMission(mission);
        } catch (error) {
          // Ignorer les erreurs de doublons
          if (!error.message.includes('duplicate')) {
            console.error('Erreur lors de la synchronisation de la mission:', error);
          }
        }
      }
      
      console.log('✅ Synchronisation avec Supabase terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }
}

export const db = new SupabaseDatabase();