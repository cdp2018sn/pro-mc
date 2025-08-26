import React, { useState, useEffect } from 'react';
import { Mission, Document, DocumentType, ReponseSuivi } from '../types/mission';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DocumentIcon, DocumentTextIcon, DocumentDuplicateIcon, DocumentCheckIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { db } from '../database/localStorageDb';

interface MissionDocumentsProps {
  missionId: string;
  onUpdate?: () => void;
}

export const MissionDocuments: React.FC<MissionDocumentsProps> = ({ missionId, onUpdate }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState<{
    title: string;
    type: DocumentType;
    file: File | null;
  }>({
    title: '',
    type: 'RAPPORT_CONTROLE',
    file: null
  });
  const [newReponse, setNewReponse] = useState<Partial<ReponseSuivi>>({
    date_reponse: new Date().toISOString().split('T')[0],
    contenu: ''
  });

  useEffect(() => {
    loadDocuments();
  }, [missionId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await db.getDocumentsForMission(missionId);
      console.log('Documents chargés:', docs);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err);
      setError('Erreur lors du chargement des documents. Veuillez réessayer.');
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({ ...prev, file }));
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDocument.title.trim()) {
      toast.error('Veuillez saisir un titre pour le document');
      return;
    }

    if (!newDocument.file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    try {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Content = e.target?.result as string;
          
          const document: Document = {
            id: Date.now().toString(),
            mission_id: missionId,
            title: newDocument.title,
            type: newDocument.type,
            file_path: newDocument.file?.name || '',
            file_content: base64Content,
            created_at: new Date().toISOString()
          };

          await db.addDocument(missionId, document);
          
          // Si c'est une lettre de réponse, mettre à jour le statut de réponse
          if (newDocument.type === 'LETTRE_REPONSE') {
            await db.updateMissionReponseStatus(missionId, true, new Date().toISOString());
          }
          
          toast.success('Document ajouté avec succès');
          setNewDocument({ title: '', type: 'RAPPORT_CONTROLE', file: null });
          await loadDocuments();
          if (onUpdate) onUpdate();
        } catch (err) {
          console.error('Erreur lors de l\'ajout du document:', err);
          toast.error('Erreur lors de l\'ajout du document');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
        setLoading(false);
      };

      reader.readAsDataURL(newDocument.file);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du document:', err);
      toast.error('Erreur lors de l\'ajout du document');
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await db.deleteDocument(missionId, documentId);
        toast.success('Document supprimé avec succès');
        await loadDocuments();
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error('Erreur lors de la suppression du document:', err);
        toast.error('Erreur lors de la suppression du document');
      }
    }
  };

  const handleAddReponse = async () => {
    if (!newReponse.date_reponse || !newReponse.contenu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const reponse: ReponseSuivi = {
        id: Date.now().toString(),
        mission_id: missionId,
        date_reponse: newReponse.date_reponse,
        contenu: newReponse.contenu,
        documents_joins: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.addReponseSuivi(missionId, reponse);
      
      // Mettre à jour le statut de réponse de la mission
      await db.updateMissionReponseStatus(missionId, true, newReponse.date_reponse);
      
      toast.success('Réponse ajoutée avec succès');
      setNewReponse({
        date_reponse: new Date().toISOString().split('T')[0],
        contenu: ''
      });
      await loadDocuments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      toast.error('Erreur lors de l\'ajout de la réponse');
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'RAPPORT_CONTROLE':
        return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
      case 'LETTRE_NOTIFICATION':
        return <DocumentDuplicateIcon className="h-6 w-6 text-yellow-500" />;
      case 'LETTRE_REPONSE':
        return <DocumentCheckIcon className="h-6 w-6 text-green-500" />;
      case 'LETTRE_DECISION':
        return <DocumentIcon className="h-6 w-6 text-purple-500" />;
      case 'LETTRE_PROCUREUR':
        return <DocumentIcon className="h-6 w-6 text-red-500" />;
      case 'NOTIFICATION_RECU':
        return <DocumentIcon className="h-6 w-6 text-teal-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'RAPPORT_CONTROLE':
        return 'Rapport de mission de contrôle';
      case 'LETTRE_NOTIFICATION':
        return 'Lettre de notification des manquements';
      case 'LETTRE_REPONSE':
        return 'Lettre de réponse du responsable de traitement';
      case 'LETTRE_DECISION':
        return 'Lettre de décision';
      case 'LETTRE_PROCUREUR':
        return 'Lettre au procureur';
      case 'NOTIFICATION_RECU':
        return 'Notification reçue';
      default:
        return 'Autre document';
    }
  };

  const handleOpenDocument = (document: Document) => {
    if (document.file_content) {
      // Créer un blob à partir du contenu base64
      const byteString = atob(document.file_content.split(',')[1]);
      const mimeString = document.file_content.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);
      
      // Ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    } else {
      toast.error('Le contenu du document n\'est pas disponible');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUploadDocument} className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un document</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre du document
            </label>
            <input
              type="text"
              id="title"
              value={newDocument.title}
              onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type de document
            </label>
            <select
              id="type"
              value={newDocument.type}
              onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as DocumentType }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="RAPPORT_CONTROLE">Rapport de mission de contrôle</option>
              <option value="LETTRE_NOTIFICATION">Lettre de notification des manquements</option>
              <option value="LETTRE_REPONSE">Lettre de réponse du responsable de traitement</option>
              <option value="LETTRE_DECISION">Lettre de décision</option>
              <option value="LETTRE_PROCUREUR">Lettre au procureur</option>
              <option value="NOTIFICATION_RECU">Notification reçue</option>
            </select>
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Fichier
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Ajouter le document
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Documents de la mission</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {documents.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              Aucun document n'a été ajouté à cette mission.
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-500">
                        {getDocumentTypeLabel(doc.type)} • Ajouté le {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenDocument(doc)}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                      title="Voir le document"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                      title="Supprimer le document"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section Suivi des réponses */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suivi des réponses</h3>
        
        <div className="mb-4">
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${documents.some(doc => doc.type === 'LETTRE_REPONSE') ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <p className="text-sm font-medium text-gray-900">
              {documents.some(doc => doc.type === 'LETTRE_REPONSE') ? 'Réponse reçue' : 'Aucune réponse reçue'}
            </p>
          </div>
          {documents.some(doc => doc.type === 'LETTRE_REPONSE') && (
            <p className="text-xs text-gray-500 mt-1">
              Dernière réponse reçue le {format(new Date(documents.find(doc => doc.type === 'LETTRE_REPONSE')?.created_at || ''), 'dd/MM/yyyy', { locale: fr })}
            </p>
          )}
        </div>
        
        {/* Liste des réponses */}
        <div className="mb-6">
          {documents.filter(doc => doc.type === 'LETTRE_REPONSE').length > 0 ? (
            <div className="divide-y divide-gray-200">
              {documents.filter(doc => doc.type === 'LETTRE_REPONSE').map((doc) => (
                <div key={doc.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Réponse du {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">{doc.title}</p>
                    </div>
                    <button
                      onClick={() => handleOpenDocument(doc)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune réponse enregistrée</p>
          )}
        </div>
      </div>
    </div>
  );
}; 