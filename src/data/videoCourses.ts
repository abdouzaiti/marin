export interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string; // embed or placeholder
  transcript: string;
  chapters: { time: string; title: string }[];
}

export interface VideoCourse {
  id: string;
  title: string;
  domain: string;
  instructor: string;
  instructorAvatar: string;
  thumbnail: string;
  views: string;
  uploadedAt: string;
  duration: string;
  description: string;
  rating: number;
  lessons: VideoLesson[];
}

export const VIDEO_COURSES: VideoCourse[] = [
  {
    id: "vc-finance-ar",
    title: "المالية الذكية: كيف تضمن أموالك وتتحكم في مستقبلك",
    domain: "المالية الذكية",
    instructor: "م. إبراهيم البحري",
    instructorAvatar: "/instructor.jpg",
    thumbnail: "/instructor.jpg",
    views: "58k مشاهدة",
    uploadedAt: "جديد",
    duration: "1h 15m",
    description: "دورة المالية الذكية: تعلم الاستراتيجيات المالية الفعالة لإدارة السيولة، تنمية الثروة والتحكم الكامل في التدفقات النقدية واستثمار المستقبل.",
    rating: 4.98,
    lessons: [
      {
        id: "fin-1",
        title: "الأسس الجوهرية لإدارة الأموال الذكية",
        duration: "25:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "أهلاً بكم في دورة المالية الذكية. كيف ننتقل من مرحلة إدارة النفقات إلى بناء منظومة مالية رابحة ومستدامة...",
        chapters: [
          { time: "00:00", title: "مقدمة الدورة والأهداف" },
          { time: "08:15", title: "قواعد التحكم في التدفق المالي" },
          { time: "18:30", title: "استراتيجيات الاستثمار الآمن" }
        ]
      }
    ]
  },
  {
    id: "vc-marketing-ar",
    title: "التسويق الاستراتيجي: أطلق قيمة تجعلك بلا منافسة",
    domain: "التسويق الاستراتيجي",
    instructor: "م. إبراهيم البحري",
    instructorAvatar: "/instructor.jpg",
    thumbnail: "/instructor.jpg",
    views: "46k مشاهدة",
    uploadedAt: "شائع",
    duration: "1h 30m",
    description: "دورة التسويق الاستراتيجي: كيفية خلق عرض لا يُقاوم، بناء مكانة سوقية مهيمنة، وجذب العملاء دون حرق الأسعار.",
    rating: 4.95,
    lessons: [
      {
        id: "mkt-1",
        title: "هندسة القيمة والموقع الاستراتيجي",
        duration: "30:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "في هذا الدرس سنتعلم كيف تبني ميزة تنافسية فريدة تجعل المنافسين غير ذي صلة بعرضك القوي...",
        chapters: [
          { time: "00:00", title: "مفهوم القيمة غير القابلة للمنافسة" },
          { time: "12:00", title: "تحليل سيكولوجية العميل المستهدف" },
          { time: "22:00", title: "إطلاق الحملة الاستراتيجية" }
        ]
      }
    ]
  },
  {
    id: "vc-system-ar",
    title: "نظام الشركة: من التسيير العشوائي إلى التحكم الكامل",
    domain: "نظام الشركة",
    instructor: "م. إبراهيم البحري",
    instructorAvatar: "/instructor.jpg",
    thumbnail: "/instructor.jpg",
    views: "64k مشاهدة",
    uploadedAt: "موصى به",
    duration: "1h 45m",
    description: "دورة نظام الشركة: بناء العمليات والأتمتة وتفويض المهام لتتحول مؤسستك إلى آلة عمل متقنة تدار بأقل تدخل شخصي.",
    rating: 4.99,
    lessons: [
      {
        id: "sys-1",
        title: "بناء الأنظمة وتوحيد إجراءات العمل",
        duration: "35:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "كيف تنتقل من العمل الارتجالي إلى منظومة تشغيلية متكاملة تحقق أقصى إنتاجية بأقل جهد...",
        chapters: [
          { time: "00:00", title: "تشخيص الفوضى الإدارية" },
          { time: "14:00", title: "صياغة وتوثيق إجراءات التشغيل القياسية (SOP)" },
          { time: "25:00", title: "مؤشرات الأداء الرئيسية والتحكم" }
        ]
      }
    ]
  },
  {
    id: "vc-1",
    title: "Maîtriser le Bilan Comptable & Compte de Résultat de A à Z",
    domain: "Comptabilité & Finance",
    instructor: "Cabinet Expertis AI",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop",
    views: "42k vues",
    uploadedAt: "Il y a 3 jours",
    duration: "45:20",
    description: "Apprenez à décrypter un bilan comptable d'entreprise, analyser l'actif, le passif, le compte de résultat et calculer les ratios clés de solvabilité et de rentabilité.",
    rating: 4.9,
    lessons: [
      {
        id: "l1",
        title: "Introduction aux États Financiers",
        duration: "10:15",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Bienvenue dans ce cours complet sur la lecture du bilan comptable. Nous allons voir comment l'actif représente ce que possède l'entreprise et le passif ce qu'elle doit...",
        chapters: [
          { time: "00:00", title: "Introduction et Objectifs" },
          { time: "03:15", title: "La structure de l'Actif immobilisé et circulant" },
          { time: "07:30", title: "Le Passif : Capitaux propres et dettes" }
        ]
      },
      {
        id: "l2",
        title: "Analyse du Compte de Résultat & Soldes Intermédiaires de Gestion",
        duration: "18:40",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Le compte de résultat retrace l'activité de l'exercice comptable. Analysons la Marge Commerciale, la Valeur Ajoutée et l'Excédent Brut d'Exploitation (EBE)...",
        chapters: [
          { time: "00:00", title: "Rôle du Compte de Résultat" },
          { time: "05:20", title: "Calcul de la Valeur Ajoutée (VA)" },
          { time: "12:00", title: "Comprendre l'EBE et le Résultat Net" }
        ]
      },
      {
        id: "l3",
        title: "Cas Pratique : Liasse Fiscale PME",
        duration: "16:25",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Mettons en pratique sur un cas réel d'entreprise de négoce. Nous allons retraiter les amortissements et établir le tableau de financement...",
        chapters: [
          { time: "00:00", title: "Présentation du Cas Fictif" },
          { time: "06:10", title: "Retraitements et Ajustements" },
          { time: "13:00", title: "Conclusion et Ratios Clés" }
        ]
      }
    ]
  },
  {
    id: "vc-2",
    title: "Créer & Vendre un Voyage Sur-Mesure de Luxe : Stratégie Agence",
    domain: "Agence de Voyage & Tourisme",
    instructor: "Évasion Pro Academy",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop",
    views: "18k vues",
    uploadedAt: "Il y a 1 semaine",
    duration: "32:10",
    description: "Maîtrisez la conception d'itinéraires haut de gamme, le sourcing hôtelier international, la négociation DMC et la tarification avec marge pour agences de voyage.",
    rating: 4.8,
    lessons: [
      {
        id: "lv1",
        title: "Psychologie du Client VIP et Brief Sur-Mesure",
        duration: "12:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Le voyageur de luxe recherche l'exclusivité, l'intimité et le sans-faute. Comment qualifier ses attentes dès le premier échange...",
        chapters: [
          { time: "00:00", title: "Les attentes de la clientèles haut de gamme" },
          { time: "06:30", title: "Questionnaire de qualification VIP" }
        ]
      },
      {
        id: "lv2",
        title: "Sourcing Partenaires & Négociation DMC",
        duration: "20:10",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Travailler avec les meilleurs DMC locaux en Afrique, Asie et Amérique Latine pour garantir des expériences authentiques et sécurisées...",
        chapters: [
          { time: "00:00", title: "Sélection des réceptifs locaux" },
          { time: "11:40", title: "Contrats, commissions et marges nettes" }
        ]
      }
    ]
  },
  {
    id: "vc-3",
    title: "Management & Leadership : Gérer les Tensions et Conflits d'Équipe",
    domain: "Management & Leadership",
    instructor: "Leadership Lab BOTSCHAFT",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop",
    views: "56k vues",
    uploadedAt: "Il y a 2 semaines",
    duration: "28:45",
    description: "Techniques de communication non violente (CNV), entretiens de recadrage constructifs et médiation pour restaurer la performance collective.",
    rating: 4.95,
    lessons: [
      {
        id: "m1",
        title: "Diagnostiquer l'Origine des Tensions en Entreprise",
        duration: "14:20",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Un conflit non géré coûte 20% de productivité. Apprenez à repérer les signaux faibles de rupture dans l'équipe...",
        chapters: [
          { time: "00:00", title: "Les 4 stades du conflit professionnel" },
          { time: "08:10", title: "Posture du manager neutre et bienveillant" }
        ]
      },
      {
        id: "m2",
        title: "Conduire l'Entretien de Médiation Étape par Étape",
        duration: "14:25",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Protocole pratique de l'entretien de médiation : écoute active, reformulation et co-construction de solutions...",
        chapters: [
          { time: "00:00", title: "Règles d'or de la réunion de cadrage" },
          { time: "07:15", title: "Validation du plan d'action mutuel" }
        ]
      }
    ]
  },
  {
    id: "vc-4",
    title: "Fiscalité des Entreprises & Déclarations TVA et IS en Pratique",
    domain: "Comptabilité & Finance",
    instructor: "Cabinet Expertis AI",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop",
    views: "29k vues",
    uploadedAt: "Il y a 3 semaines",
    duration: "51:00",
    description: "Tout savoir sur les régimes de TVA (déclaration CA3), l'impôt sur les sociétés, les acomptes et les crédits d'impôt pour optimiser la fiscalité.",
    rating: 4.7,
    lessons: [
      {
        id: "f1",
        title: "Mécanismes de la TVA Collectée et Déductible",
        duration: "25:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "La TVA n'est ni une charge ni un produit pour l'entreprise. Voyons les régimes réels simplifié et normal...",
        chapters: [
          { time: "00:00", title: "Principe de neutralité de la TVA" },
          { time: "12:30", title: "Remplir sa déclaration CA3 pas à pas" }
        ]
      }
    ]
  },
  {
    id: "vc-5",
    title: "Marketing Digital & Stratégie Social Ads (Meta & Google)",
    domain: "Marketing Digital",
    instructor: "Growth Masters",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop",
    views: "64k vues",
    uploadedAt: "Il y a 1 mois",
    duration: "38:15",
    description: "Structurez vos campagnes publicitaires payantes pour générer des leads qualifiés en B2B et B2C avec un ROI mesurable.",
    rating: 4.88,
    lessons: [
      {
        id: "mk1",
        title: "Tunnel de Conversion & Ciblage Avancé",
        duration: "18:15",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Comment architecturer ses campagnes de paid acquisition de la notoriété à l'achat final...",
        chapters: [
          { time: "00:00", title: "Le tunnel TOFU - MOFU - BOFU" },
          { time: "09:00", title: "Création des audiences similaires (Lookalike)" }
        ]
      }
    ]
  },
  {
    id: "vc-6",
    title: "SQL & Dashboards PowerBI pour la Prise de Décision DAF",
    domain: "Data Analysis",
    instructor: "Data School Pro",
    instructorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=faces",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    views: "31k vues",
    uploadedAt: "Il y a 2 semaines",
    duration: "42:30",
    description: "Extrayez les données financières de vos bases SQL et automatisez des tableaux de bord dynamiques pour la direction financière.",
    rating: 4.92,
    lessons: [
      {
        id: "d1",
        title: "Requêtes SQL Avancées pour la Trésorerie",
        duration: "20:00",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        transcript: "Utilisation des fonctions agrégées (SUM, GROUP BY, HAVING) pour analyser les flux de trésorerie sur 12 mois...",
        chapters: [
          { time: "00:00", title: "Rappels SQL pour analystes" },
          { time: "10:00", title: "Jointures complexes sur factures et règlements" }
        ]
      }
    ]
  }
];

export const YOUTUBE_CATEGORIES = [
  "Tout",
  "Comptabilité & Finance",
  "Management & Leadership",
  "Agence de Voyage & Tourisme",
  "Marketing Digital",
  "Data Analysis",
  "Gestion de Projets",
  "Formations Certifiantes",
  "Direct en Direct IA",
  "Nouveautés"
];
