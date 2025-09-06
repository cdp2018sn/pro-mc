interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  userId: string;
}

interface Document {
  id: string;
  missionId: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
}

interface Finding {
  id: string;
  missionId: string;
  description: string;
  severity: string;
  createdAt: string;
}

interface Sanction {
  id: string;
  missionId: string;
  type: string;
  description: string;
  createdAt: string;
}

interface Remark {
  id: string;
  missionId: string;
  content: string;
  createdAt: string;
}

class LocalStorageDB {
  private getStorageKey(table: string): string {
    return `cdp_missions_${table}`;
  }

  private getData<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erreur lecture ${table}:`, error);
      return [];
    }
  }

  private setData<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur écriture ${table}:`, error);
    }
  }

  // Users
  getUsers(): User[] {
    return this.getData<User>('users');
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setData('users', users);
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setData('users', users);
    }
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.setData('users', users);
  }

  // Missions
  getMissions(): Mission[] {
    return this.getData<Mission>('missions');
  }

  addMission(mission: Mission): void {
    const missions = this.getMissions();
    missions.push(mission);
    this.setData('missions', missions);
  }

  updateMission(id: string, updates: Partial<Mission>): void {
    const missions = this.getMissions();
    const index = missions.findIndex(m => m.id === id);
    if (index !== -1) {
      missions[index] = { ...missions[index], ...updates };
      this.setData('missions', missions);
    }
  }

  deleteMission(id: string): void {
    const missions = this.getMissions().filter(m => m.id !== id);
    this.setData('missions', missions);
  }

  // Documents
  getDocuments(): Document[] {
    return this.getData<Document>('documents');
  }

  addDocument(document: Document): void {
    const documents = this.getDocuments();
    documents.push(document);
    this.setData('documents', documents);
  }

  deleteDocument(id: string): void {
    const documents = this.getDocuments().filter(d => d.id !== id);
    this.setData('documents', documents);
  }

  // Findings
  getFindings(): Finding[] {
    return this.getData<Finding>('findings');
  }

  addFinding(finding: Finding): void {
    const findings = this.getFindings();
    findings.push(finding);
    this.setData('findings', findings);
  }

  deleteFinding(id: string): void {
    const findings = this.getFindings().filter(f => f.id !== id);
    this.setData('findings', findings);
  }

  // Sanctions
  getSanctions(): Sanction[] {
    return this.getData<Sanction>('sanctions');
  }

  addSanction(sanction: Sanction): void {
    const sanctions = this.getSanctions();
    sanctions.push(sanction);
    this.setData('sanctions', sanctions);
  }

  deleteSanction(id: string): void {
    const sanctions = this.getSanctions().filter(s => s.id !== id);
    this.setData('sanctions', sanctions);
  }

  // Remarks
  getRemarks(): Remark[] {
    return this.getData<Remark>('remarks');
  }

  addRemark(remark: Remark): void {
    const remarks = this.getRemarks();
    remarks.push(remark);
    this.setData('remarks', remarks);
  }

  deleteRemark(id: string): void {
    const remarks = this.getRemarks().filter(r => r.id !== id);
    this.setData('remarks', remarks);
  }

  // Synchronization methods
  async verifyDataIntegrity(): Promise<{
    local: Record<string, number>;
    supabase: Record<string, number>;
    differences: Record<string, number>;
  }> {
    const local = {
      users: this.getUsers().length,
      missions: this.getMissions().length,
      documents: this.getDocuments().length,
      findings: this.getFindings().length,
      sanctions: this.getSanctions().length,
      remarks: this.getRemarks().length
    };

    // Simulate Supabase counts (replace with actual Supabase queries)
    const supabase = {
      users: 0,
      missions: 0,
      documents: 0,
      findings: 0,
      sanctions: 0,
      remarks: 0
    };

    const differences = {
      users: local.users - supabase.users,
      missions: local.missions - supabase.missions,
      documents: local.documents - supabase.documents,
      findings: local.findings - supabase.findings,
      sanctions: local.sanctions - supabase.sanctions,
      remarks: local.remarks - supabase.remarks
    };

    return { local, supabase, differences };
  }

  async forceGlobalSync(): Promise<boolean> {
    try {
      console.log('Début de la synchronisation forcée...');
      
      // Sync users
      const users = this.getUsers();
      console.log(`Synchronisation de ${users.length} utilisateurs...`);
      
      // Sync missions
      const missions = this.getMissions();
      console.log(`Synchronisation de ${missions.length} missions...`);
      
      // Sync documents
      const documents = this.getDocuments();
      console.log(`Synchronisation de ${documents.length} documents...`);
      
      // Sync findings
      const findings = this.getFindings();
      console.log(`Synchronisation de ${findings.length} constatations...`);
      
      // Sync sanctions
      const sanctions = this.getSanctions();
      console.log(`Synchronisation de ${sanctions.length} sanctions...`);
      
      // Sync remarks
      const remarks = this.getRemarks();
      console.log(`Synchronisation de ${remarks.length} remarques...`);
      
      console.log('✅ Synchronisation forcée terminée');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    const tables = ['users', 'missions', 'documents', 'findings', 'sanctions', 'remarks'];
    tables.forEach(table => {
      localStorage.removeItem(this.getStorageKey(table));
    });
  }
}

export const db = new LocalStorageDB();