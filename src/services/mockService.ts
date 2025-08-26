import { Mission, User } from '../types/mission';

// Service mock pour remplacer Supabase dans Bolt.new
export class MockService {
  private static missions: Mission[] = [
    {
      id: '1',
      title: 'Mission de Contrôle Test',
      reference: 'REF-001',
      description: 'Mission de test pour Bolt.new',
      status: 'en_cours',
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-12-31T23:59:59.000Z',
      location: 'Dakar, Sénégal',
      organization: 'CDP',
      assigned_to: 'admin-1',
      created_by: 'admin-1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'Audit Financier',
      reference: 'REF-002',
      description: 'Audit financier des comptes',
      status: 'planifiee',
      start_date: '2024-02-01T00:00:00.000Z',
      end_date: '2024-03-31T23:59:59.000Z',
      location: 'Thiès, Sénégal',
      organization: 'CDP',
      assigned_to: 'admin-1',
      created_by: 'admin-1',
      created_at: '2024-01-15T00:00:00.000Z',
      updated_at: '2024-01-15T00:00:00.000Z'
    }
  ];

  private static users: User[] = [
    {
      id: 'admin-1',
      email: 'abdoulaye.niang@cdp.sn',
      name: 'Abdoulaye Niang',
      role: 'admin',
      isActive: true,
      department: 'Direction',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
  ];

  // Missions
  static async getMissions(): Promise<Mission[]> {
    return Promise.resolve(this.missions);
  }

  static async getMissionById(id: string): Promise<Mission | null> {
    const mission = this.missions.find(m => m.id === id);
    return Promise.resolve(mission || null);
  }

  static async createMission(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at'>): Promise<Mission> {
    const newMission: Mission = {
      ...mission,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.missions.push(newMission);
    return Promise.resolve(newMission);
  }

  static async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const index = this.missions.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Mission non trouvée');
    }
    this.missions[index] = {
      ...this.missions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return Promise.resolve(this.missions[index]);
  }

  static async deleteMission(id: string): Promise<void> {
    const index = this.missions.findIndex(m => m.id === id);
    if (index !== -1) {
      this.missions.splice(index, 1);
    }
    return Promise.resolve();
  }

  // Users
  static async getUsers(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return Promise.resolve(this.users[index]);
  }

  static async deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    return Promise.resolve();
  }

  // Documents
  static async getDocuments(missionId: string) {
    return Promise.resolve([]);
  }

  static async createDocument(documentData: any) {
    console.log('Document créé:', documentData);
    return Promise.resolve(documentData);
  }

  static async deleteDocument(id: string): Promise<void> {
    console.log('Document supprimé:', id);
    return Promise.resolve();
  }

  // Findings
  static async getFindings(missionId: string) {
    return Promise.resolve([]);
  }

  static async createFinding(findingData: any) {
    console.log('Finding créé:', findingData);
    return Promise.resolve(findingData);
  }

  // Sanctions
  static async getSanctions(missionId: string) {
    return Promise.resolve([]);
  }

  static async createSanction(sanctionData: any) {
    console.log('Sanction créée:', sanctionData);
    return Promise.resolve(sanctionData);
  }

  // Remarks
  static async getRemarks(missionId: string) {
    return Promise.resolve([]);
  }

  static async createRemark(remarkData: any) {
    console.log('Remarque créée:', remarkData);
    return Promise.resolve(remarkData);
  }

  // Statistics
  static async getStatistics() {
    return Promise.resolve({
      total: this.missions.length,
      en_cours: this.missions.filter(m => m.status === 'en_cours').length,
      planifiee: this.missions.filter(m => m.status === 'planifiee').length,
      terminee: this.missions.filter(m => m.status === 'terminee').length
    });
  }

  // Update mission statuses
  static async updateMissionStatuses() {
    console.log('Mise à jour des statuts de mission');
    return Promise.resolve({ updated: 0 });
  }
}
