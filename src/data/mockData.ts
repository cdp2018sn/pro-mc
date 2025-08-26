import { Mission } from '../types/mission';

export const mockMissions: Mission[] = [
  {
    id: '1',
    reference: 'MIS-2024-001',
    title: 'Contrôle de la Banque Populaire',
    description: 'Contrôle de la conformité au RGPD des traitements de données personnelles',
    type_mission: 'Contrôle sur place',
    organization: 'Banque Populaire',
    address: 'Avenue Abdoulaye Fadiga, Dakar',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    status: 'TERMINEE',
    motif_controle: 'Suite a une plainte',
    decision_numero: 'DEC-2024-001',
    date_decision: '2024-02-01',
    team_members: ['Mamadou Diop', 'Fatou Sow', 'Abdoulaye Thiam'],
    objectives: [
      'Vérifier la conformité des traitements de données personnelles',
      'Évaluer les mesures de sécurité mises en place',
      'Contrôler la gestion des droits des personnes'
    ],
    findings: [
      {
        id: 'f1',
        mission_id: '1',
        type: 'NON_CONFORMITE_MAJEURE',
        description: 'Absence de registre des traitements à jour',
        reference_legale: 'Article 30 du RGPD',
        recommandation: 'Mettre en place un registre des traitements conforme au RGPD',
        delai_correction: 30,
        date_constat: '2024-01-18',
        created_at: '2024-01-18T10:00:00Z',
        updated_at: '2024-01-18T10:00:00Z'
      },
      {
        id: 'f2',
        mission_id: '1',
        type: 'NON_CONFORMITE_MINEURE',
        description: 'Manque de documentation sur les procédures de sécurité',
        reference_legale: 'Article 32 du RGPD',
        recommandation: 'Documenter les procédures de sécurité',
        delai_correction: 60,
        date_constat: '2024-01-19',
        created_at: '2024-01-19T14:30:00Z',
        updated_at: '2024-01-19T14:30:00Z'
      }
    ],
    remarks: [
      {
        id: 'r1',
        mission_id: '1',
        content: 'L\'organisation a montré une bonne volonté pour corriger les non-conformités',
        created_at: '2024-01-20T09:00:00Z',
        updated_at: '2024-01-20T09:00:00Z'
      }
    ],
    sanctions: [
      {
        id: 's1',
        mission_id: '1',
        type: 'MISE_EN_DEMEURE',
        description: 'Mise en demeure pour non-conformité majeure concernant le registre des traitements',
        decision_date: '2024-02-01',
        created_at: '2024-02-01T10:00:00Z',
        updated_at: '2024-02-01T10:00:00Z'
      }
    ],
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  },
  {
    id: '2',
    reference: 'MIS-2024-002',
    title: 'Contrôle de la Sonatel',
    description: 'Contrôle de la conformité au RGPD des traitements de données personnelles',
    type_mission: 'Contrôle sur place',
    organization: 'Sonatel',
    address: 'Avenue Abdoulaye Fadiga, Dakar',
    start_date: '2024-02-01',
    end_date: '2024-02-05',
    status: 'EN_COURS',
    motif_controle: 'Decision de la session pleniere',
    team_members: ['Mamadou Diop', 'Fatou Sow'],
    objectives: [
      'Vérifier la conformité des traitements de données personnelles',
      'Évaluer les mesures de sécurité mises en place',
      'Contrôler la gestion des droits des personnes'
    ],
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z'
  },
  {
    id: '3',
    reference: 'MIS-2024-003',
    title: 'Contrôle de la CBAO',
    description: 'Contrôle de la conformité au RGPD des traitements de données personnelles',
    type_mission: 'Contrôle sur place',
    organization: 'CBAO',
    address: 'Avenue Abdoulaye Fadiga, Dakar',
    start_date: '2024-01-10',
    end_date: '2024-01-15',
    status: 'TERMINEE',
    motif_controle: 'Autres',
    decision_numero: 'DEC-2024-002',
    date_decision: '2024-01-25',
    team_members: ['Abdoulaye Thiam', 'Aïssatou Ba', 'Moussa Ndiaye'],
    objectives: [
      'Vérifier la conformité des traitements de données personnelles',
      'Évaluer les mesures de sécurité mises en place',
      'Contrôler la gestion des droits des personnes'
    ],
    findings: [
      {
        id: 'f3',
        mission_id: '3',
        type: 'NON_CONFORMITE_MAJEURE',
        description: 'Violation du principe de minimisation des données',
        reference_legale: 'Article 5 du RGPD',
        recommandation: 'Réduire la collecte de données personnelles aux strict minimum nécessaire',
        delai_correction: 45,
        date_constat: '2024-01-12',
        created_at: '2024-01-12T11:00:00Z',
        updated_at: '2024-01-12T11:00:00Z'
      },
      {
        id: 'f4',
        mission_id: '3',
        type: 'NON_CONFORMITE_MINEURE',
        description: 'Absence de politique de conservation des données',
        reference_legale: 'Article 5 du RGPD',
        recommandation: 'Établir une politique de conservation des données',
        delai_correction: 90,
        date_constat: '2024-01-13',
        created_at: '2024-01-13T15:45:00Z',
        updated_at: '2024-01-13T15:45:00Z'
      }
    ],
    remarks: [
      {
        id: 'r2',
        mission_id: '3',
        content: 'L\'organisation doit améliorer sa gouvernance des données personnelles',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      }
    ],
    sanctions: [
      {
        id: 's2',
        mission_id: '3',
        type: 'AMENDE',
        description: 'Amende de 5 millions FCFA pour violation du principe de minimisation des données',
        decision_date: '2024-01-25',
        created_at: '2024-01-25T14:00:00Z',
        updated_at: '2024-01-25T14:00:00Z'
      }
    ],
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-25T14:00:00Z'
  },
  {
    id: '4',
    reference: 'MIS-2024-004',
    title: 'Contrôle de la BICIS',
    description: 'Contrôle de la conformité au RGPD des traitements de données personnelles',
    type_mission: 'Contrôle sur place',
    organization: 'BICIS',
    address: 'Avenue Abdoulaye Fadiga, Dakar',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    status: 'PLANIFIEE',
    motif_controle: 'Programme annuel',
    team_members: ['Mamadou Diop', 'Fatou Sow', 'Abdoulaye Thiam'],
    objectives: [
      'Vérifier la conformité des traitements de données personnelles',
      'Évaluer les mesures de sécurité mises en place',
      'Contrôler la gestion des droits des personnes'
    ],
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-15T09:00:00Z'
  }
];