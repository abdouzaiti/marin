import { DomainCategory, TrainingPath } from "../types";

export const DOMAIN_CATEGORIES: DomainCategory[] = [
  {
    id: "comptabilite",
    name: "Comptabilité & Finance",
    tagline: "Maîtrisez les états financiers, la fiscalité et le contrôle de gestion",
    description: "Formations professionnelles certifiantes pour devenir comptable, chef comptable ou auditeur financier avec des cas réels d'entreprise.",
    iconName: "Calculator",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    popularModules: ["Bilan et Compte de Résultat", "Fiscalité des Entreprises", "Contrôle de Gestion Avancé", "Paie et Charges Sociales"]
  },
  {
    id: "management",
    name: "Management & Leadership",
    tagline: "Pilotez des équipes, gérez le changement et développez votre charisme",
    description: "Développez les compétences managériales indispensables pour motiver les collaborateurs, résoudre les conflits et structurer la croissance.",
    iconName: "Users",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    popularModules: ["Fondamentaux du Management", "Gestion des Conflits & Négociation", "Leadership Stratégique", "Conduite du Changement"]
  },
  {
    id: "agence-voyage",
    name: "Agence de Voyage & Tourisme",
    tagline: "Concevez des séjours sur-mesure, maîtrisez la billetterie et le yield management",
    description: "Devenez expert en conception de voyages, tarification, billetterie aérienne (GDS) et marketing touristique international.",
    iconName: "Plane",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    popularModules: ["Techniques de Vente en Tourisme", "Billetterie & Tarification GDS", "Création de Circuits Sur-Mesure", "Marketing Digital Touristique"]
  },
  {
    id: "marketing",
    name: "Marketing Digital & E-Commerce",
    tagline: "Acquérez des clients, optimisez les conversions et maîtrisez les leviers web",
    description: "Stratégies d'acquisition payante (Ads), SEO avancé, community management et analyse de données e-commerce.",
    iconName: "TrendingUp",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    popularModules: ["Stratégie SEO & Référencement", "Publicité Sociale (Meta & Google Ads)", "Growth Hacking", "E-commerce & Conversion"]
  },
  {
    id: "project-management",
    name: "Gestion de Projets (Agile & PMP)",
    tagline: "Livrez vos projets dans les délais, gérez les budgets et les risques",
    description: "Méthodologies agiles (Scrum, Kanban) et cycle en cascade (PMP/PMI) pour mener à bien tout type de projet professionnel.",
    iconName: "Briefcase",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    popularModules: ["Fondamentaux Scrum & Agile", "Gestion des Risques & Budget", "Outils de Planification (Jira/Asana)", "Management de Stakeholders"]
  },
  {
    id: "data-analysis",
    name: "Data Analysis & Business Intelligence",
    tagline: "Transformez les données brutes en décisions stratégiques éclairées",
    description: "Maîtrisez SQL, Python, PowerBI et la visualisation de données pour booster la performance de votre entreprise.",
    iconName: "BarChart3",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    popularModules: ["SQL & Extraction de Données", "Dashboarding avec PowerBI", "Introduction à Python pour la Data", "Prise de Décision par les KPI"]
  }
];

export const PRESET_PATHS: Record<string, TrainingPath> = {
  comptabilite: {
    title: "Expertise Comptable & Financière d'Entreprise",
    description: "Parcours complet certifiant pour maîtriser la comptabilité générale, les bilans, la liasse fiscale et le contrôle de gestion.",
    estimatedWeeks: 12,
    difficulty: "Intermédiaire",
    modules: [
      {
        id: "c1",
        title: "Bilan, Actif et Passif en Pratique",
        description: "Comprendre et analyser les documents comptables fondamentaux d'une PME.",
        duration: "2 semaines",
        topics: ["Écritures d'inventaire", "Amortissements et provisions", "Lecture du bilan comptable"],
        practicalProject: "Établissement du bilan annuel fictif d'une société commerciale."
      },
      {
        id: "c2",
        title: "Fiscalité & Déclarations Fiscales (TVA, IS)",
        description: "Maîtriser les obligations fiscales courantes des entreprises.",
        duration: "3 semaines",
        topics: ["Calcul et déclaration de TVA", "Impôt sur les Sociétés (IS)", "Crédit d'impôt recherche"],
        practicalProject: "Remplissage de la liasse fiscale 2050 d'une entreprise de services."
      },
      {
        id: "c3",
        title: "Contrôle de Gestion & Analyse des Coûts",
        description: "Piloter la rentabilité, calculer les seuils de rentabilité et le budget prévisionnel.",
        duration: "3 semaines",
        topics: ["Comptabilité analytique", "Seuil de rentabilité", "Écarts budgétaires"],
        practicalProject: "Conception d'un tableau de bord budgétaire trimestriel."
      }
    ]
  },
  management: {
    title: "Management Stratégique & Leadership Opérationnel",
    description: "Devenez un leader inspirant capable de piloter des équipes performantes et de gérer la conduite du changement.",
    estimatedWeeks: 10,
    difficulty: "Avancé",
    modules: [
      {
        id: "m1",
        title: "Fondamentaux du Leadership & Posture Managériale",
        description: "Trouver sa juste posture entre autorité, écoute et inspiration.",
        duration: "2 semaines",
        topics: ["Styles de management", "Délégation efficace", "Communication interpersonnelle"],
        practicalProject: "Élaboration de sa charte managériale personnelle."
      },
      {
        id: "m2",
        title: "Gestion des Conflits & Feedbacks Constructifs",
        description: "Transformer les tensions en opportunités d'amélioration et mener les entretiens annuels.",
        duration: "3 semaines",
        topics: ["Méthode CNV (Communication Non Violente)", "Gestion de crise", "Entretiens de cadrage"],
        practicalProject: "Simulation de résolution d'un conflit de surcharge entre deux collaborateurs."
      }
    ]
  },
  "agence-voyage": {
    title: "Direction d'Agence de Voyage & Tourisme Sur-Mesure",
    description: "Maîtrisez la création de voyages d'exception, la billetterie, la tarification GDS et la fidélisation client.",
    estimatedWeeks: 8,
    difficulty: "Tous Niveaux",
    modules: [
      {
        id: "v1",
        title: "Conception de Circuits Touristiques Sur-Mesure",
        description: "Architecture d'itinéraires, négociation prestataires et logistique internationale.",
        duration: "2 semaines",
        topics: ["Sourcing hôtelier & DMC", "Gestion des aléas voyageurs", "Tarification & Marge brute"],
        practicalProject: "Création d'un combiné 12 jours safari-luxe au Kenya pour un client VIP."
      },
      {
        id: "v2",
        title: "Billetterie Aérienne & Réglementations IATA",
        description: "Émission, modification, annulation et règles tarifaires des billets d'avion.",
        duration: "3 semaines",
        topics: ["Codes aéroports & compagnies", "Tarifs négociés & commissions", "Régulations IATA"],
        practicalProject: "Résolution et réémission de billets complexes sur simulateur."
      }
    ]
  }
};
