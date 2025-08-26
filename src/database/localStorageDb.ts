import { Mission, Document, ReponseSuivi, Sanction, Remark, Finding } from '../types/mission';
import Dexie, { Table } from 'dexie';

class LocalStorageDatabase extends Dexie {
  missions!: Table<Mission>;
  remarks!: Table<Remark>;
  findings!: Table<Finding>;
  sanctions!: Table<Sanction>;
  documents!: Table<Document>;

  constructor() {
    super('MissionDatabase');
    this.version(1).stores({
      missions: '++id, reference, title, status, organization, start_date, end_date, type_mission, motif_controle',
      remarks: '++id, mission_id, content, created_at, updated_at',
      findings: '++id, mission_id, type, description, date_constat, created_at, updated_at',
      sanctions: '++id, mission_id, type, description, decision_date, amount, created_at, updated_at',
      documents: '++id, mission_id, title, type, file_path, created_at'
    });
  }

  // Missions
  async getAllMissions(): Promise<Mission[]> {
    return await this.missions.toArray();
  }

  async addMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
    const id = await this.missions.add({
      ...mission,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { ...mission, id: id.toString() };
  }

  async updateMission(id: string, data: Partial<Mission>): Promise<void> {
    await this.missions.update(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  }

  async deleteMission(id: string): Promise<void> {
    await this.missions.delete(id);
    // Supprimer également les données associées
    await this.remarks.where('mission_id').equals(id).delete();
    await this.findings.where('mission_id').equals(id).delete();
    await this.sanctions.where('mission_id').equals(id).delete();
    await this.documents.where('mission_id').equals(id).delete();
  }

  // Remarques
  async addRemark(missionId: string, content: string): Promise<void> {
    await this.remarks.add({
      id: Date.now().toString(),
      mission_id: missionId,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  async getRemarksForMission(missionId: string): Promise<Remark[]> {
    return await this.remarks.where('mission_id').equals(missionId).toArray();
  }

  // Findings
  async addFinding(missionId: string, finding: Omit<Finding, 'id' | 'mission_id'>): Promise<void> {
    await this.findings.add({
      id: Date.now().toString(),
      mission_id: missionId,
      ...finding,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  async getFindingsForMission(missionId: string): Promise<Finding[]> {
    return await this.findings.where('mission_id').equals(missionId).toArray();
  }

  // Sanctions
  async addSanction(missionId: string, sanction: Omit<Sanction, 'id' | 'mission_id'>): Promise<void> {
    await this.sanctions.add({
      id: Date.now().toString(),
      mission_id: missionId,
      ...sanction,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  async getSanctionsForMission(missionId: string): Promise<Sanction[]> {
    return await this.sanctions.where('mission_id').equals(missionId).toArray();
  }

  // Documents
  async addDocument(missionId: string, document: Omit<Document, 'id' | 'mission_id'>): Promise<void> {
    await this.documents.add({
      id: Date.now().toString(),
      mission_id: missionId,
      ...document,
      created_at: new Date().toISOString()
    });
  }

  async getDocumentsForMission(missionId: string): Promise<Document[]> {
    return await this.documents.where('mission_id').equals(missionId).toArray();
  }

  async deleteDocument(missionId: string, documentId: string): Promise<void> {
    await this.documents.delete(documentId);
  }

  // Réponses de suivi
  async addReponseSuivi(missionId: string, reponse: ReponseSuivi): Promise<void> {
    const mission = await this.missions.get(missionId);
    if (!mission) throw new Error('Mission non trouvée');

    mission.reponses_suivi = mission.reponses_suivi || [];
    mission.reponses_suivi.push(reponse);
    await this.missions.put(mission);
  }

  async updateMissionReponseStatus(missionId: string, reponseRecue: boolean, dateReponse?: string): Promise<void> {
    const mission = await this.missions.get(missionId);
    if (!mission) throw new Error('Mission non trouvée');

    mission.reponse_recue = reponseRecue;
    if (dateReponse) {
      mission.date_derniere_reponse = dateReponse;
    }
    mission.updated_at = new Date().toISOString();

    await this.missions.put(mission);
  }

  // Initialisation avec des données d'exemple
  async initializeWithSampleData(sampleMissions: Omit<Mission, 'id'>[]): Promise<void> {
    await this.delete();
    await this.open();
    for (const mission of sampleMissions) {
      await this.addMission(mission);
    }
  }

  // Fonction pour mettre à jour automatiquement les statuts des missions
  async updateMissionStatuses(): Promise<{ updated: number; started: number; completed: number }> {
    const now = new Date();
    let updated = 0;
    let started = 0;
    let completed = 0;

    try {
      // Récupérer toutes les missions
      const allMissions = await this.getAllMissions();

      for (const mission of allMissions) {
        // Ignorer les missions marquées pour ne pas changer automatiquement
        if (mission.ignoreAutoStatusChange) {
          console.log(`⚠️ Mission ${mission.reference} ignorée (flag ignoreAutoStatusChange)`);
          continue;
        }

        let statusChanged = false;
        const startDate = new Date(mission.start_date);
        const endDate = new Date(mission.end_date);

        // Missions planifiées qui doivent passer en cours
        if (mission.status === 'PLANIFIEE' && now >= startDate) {
          mission.status = 'EN_COURS';
          mission.updated_at = new Date().toISOString();
          statusChanged = true;
          started++;
        }
        // Missions en cours qui doivent se terminer
        else if (mission.status === 'EN_COURS' && now > endDate) {
          mission.status = 'TERMINEE';
          mission.updated_at = new Date().toISOString();
          statusChanged = true;
          completed++;
        }

        // Mettre à jour la mission si le statut a changé
        if (statusChanged) {
          await this.updateMission(mission.id, mission);
          updated++;
        }
      }

      console.log(`✅ Mise à jour automatique: ${updated} missions mises à jour (${started} commencées, ${completed} terminées)`);
      return { updated, started, completed };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour automatique des statuts:', error);
      throw error;
    }
  }

  // Fonction pour vérifier les missions qui vont changer de statut
  async checkUpcomingStatusChanges(): Promise<{
    startingSoon: Mission[];
    endingSoon: Mission[];
  }> {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allMissions = await this.getAllMissions();

    const startingSoon = allMissions.filter(mission => {
      // Ignorer les missions marquées pour ne pas changer automatiquement
      if (mission.ignoreAutoStatusChange) return false;
      if (mission.status !== 'PLANIFIEE') return false;
      const startDate = new Date(mission.start_date);
      return startDate >= now && startDate <= oneDayFromNow;
    });

    const endingSoon = allMissions.filter(mission => {
      // Ignorer les missions marquées pour ne pas changer automatiquement
      if (mission.ignoreAutoStatusChange) return false;
      if (mission.status !== 'EN_COURS') return false;
      const endDate = new Date(mission.end_date);
      return endDate >= now && endDate <= oneWeekFromNow;
    });

    return { startingSoon, endingSoon };
  }
}

export const db = new LocalStorageDatabase(); 