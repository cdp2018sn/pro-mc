import React, { useState, useEffect } from 'react';
import { Mission, Sanction, SanctionType, Finding, FindingType, Remark, Document as MissionDocument } from '../types/mission';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import { TrashIcon, PencilIcon, XMarkIcon, CheckIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { db } from '../database/localStorageDb';
import { toast } from 'react-hot-toast';
import mammoth from 'mammoth';

interface MissionDetailsProps {
  mission: Mission;
  onAddRemark: (missionId: string, content: string) => Promise<void>;
  onAddSanction: (missionId: string, sanction: string) => Promise<void>;
  onAddFinding: (missionId: string, finding: string) => Promise<void>;
  onUpdate: () => void;
}

export const MissionDetails: React.FC<MissionDetailsProps> = ({ 
  mission: initialMission, 
  onAddRemark, 
  onAddSanction, 
  onAddFinding,
  onUpdate
}) => {
  console.log('MissionDetails: Initialisation avec mission:', initialMission);
  
  const [mission, setMission] = useState<Mission>(initialMission);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editStartDate, setEditStartDate] = useState<string>(initialMission.start_date ? initialMission.start_date.split('T')[0] : '');
  const [editEndDate, setEditEndDate] = useState<string>(initialMission.end_date ? initialMission.end_date.split('T')[0] : '');
  const [activeTab, setActiveTab] = useState<'details' | 'findings' | 'documents' | 'sanctions'>('details');
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [showFindingForm, setShowFindingForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MissionDocument | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [editingSanction, setEditingSanction] = useState<string | null>(null);
  const [documents, setDocuments] = useState<MissionDocument[]>([]);
  const [newSanction, setNewSanction] = useState({
    type: 'AVERTISSEMENT' as SanctionType,
    description: '',
    decision_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });
  const [newFinding, setNewFinding] = useState({
    type: 'OBSERVATION' as FindingType,
    description: '',
    date_constat: format(new Date(), 'yyyy-MM-dd'),
    reference_legale: '',
    recommandation: '',
    delai_correction: 0
  });
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'RAPPORT_CONTROLE',
    file_path: '',
    file_content: '',
    file_name: '',
    file_size: 0,
    file_type: ''
  });
  const [editSanction, setEditSanction] = useState({
    type: 'AVERTISSEMENT' as SanctionType,
    description: '',
    decision_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });

  // Charger les sanctions initiales et les documents
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('MissionDetails: Chargement des données pour mission:', mission.id);
        
        // Charger les sanctions
        const sanctions = await db.getSanctionsForMission(mission.id);
        console.log('MissionDetails: Sanctions chargées:', sanctions);
        
        // Charger les documents
        const docs = await db.getDocumentsForMission(mission.id);
        console.log('MissionDetails: Documents chargés:', docs);
        setDocuments(docs);
        
        // Charger la mission mise à jour
        const allMissions = await db.getAllMissions();
        const updatedMission = allMissions.find(m => m.id === mission.id);
        
        if (updatedMission) {
          setMission(prevMission => ({
            ...prevMission,
            ...updatedMission,
            sanctions
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    loadData();
  }, [mission.id]);

  // Synchroniser les champs d'édition quand la mission change
  useEffect(() => {
    setEditStartDate(mission.start_date ? mission.start_date.split('T')[0] : '');
    setEditEndDate(mission.end_date ? mission.end_date.split('T')[0] : '');
  }, [mission.start_date, mission.end_date]);

  const handleSaveDates = async () => {
    try {
      await db.updateMission(mission.id, {
        start_date: editStartDate,
        end_date: editEndDate
      });
      setIsEditingDates(false);
      onUpdate();
      toast.success('Dates mises à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des dates:', error);
      toast.error('Erreur lors de la mise à jour des dates');
    }
  };

  const handleDeleteSanction = async (sanctionId: string) => {
    try {
      await db.deleteSanction(sanctionId);
      const sanctions = await db.getSanctionsForMission(mission.id);
      setMission(prevMission => ({
        ...prevMission,
        sanctions
      }));
      toast.success('Sanction supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la sanction:', error);
      toast.error('Erreur lors de la suppression de la sanction');
    }
  };

  const handleAddSanction = async () => {
    try {
      const formattedSanction = {
        ...newSanction,
        decision_date: new Date(newSanction.decision_date).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.addSanction(mission.id, formattedSanction);
      setShowSanctionForm(false);
      setNewSanction({
        type: 'AVERTISSEMENT',
        description: '',
        decision_date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0
      });
      
      // Rafraîchir les sanctions
      const sanctions = await db.getSanctionsForMission(mission.id);
      setMission(prevMission => ({
        ...prevMission,
        sanctions
      }));
      toast.success('Sanction ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la sanction:', error);
      toast.error('Erreur lors de l\'ajout de la sanction');
    }
  };

  const handleAddFinding = async () => {
    try {
      const formattedFinding = {
        ...newFinding,
        date_constat: new Date(newFinding.date_constat).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.addFinding(mission.id, formattedFinding);
      setShowFindingForm(false);
      setNewFinding({
        type: 'OBSERVATION',
        description: '',
        date_constat: format(new Date(), 'yyyy-MM-dd'),
        reference_legale: '',
        recommandation: '',
        delai_correction: 0
      });
      
      // Rafraîchir les constatations
      const allMissions = await db.getAllMissions();
      const updatedMission = allMissions.find(m => m.id === mission.id);
      if (updatedMission) {
        setMission(prevMission => ({
          ...prevMission,
          findings: updatedMission.findings
        }));
      }
      toast.success('Constatation ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la constatation:', error);
      toast.error('Erreur lors de l\'ajout de la constatation');
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.title.trim()) {
      toast.error('Veuillez saisir un titre pour le document');
      return;
    }
    
    if (!newDocument.file_content) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    try {
      const formattedDocument = {
        ...newDocument,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.addDocument(mission.id, formattedDocument);
      setShowDocumentForm(false);
      setNewDocument({
        title: '',
        type: 'RAPPORT_CONTROLE',
        file_path: '',
        file_content: '',
        file_name: '',
        file_size: 0,
        file_type: ''
      });
      
      // Rafraîchir les documents
      const docs = await db.getDocumentsForMission(mission.id);
      setDocuments(docs);
      toast.success('Document ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du document:', error);
      toast.error('Erreur lors de l\'ajout du document');
    }
  };

  const handleEditSanction = (sanction: Sanction) => {
    setEditingSanction(sanction.id);
    setEditSanction({
      type: sanction.type,
      description: sanction.description,
      decision_date: sanction.decision_date ? sanction.decision_date.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
      amount: sanction.amount || 0
    });
  };

  const handleSaveSanction = async (sanctionId: string) => {
    try {
      const formattedSanction = {
        ...editSanction,
        decision_date: new Date(editSanction.decision_date).toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.updateSanction(sanctionId, formattedSanction);
      setEditingSanction(null);
      
      // Rafraîchir les sanctions
      const sanctions = await db.getSanctionsForMission(mission.id);
      setMission(prevMission => ({
        ...prevMission,
        sanctions
      }));
      toast.success('Sanction mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sanction:', error);
      toast.error('Erreur lors de la mise à jour de la sanction');
    }
  };

  const handleCancelEdit = () => {
    setEditingSanction(null);
  };

  const handleViewDocument = async (doc: MissionDocument) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
    setDocumentLoading(true);
    setDocumentContent('');
    
    try {
      const fileInfo = getFileTypeInfo(doc);
      
      if (fileInfo.type === 'Word' && (doc as any).file_content) {
        // Convertir le document Word en HTML
        const base64Data = (doc as any).file_content.split(',')[1];
        const arrayBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)).buffer;
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocumentContent(result.value);
      }
    } catch (error) {
      console.error('Erreur lors de la conversion du document Word:', error);
      toast.error('Erreur lors de la conversion du document Word');
    }
    
    // Simuler un chargement pour les documents
    setTimeout(() => {
      setDocumentLoading(false);
    }, 1000);
  };

  const getFileTypeInfo = (doc: MissionDocument) => {
    const fileType = (doc as any).file_type;
    const fileName = (doc as any).file_name || '';
    
    // Détection basée sur le type MIME
    if (fileType?.includes('pdf')) return { type: 'PDF', canPreview: true, color: 'red' };
    if (fileType?.includes('word') || fileType?.includes('document')) return { type: 'Word', canPreview: true, color: 'blue' };
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return { type: 'Excel', canPreview: false, color: 'green' };
    if (fileType?.startsWith('image/')) return { type: 'Image', canPreview: true, color: 'purple' };
    if (fileType?.startsWith('text/')) return { type: 'Texte', canPreview: true, color: 'gray' };
    
    // Détection basée sur l'extension du fichier
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return { type: 'PDF', canPreview: true, color: 'red' };
    if (['doc', 'docx'].includes(extension || '')) return { type: 'Word', canPreview: true, color: 'blue' };
    if (['xls', 'xlsx'].includes(extension || '')) return { type: 'Excel', canPreview: false, color: 'green' };
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return { type: 'Image', canPreview: true, color: 'purple' };
    if (['txt'].includes(extension || '')) return { type: 'Texte', canPreview: true, color: 'gray' };
    
    return { type: 'Document', canPreview: false, color: 'orange' };
  };

  const getSanctionTypeLabel = (type: SanctionType): string => {
    switch (type) {
      case 'AVERTISSEMENT': return 'Avertissement';
      case 'MISE_EN_DEMEURE': return 'Mise en demeure';
      case 'PECUNIAIRE': return 'Sanction pécuniaire';
      case 'INJONCTION': return 'Injonction';
      case 'RESTRICTION_TRAITEMENT': return 'Restriction de traitement';
      default: return type;
    }
  };

  const getSanctionTypeClass = (type: SanctionType): string => {
    switch (type) {
      case 'AVERTISSEMENT': return 'bg-yellow-100 text-yellow-800';
      case 'MISE_EN_DEMEURE': return 'bg-orange-100 text-orange-800';
      case 'PECUNIAIRE': return 'bg-red-100 text-red-800';
      case 'INJONCTION': return 'bg-purple-100 text-purple-800';
      case 'RESTRICTION_TRAITEMENT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <p className="mt-1 text-sm text-gray-900">{mission.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Référence</label>
              <p className="mt-1 text-sm text-gray-900">{mission.reference}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organisation</label>
              <p className="mt-1 text-sm text-gray-900">{mission.organization}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{mission.address}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Période et équipe</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de début</label>
              {isEditingDates ? (
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {mission.start_date ? format(new Date(mission.start_date), 'dd/MM/yyyy', { locale: fr }) : 'Non définie'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              {isEditingDates ? (
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {mission.end_date ? format(new Date(mission.end_date), 'dd/MM/yyyy', { locale: fr }) : 'Non définie'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Équipe</label>
              <p className="mt-1 text-sm text-gray-900">
                {Array.isArray(mission.team_members) 
                  ? mission.team_members.join(', ') 
                  : mission.team_members || 'Non spécifiée'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        {isEditingDates ? (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditingDates(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveDates}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Sauvegarder
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingDates(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Modifier les dates
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'details'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'findings'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Constatations
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'documents'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('sanctions')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'sanctions'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sanctions
          </button>
        </div>

        {activeTab === 'details' && renderDetails()}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Constatations</h3>
              <button
                onClick={() => setShowFindingForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Ajouter une constatation
              </button>
            </div>

            {showFindingForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-4">Nouvelle constatation</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de constatation</label>
                    <select
                      value={newFinding.type}
                      onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value as FindingType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="NON_CONFORMITE_MAJEURE">Non-conformité majeure</option>
                      <option value="NON_CONFORMITE_MINEURE">Non-conformité mineure</option>
                      <option value="OBSERVATION">Observation</option>
                      <option value="POINT_CONFORME">Point conforme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newFinding.description}
                      onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de constat</label>
                    <input
                      type="date"
                      value={newFinding.date_constat}
                      onChange={(e) => setNewFinding({ ...newFinding, date_constat: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowFindingForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddFinding}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {mission.findings && mission.findings.length > 0 ? (
                mission.findings.map((finding) => (
                  <div key={finding.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          finding.type === 'NON_CONFORMITE_MAJEURE' ? 'bg-red-100 text-red-800' :
                          finding.type === 'NON_CONFORMITE_MINEURE' ? 'bg-orange-100 text-orange-800' :
                          finding.type === 'OBSERVATION' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {finding.type === 'NON_CONFORMITE_MAJEURE' ? 'Non-conformité majeure' :
                           finding.type === 'NON_CONFORMITE_MINEURE' ? 'Non-conformité mineure' :
                           finding.type === 'OBSERVATION' ? 'Observation' :
                           'Point conforme'}
                        </span>
                        <p className="mt-2 text-gray-700">{finding.description}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Constaté le {finding.date_constat ? format(new Date(finding.date_constat), 'dd/MM/yyyy', { locale: fr }) : 'Date non disponible'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune constatation</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documents</h3>
              <button
                onClick={() => setShowDocumentForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Ajouter un document
              </button>
            </div>

            {showDocumentForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-4">Nouveau document</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre du document</label>
                    <input
                      type="text"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de document</label>
                    <select
                      value={newDocument.type}
                      onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="RAPPORT_CONTROLE">Rapport de contrôle</option>
                      <option value="LETTRE_NOTIFICATION">Lettre de notification</option>
                      <option value="LETTRE_REPONSE">Lettre de réponse</option>
                      <option value="LETTRE_DECISION">Lettre de décision</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fichier</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            setNewDocument({ 
                              ...newDocument, 
                              file_path: file.name,
                              file_name: file.name,
                              file_size: file.size,
                              file_type: file.type,
                              file_content: content
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                    {newDocument.file_name && (
                      <p className="mt-1 text-sm text-gray-500">
                        Fichier sélectionné: {newDocument.file_name} ({(newDocument.file_size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowDocumentForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddDocument}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        <p className="text-sm text-gray-500">Type: {doc.type}</p>
                        <p className="text-sm text-gray-500">
                          Créé le {doc.created_at ? format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr }) : 'Date non disponible'}
                        </p>
                        {(doc as any).file_name && (
                          <p className="text-sm text-gray-500">
                            Fichier: {(doc as any).file_name}
                            {(doc as any).file_size && ` (${((doc as any).file_size / 1024).toFixed(1)} KB)`}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {(doc as any).file_content && (
                          <>
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-md border border-blue-300 hover:bg-blue-50 flex items-center space-x-1"
                              title="Voir le document"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>Voir</span>
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = (doc as any).file_content;
                                link.download = (doc as any).file_name || doc.title;
                                link.click();
                              }}
                              className="text-green-500 hover:text-green-700 px-3 py-1 rounded-md border border-green-300 hover:bg-green-50 flex items-center space-x-1"
                              title="Télécharger"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                              <span>Télécharger</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun document</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sanctions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sanctions</h3>
              <button
                onClick={() => setShowSanctionForm(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Ajouter une sanction
              </button>
            </div>

            {showSanctionForm && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-4">Nouvelle sanction</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de sanction</label>
                    <select
                      value={newSanction.type}
                      onChange={(e) => setNewSanction({ ...newSanction, type: e.target.value as SanctionType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="AVERTISSEMENT">Avertissement</option>
                      <option value="MISE_EN_DEMEURE">Mise en demeure</option>
                      <option value="PECUNIAIRE">Sanction pécuniaire</option>
                      <option value="INJONCTION">Injonction</option>
                      <option value="RESTRICTION_TRAITEMENT">Restriction de traitement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newSanction.description}
                      onChange={(e) => setNewSanction({ ...newSanction, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  {(newSanction.type === 'PECUNIAIRE') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                      <input
                        type="number"
                        value={newSanction.amount}
                        onChange={(e) => setNewSanction({ ...newSanction, amount: parseFloat(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        min="0"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de décision</label>
                    <input
                      type="date"
                      value={newSanction.decision_date}
                      onChange={(e) => setNewSanction({ ...newSanction, decision_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowSanctionForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddSanction}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {mission.sanctions && mission.sanctions.length > 0 ? (
                mission.sanctions.map((sanction) => (
                  <div key={sanction.id} className="bg-white p-4 rounded-lg shadow">
                    {editingSanction === sanction.id ? (
                      // Mode édition
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Type de sanction</label>
                          <select
                            value={editSanction.type}
                            onChange={(e) => setEditSanction({ ...editSanction, type: e.target.value as SanctionType })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          >
                            <option value="AVERTISSEMENT">Avertissement</option>
                            <option value="MISE_EN_DEMEURE">Mise en demeure</option>
                            <option value="PECUNIAIRE">Sanction pécuniaire</option>
                            <option value="INJONCTION">Injonction</option>
                            <option value="RESTRICTION_TRAITEMENT">Restriction de traitement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={editSanction.description}
                            onChange={(e) => setEditSanction({ ...editSanction, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            rows={3}
                          />
                        </div>
                        {(editSanction.type === 'PECUNIAIRE') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
                            <input
                              type="number"
                              value={editSanction.amount}
                              onChange={(e) => setEditSanction({ ...editSanction, amount: parseFloat(e.target.value) || 0 })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              min="0"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date de décision</label>
                          <input
                            type="date"
                            value={editSanction.decision_date}
                            onChange={(e) => setEditSanction({ ...editSanction, decision_date: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleSaveSanction(sanction.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            Sauvegarder
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mode affichage
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getSanctionTypeClass(sanction.type)}`}>
                            {getSanctionTypeLabel(sanction.type)}
                          </span>
                          <p className="mt-2 text-gray-700">{sanction.description}</p>
                          {(sanction.type === 'PECUNIAIRE') && sanction.amount && (
                            <p className="mt-1 text-sm font-medium text-red-600">
                              Montant: {sanction.amount.toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                          <p className="mt-1 text-sm text-gray-500">
                            Décision du {sanction.decision_date ? format(new Date(sanction.decision_date), 'dd/MM/yyyy', { locale: fr }) : 'Date non disponible'}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditSanction(sanction)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSanction(sanction.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune sanction</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de visualisation des documents */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header de la modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDocument.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Type: {selectedDocument.type} • 
                  {(() => {
                    const fileInfo = getFileTypeInfo(selectedDocument);
                    return (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        fileInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                        fileInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        fileInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        fileInfo.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                        fileInfo.color === 'gray' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {fileInfo.type}
                        {fileInfo.canPreview ? ' (Prévisualisable)' : ' (Téléchargement)'}
                      </span>
                    );
                  })()}
                  {(selectedDocument as any).file_name && ` • ${(selectedDocument as any).file_name}`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = (selectedDocument as any).file_content;
                    link.download = (selectedDocument as any).file_name || selectedDocument.title;
                    link.click();
                  }}
                  className="text-green-500 hover:text-green-700 px-3 py-1 rounded-md border border-green-300 hover:bg-green-50 flex items-center space-x-1"
                  title="Télécharger"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Télécharger</span>
                </button>
                <button
                  onClick={() => setShowDocumentViewer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Contenu du document */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {documentLoading ? (
                <div className="flex items-center justify-center h-[calc(90vh-200px)]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Chargement du document...</p>
                  </div>
                </div>
              ) : (selectedDocument as any).file_content && (
                <div className="w-full h-full">
                  {/* Pour les images */}
                  {(selectedDocument as any).file_type?.startsWith('image/') ? (
                    <img 
                      src={(selectedDocument as any).file_content} 
                      alt={selectedDocument.title}
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : (selectedDocument as any).file_type === 'application/pdf' ? (
                    /* Pour les PDFs */
                    <iframe
                      src={(selectedDocument as any).file_content}
                      className="w-full h-[calc(90vh-200px)] border-0"
                      title={selectedDocument.title}
                    />
                  ) : (selectedDocument as any).file_type?.startsWith('text/') ? (
                    /* Pour les fichiers texte */
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-auto max-h-[calc(90vh-250px)]">
                        {atob((selectedDocument as any).file_content.split(',')[1])}
                      </pre>
                    </div>
                  ) : (selectedDocument as any).file_type?.includes('word') || (selectedDocument as any).file_type?.includes('document') ? (
                    /* Pour les documents Word */
                    documentContent ? (
                      <div className="bg-white border rounded-lg p-6">
                        <div className="prose max-w-none">
                          <div 
                            dangerouslySetInnerHTML={{ __html: documentContent }}
                            className="text-gray-800 leading-relaxed"
                            style={{
                              fontFamily: 'Arial, sans-serif',
                              lineHeight: '1.6',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
                          <div className="text-blue-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 18h12V6l-4-4H4v16zm2-14h5v4H6V4zm0 6h8v2H6v-2zm0 4h8v2H6v-2z"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Document Word
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Erreur lors de la conversion du document Word.
                          </p>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = (selectedDocument as any).file_content;
                              link.download = (selectedDocument as any).file_name || selectedDocument.title;
                              link.click();
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Télécharger pour ouvrir
                          </button>
                        </div>
                      </div>
                    )
                  ) : (selectedDocument as any).file_type?.includes('excel') || (selectedDocument as any).file_type?.includes('spreadsheet') ? (
                    /* Pour les fichiers Excel */
                    <div className="text-center py-8">
                      <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto">
                        <div className="text-green-500 mb-4">
                          <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Fichier Excel
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Ce fichier Excel ne peut pas être prévisualisé directement.
                        </p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = (selectedDocument as any).file_content;
                            link.download = (selectedDocument as any).file_name || selectedDocument.title;
                            link.click();
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                          Télécharger pour ouvrir
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Pour les autres types de documents */
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
                        <div className="text-gray-500 mb-4">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {selectedDocument.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Type: {(selectedDocument as any).file_type || 'Document'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Ce type de document ne peut pas être prévisualisé directement.
                        </p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = (selectedDocument as any).file_content;
                            link.download = (selectedDocument as any).file_name || selectedDocument.title;
                            link.click();
                          }}
                          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                          Télécharger pour ouvrir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};