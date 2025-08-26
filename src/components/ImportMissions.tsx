import React, { useState, useRef } from 'react';
import { Mission } from '../types/mission';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface ImportMissionsProps {
  onImportSuccess: () => void;
}

export const ImportMissions: React.FC<ImportMissionsProps> = ({ onImportSuccess }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setIsImporting(true);
    setError(null);
    setImportedCount(0);

    try {
      // Extraire les missions du fichier Excel
      const missions = await extractMissionsFromExcel(file);
      
      if (missions.length === 0) {
        toast.error('Aucune mission trouvée dans le fichier Excel');
        return;
      }

      // Importer les missions dans la base de données
      let count = 0;
      for (const mission of missions) {
        await db.addMission(mission);
        count++;
      }

      setImportedCount(count);
      toast.success(`${count} missions importées avec succès !`);
      onImportSuccess();
    } catch (err) {
      console.error('Erreur lors de l\'import des missions:', err);
      setError('Erreur lors de l\'import des missions. Vérifiez la console.');
      toast.error('Erreur lors de l\'import des missions.');
    } finally {
      setIsImporting(false);
    }
  };

  const extractMissionsFromExcel = async (file: File): Promise<Omit<Mission, 'id'>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Prendre la première feuille
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir en JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Ignorer la première ligne (en-têtes)
          const rows = jsonData.slice(1) as any[][];
          
          const missions: Omit<Mission, 'id'>[] = [];
          
          rows.forEach((row, index) => {
            if (row.length === 0 || !row[0]) return; // Ignorer les lignes vides
            
            try {
              const mission = parseRowToMission(row, index + 2); // +2 car on commence à la ligne 2 (après les en-têtes)
              if (mission) {
                missions.push(mission);
              }
            } catch (err) {
              console.warn(`Erreur lors du parsing de la ligne ${index + 2}:`, err);
            }
          });
          
          resolve(missions);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseRowToMission = (row: any[], rowNumber: number): Omit<Mission, 'id'> | null => {
    // Structure attendue des colonnes Excel :
    // [Référence, Titre, Description, Type, Organisation, Adresse, Date début, Date fin, Statut, Motif, Décision, Date décision, Équipe, Objectifs]
    
    if (!row[0] || !row[1]) {
      console.warn(`Ligne ${rowNumber}: Référence ou titre manquant`);
      return null;
    }

    // Parser les dates
    const parseDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString();
      
      // Si c'est un numéro Excel (date Excel)
      if (typeof dateValue === 'number') {
        const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
        return excelDate.toISOString();
      }
      
      // Si c'est une chaîne de caractères
      if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString();
        }
      }
      
      return new Date().toISOString();
    };

    // Parser les listes (équipe, objectifs)
    const parseList = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(item => item);
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item);
      }
      return [];
    };

    const mission: Omit<Mission, 'id'> = {
      reference: String(row[0] || `IMPORT-${Date.now()}-${rowNumber}`),
      title: String(row[1] || 'Mission sans titre'),
      description: String(row[2] || 'Description à compléter'),
      type_mission: (row[3] as any) || 'Contrôle sur place',
      organization: String(row[4] || 'Organisation à définir'),
      address: String(row[5] || 'Adresse à définir'),
      start_date: parseDate(row[6]),
      end_date: parseDate(row[7]),
      status: (row[8] as any) || 'PLANIFIEE',
      motif_controle: (row[9] as any) || 'Programme annuel',
      decision_numero: String(row[10] || `DEC-${Date.now()}`),
      date_decision: parseDate(row[11]),
      team_members: parseList(row[12]),
      objectives: parseList(row[13]),
      findings: [],
      remarks: [],
      sanctions: [],
      documents: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return mission;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Importer des missions
          </h1>
          <p className="text-lg text-gray-600">
            Téléchargez un fichier Excel (.xlsx ou .xls) contenant vos missions de contrôle
          </p>
        </div>

        {/* Zone de téléchargement */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg 
              className="mx-auto h-16 w-16 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            Glissez-déposez votre fichier Excel ici
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou cliquez pour sélectionner un fichier
          </p>
          
          <button
            onClick={openFileDialog}
            disabled={isImporting}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isImporting ? 'Import en cours...' : 'Sélectionner un fichier'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Format attendu du fichier Excel
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• <strong>Première ligne</strong> : En-têtes des colonnes</p>
            <p>• <strong>Colonnes attendues</strong> (dans l'ordre) :</p>
            <div className="ml-4 space-y-1">
              <p>1. <strong>Référence</strong> (obligatoire)</p>
              <p>2. <strong>Titre</strong> (obligatoire)</p>
              <p>3. <strong>Description</strong></p>
              <p>4. <strong>Type de mission</strong> (Contrôle sur place, Contrôle sur pièces, Contrôle en ligne)</p>
              <p>5. <strong>Organisation</strong></p>
              <p>6. <strong>Adresse</strong></p>
              <p>7. <strong>Date de début</strong> (format: JJ/MM/AAAA ou date Excel)</p>
              <p>8. <strong>Date de fin</strong> (format: JJ/MM/AAAA ou date Excel)</p>
              <p>9. <strong>Statut</strong> (PLANIFIEE, EN_COURS, TERMINEE, ANNULEE, ATTENTE_REPONSE)</p>
              <p>10. <strong>Motif de contrôle</strong> (Programme annuel, Suite a une plainte, etc.)</p>
              <p>11. <strong>Numéro de décision</strong></p>
              <p>12. <strong>Date de décision</strong></p>
              <p>13. <strong>Équipe</strong> (séparé par des virgules)</p>
              <p>14. <strong>Objectifs</strong> (séparés par des virgules)</p>
            </div>
          </div>
        </div>

        {/* Template de téléchargement */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            📥 Télécharger un template Excel
          </h3>
          <p className="text-sm text-green-800 mb-4">
            Utilisez ce template pour créer votre fichier Excel avec le bon format
          </p>
          <button
            onClick={() => {
              // Créer un template Excel
              const templateData = [
                ['Référence', 'Titre', 'Description', 'Type', 'Organisation', 'Adresse', 'Date début', 'Date fin', 'Statut', 'Motif', 'Décision', 'Date décision', 'Équipe', 'Objectifs'],
                ['REF-001', 'Contrôle de conformité', 'Mission de contrôle RGPD', 'Contrôle sur place', 'Entreprise ABC', '123 Rue de la Paix, Dakar', '01/01/2024', '31/01/2024', 'PLANIFIEE', 'Programme annuel', 'DEC-2024-001', '15/12/2023', 'Agent 1, Agent 2', 'Vérifier la conformité, Évaluer les risques'],
                ['REF-002', 'Audit sécurité', 'Audit des systèmes informatiques', 'Contrôle sur pièces', 'Société XYZ', '456 Avenue Liberté, Dakar', '01/02/2024', '28/02/2024', 'PLANIFIEE', 'Suite a une plainte', 'DEC-2024-002', '20/12/2023', 'Expert IT, Analyste', 'Analyser la sécurité, Identifier les vulnérabilités']
              ];

              const ws = XLSX.utils.aoa_to_sheet(templateData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Missions');
              
              // Télécharger le fichier
              XLSX.writeFile(wb, 'template-missions.xlsx');
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Télécharger le template
          </button>
        </div>

        {/* Résultat de l'import */}
        {importedCount > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">
                {importedCount} mission(s) importée(s) avec succès !
              </p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Bouton pour importer les missions de test */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🧪 Import rapide pour les tests
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Vous pouvez aussi importer rapidement des missions de test pour expérimenter les fonctionnalités
          </p>
          <button
            onClick={async () => {
              try {
                setIsImporting(true);
                const response = await fetch('/data/test-missions.json');
                if (!response.ok) {
                  throw new Error('Impossible de charger le fichier de données');
                }
                const testMissions = await response.json();
                
                let count = 0;
                for (const mission of testMissions) {
                  const { id: _ignoredId, ...withoutId } = mission;
                  await db.addMission(withoutId);
                  count++;
                }
                
                setImportedCount(count);
                toast.success(`${count} missions de test importées !`);
                onImportSuccess();
              } catch (err) {
                console.error('Erreur lors de l\'import des missions de test:', err);
                toast.error('Erreur lors de l\'import des missions de test');
              } finally {
                setIsImporting(false);
              }
            }}
            disabled={isImporting}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
          >
            {isImporting ? 'Import en cours...' : 'Importer missions de test'}
          </button>
        </div>
      </div>
    </div>
  );
};
