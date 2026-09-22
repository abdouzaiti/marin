import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "ar" | "en";

export interface Translations {
  home: string;
  exploreTracks: string;
  explore: string;
  signIn: string;
  signUp: string;
  all: string;
  navBridge: string;
  safetySTCW: string;
  machineryPropulsion: string;
  regLaw: string;
  meteoOcean: string;
  searchPlaceholder: string;
  categories: string;
  coursesAvailable: string;
  featuredMasterclasses: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  expert: string;
  backToHome: string;
  academyHeadline: string;
  academySubheadline: string;
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  lastName: string;
  firstName: string;
  username: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  loginIdentifier: string;
  forgotPassword: string;
  resetPasswordAlert: string;
  createAccount: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  signUpForFree: string;
  fillRequiredFields: string;
  passwordMismatch: string;
  passwordMinLength: string;
  accountCreated: string;
  fillCredentials: string;
  loginSuccess: string;
  saved: string;
  history: string;
  heroTitle: string;
  heroSubtitle: string;
  browseCourses: string;
  startNow: string;
  aboutUs: string;
  contactUs: string;
  ecosystemTitle: string;
  ecosystemSubtitle: string;
  clubTitle: string;
  clubDesc: string;
  academyBranchTitle: string;
  academyBranchDesc: string;
  networkBranchTitle: string;
  networkBranchDesc: string;
  activeTrainees: string;
  recordedLectures: string;
  clubItem1: string;
  clubItem2: string;
  clubItem3: string;
  academyItem1: string;
  academyItem2: string;
  academyItem3: string;
  networkItem1: string;
  networkItem2: string;
  networkItem3: string;
  aboutTitle: string;
  aboutSubtitle: string;
  visionTitle: string;
  visionDesc: string;
  missionTitle: string;
  missionDesc: string;
  valuesTitle: string;
  valuesDesc: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
  contactUsHeading: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    home: "Accueil",
    exploreTracks: "Explorer les Filières",
    explore: "Explorer",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    all: "Tout",
    navBridge: "Navigation & Passerelle",
    safetySTCW: "Sécurité & STCW",
    machineryPropulsion: "Machinerie & Propulsion",
    regLaw: "Réglementation & Droit",
    meteoOcean: "Météorologie & Océanographie",
    searchPlaceholder: "Rechercher une masterclass, un instructeur, un code STCW ou un module...",
    categories: "Filières de formation",
    coursesAvailable: "cours disponibles",
    featuredMasterclasses: "Formations & Masterclasses Vidéo",
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    expert: "Expert",
    backToHome: "Retour à l'accueil",
    academyHeadline: "L'excellence des formations maritimes et professionnelles",
    academySubheadline: "Accédez à des centaines d'heures de masterclasses, des simulations radar interactives, des modules STCW et des certifications reconnues.",
    loginTitle: "Connexion à votre espace",
    loginSubtitle: "Entrez vos identifiants pour continuer votre formation.",
    registerTitle: "Créer un compte MARIN Academy",
    registerSubtitle: "Complétez le formulaire ci-dessous pour créer votre profil marin.",
    lastName: "Nom",
    firstName: "Prénom",
    username: "Nom d'utilisateur",
    emailAddress: "Adresse Email",
    password: "Mot de passe",
    confirmPassword: "Confirmation de mot de passe",
    loginIdentifier: "Email ou Nom d'utilisateur",
    forgotPassword: "Mot de passe oublié ?",
    resetPasswordAlert: "Un lien de réinitialisation vous sera envoyé par email.",
    createAccount: "Créer mon compte",
    dontHaveAccount: "Pas encore de compte ?",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signUpForFree: "S'inscrire gratuitement",
    fillRequiredFields: "Veuillez remplir tous les champs obligatoires (*).",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères.",
    accountCreated: "Compte créé avec succès ! Bienvenue à bord,",
    fillCredentials: "Veuillez renseigner votre email / nom d'utilisateur et mot de passe.",
    loginSuccess: "Connexion réussie ! Bon retour à bord.",
    saved: "Enregistrés",
    history: "Historique",
    heroTitle: "Apprenez l'entrepreneuriat et le business par la pratique",
    heroSubtitle: "Nous proposons des formations spécialisées en gestion, finance intelligente et marketing, avec une approche axée sur la pratique et la croissance des entreprises.",
    browseCourses: "Explorer les cours",
    startNow: "Commencer",
    aboutUs: "À propos",
    contactUs: "Contact",
    ecosystemTitle: "Piliers de l'écosystème MARIN",
    ecosystemSubtitle: "Un écosystème intégré pour les entrepreneurs et porteurs de projets combinant formation pratique, club d'affaires et réseau de relations d'investissement en Algérie.",
    clubTitle: "Le plus grand club d'affaires de l'Ouest algérien",
    clubDesc: "Un rassemblement élitiste réunissant leaders d'entreprises, investisseurs et entrepreneurs de l'Ouest algérien pour échanger des opportunités d'investissement et nouer des alliances stratégiques.",
    academyBranchTitle: "Académie Numérique & Formation Pratique",
    academyBranchDesc: "Formations professionnelles d'élite et masterclasses dispensées par des experts reconnus pour accélérer la croissance de vos projets.",
    networkBranchTitle: "Réseau de relations & Opportunités d'affaires",
    networkBranchDesc: "Un pont stratégique pour connecter les porteurs de projets, investisseurs et entreprises afin d'accélérer les transactions et ouvrir de nouveaux horizons commerciaux.",
    activeTrainees: "Stagiaires actifs",
    recordedLectures: "Cours enregistrés",
    clubItem1: "Réunions périodiques et séminaires stratégiques",
    clubItem2: "Incubateur de partenariats et alliances commerciales",
    clubItem3: "Environnement professionnel pour la croissance des entreprises",
    academyItem1: "Cours interactifs et enregistrés de haute qualité",
    academyItem2: "Modèles et fichiers de travail téléchargeables",
    academyItem3: "Certificats de fin de formation et suivi d'experts",
    networkItem1: "Sessions de réseautage fermées (B2B Networking)",
    networkItem2: "Connexion directe entre projets et investisseurs",
    networkItem3: "Opportunités exclusives de contrats et de financement",
    aboutTitle: "À propos de nous",
    aboutSubtitle: "L'écosystème intégré MARIN • Notre vision, mission et passion pour autonomiser les entrepreneurs et bâtir une économie durable.",
    visionTitle: "Notre vision stratégique",
    visionDesc: "Être le premier et le plus influent écosystème en Algérie pour soutenir et autonomiser les chefs d'entreprise, en offrant un environnement d'investissement et d'apprentissage intégré.",
    missionTitle: "Notre mission pratique",
    missionDesc: "Fournir des programmes de formation et de mentorat fondés sur des cas réels et des expériences de terrain, tout en facilitant la mise en réseau entre entrepreneurs et investisseurs.",
    valuesTitle: "Nos valeurs & principes",
    valuesDesc: "Le pragmatisme, la transparence, l'engagement envers l'excellence et la création d'alliances commerciales durables au service de la communauté économique algérienne.",
    ctaTitle: "Commencez votre parcours de formation et développez votre entreprise",
    ctaDesc: "Rejoignez l'élite des entrepreneurs et profitez des dernières masterclasses stratégiques et pratiques de l'académie MARIN.",
    ctaButton: "Accéder à l'académie et commencer",
    contactUsHeading: "Contactez-nous",
  },
  ar: {
    home: "الرئيسية",
    exploreTracks: "استكشاف التخصصات",
    explore: "استكشاف",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    all: "الكل",
    navBridge: "الملاحة وغرفة القيادة",
    safetySTCW: "السلامة ومعايير STCW",
    machineryPropulsion: "المحركات والدفع البحري",
    regLaw: "القوانين والتشريعات البحرية",
    meteoOcean: "الأرصاد الجوية وعلوم المحيطات",
    searchPlaceholder: "ابحث عن دورة تدريبية، مدرب، رمز STCW أو وحدة تعليمية...",
    categories: "المسارات التدريبية",
    coursesAvailable: "دورات متاحة",
    featuredMasterclasses: "الدورات والماستركلاس البحرية",
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
    expert: "خبير",
    backToHome: "العودة للرئيسية",
    academyHeadline: "التميز في التدريب البحري والتطوير المهني",
    academySubheadline: "انضم إلى نخبة الضباط والقادة والمهندسين البحريين لتطوير مهاراتك بشهادات معتمدة دولياً.",
    loginTitle: "تسجيل الدخول إلى حسابك",
    loginSubtitle: "أدخل بياناتك للمتابعة في دوراتك التعليمية.",
    registerTitle: "إنشاء حساب في أكاديمية MARIN",
    registerSubtitle: "أكمل النموذج التالي لإنشاء ملفك البحري المهني.",
    lastName: "اللقب (الاسم العائلي)",
    firstName: "الاسم الأول",
    username: "اسم المستخدم",
    emailAddress: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    loginIdentifier: "البريد الإلكتروني أو اسم المستخدم",
    forgotPassword: "نسيت كلمة المرور؟",
    resetPasswordAlert: "سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.",
    createAccount: "إنشاء حسابي",
    dontHaveAccount: "ليس لديك حساب بعد؟",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟",
    signUpForFree: "إنشاء حساب مجاناً",
    fillRequiredFields: "يرجى ملء جميع الحقول الإلزامية (*).",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    passwordMinLength: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.",
    accountCreated: "تم إنشاء الحساب بنجاح! مرحباً بك على متن السفينة،",
    fillCredentials: "يرجى إدخال اسم المستخدم وكلمة المرور.",
    loginSuccess: "تم تسجيل الدخول بنجاح! مرحباً بعودتك.",
    saved: "المحفوظات",
    history: "السجل",
    heroTitle: "تعلّم الريادة والأعمال بالتطبيق العملي",
    heroSubtitle: "نُقدم دورات تدريبية متخصصة في مجالات الإدارة والمالية الذكية والتسويق، بأسلوب تدريبي يركز على التطبيق العملي وبناء ونمو الشركات.",
    browseCourses: "استعراض الدورات",
    startNow: "ابدأ الآن",
    aboutUs: "من نحن",
    contactUs: "تواصل معنا",
    ecosystemTitle: "ركائز منظومة MARIN",
    ecosystemSubtitle: "منظومة متكاملة لرواد الأعمال وأصحاب المشاريع تجمع بين التدريب التطبيقي، نادي الأعمال، وشبكة العلاقات الاستثمارية في الجزائر",
    clubTitle: "أكبر نادي أعمال في الغرب الجزائري",
    clubDesc: "ملتقى نخبوي يجمع قادة الشركات والمستثمرين ورواد الأعمال في الغرب الجزائري لتبادل الفرص الاستثمارية والخبرات القيادية وصناعة التحالفات.",
    academyBranchTitle: "الأكاديمية الرقمية والتدريب التطبيقي",
    academyBranchDesc: "دورات تدريبية متخصصة وبرامج إرشادية يقودها نخبة من الخبراء لتطوير مهاراتك القيادية وتسريع نمو مشروعك.",
    networkBranchTitle: "شبكة العلاقات وفرص الأعمال",
    networkBranchDesc: "جسر استراتيجي لتشبيك العلاقات بين أصحاب المشاريع، المستثمرين، والمؤسسات لتسريع الصفقات وفتح آفاق تجارية وشراكات نوعية.",
    activeTrainees: "متدرب نشط",
    recordedLectures: "محاضرة مسجلة",
    clubItem1: "لقاءات دورية وندوات أعمال استراتيجية",
    clubItem2: "حاضنة شراكات وتكتلات تجارية رائدة",
    clubItem3: "بيئة احترافية لدعم توسع وتطوير الشركات",
    academyItem1: "دروس تفاعلية ومسجلة بجودة عالية",
    academyItem2: "نماذج وملفات عمل قابلة للتحميل والتطبيق",
    academyItem3: "شهادات إتمام ومتابعة عملية من الخبراء",
    networkItem1: "جلسات تشبيك مغلقة (B2B Networking)",
    networkItem2: "ربط مباشر بين المشاريع الواعدة والمستثمرين",
    networkItem3: "فرص حصرية للتعاقد والتمويل والتوسع الإقليمي",
    aboutTitle: "من نحن",
    aboutSubtitle: "منظومة مارين المتكاملة • رؤيتنا، رسالتنا، وشغفنا في تمكين رواد الأعمال وبناء اقتصاد مستدام في الجزائر",
    visionTitle: "رؤيتنا الاستراتيجية",
    visionDesc: "أن نكون المنظومة الأولى والأكثر تأثيراً في الجزائر لدعم وتمكين قادة الأعمال، وتوفير بيئة استثمارية وتعليمية متكاملة ترفع كفاءة ومردودية المشاريع الوطنية.",
    missionTitle: "رسالتنا التطبيقية",
    missionDesc: "تقديم برامج تدريبية وتطبيقية قائمة على تجارب واقعية وحالات دراسية ميدانية، مع تسهيل الربط بين رواد الأعمال، المستثمرين، والخبراء لتحقيق نمو سريع ومدروس.",
    valuesTitle: "قيمنا ومبادئنا",
    valuesDesc: "الواقعية والابتعاد عن التنظير المجرد، الشفافية، الالتزام بالتميز والجودة، وصناعة تحالفات أعمال قوية ومستمرة تخدم مصلحة المجتمع الاقتصادي الجزائري.",
    ctaTitle: "ابدأ رحلتك التدريبية وطوّر أعمالك اليوم",
    ctaDesc: "انضم إلى نخبة رواد الأعمال واستفد من أحدث الدورات الاستراتيجية والتطبيقية في أكاديمية مارين.",
    ctaButton: "دخول الأكاديمية والبدء الآن",
    contactUsHeading: "تواصل معنا",
  },
  en: {
    home: "Home",
    exploreTracks: "Explore Tracks",
    explore: "Explore",
    signIn: "Sign In",
    signUp: "Sign Up",
    all: "All",
    navBridge: "Navigation & Bridge",
    safetySTCW: "Safety & STCW",
    machineryPropulsion: "Machinery & Propulsion",
    regLaw: "Maritime Law & Regulations",
    meteoOcean: "Meteorology & Oceanography",
    searchPlaceholder: "Search masterclasses, instructors, STCW codes or modules...",
    categories: "Training Disciplines",
    coursesAvailable: "courses available",
    featuredMasterclasses: "Video Masterclasses & Courses",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    backToHome: "Back to Home",
    academyHeadline: "Excellence in Maritime & Professional Training",
    academySubheadline: "Access hundreds of hours of video masterclasses, interactive radar simulations, STCW modules, and recognized certifications.",
    loginTitle: "Sign in to your account",
    loginSubtitle: "Enter your credentials to continue your maritime courses.",
    registerTitle: "Create your MARIN Academy Account",
    registerSubtitle: "Fill out the form below to create your professional maritime profile.",
    lastName: "Last Name",
    firstName: "First Name",
    username: "Username",
    emailAddress: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    loginIdentifier: "Email or Username",
    forgotPassword: "Forgot password?",
    resetPasswordAlert: "A password reset link will be sent to your email.",
    createAccount: "Create Account",
    dontHaveAccount: "Don't have an account yet?",
    alreadyHaveAccount: "Already have an account?",
    signUpForFree: "Sign up for free",
    fillRequiredFields: "Please fill in all required fields (*).",
    passwordMismatch: "Passwords do not match.",
    passwordMinLength: "Password must be at least 6 characters.",
    accountCreated: "Account created successfully! Welcome aboard,",
    fillCredentials: "Please enter your username and password.",
    loginSuccess: "Successfully logged in! Welcome back aboard.",
    saved: "Saved",
    history: "History",
    heroTitle: "Learn Entrepreneurship & Business Through Practical Application",
    heroSubtitle: "We offer specialized training courses in management, smart finance, and marketing, focused on hands-on application and enterprise growth.",
    browseCourses: "Browse Courses",
    startNow: "Get Started",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    ecosystemTitle: "MARIN Ecosystem Pillars",
    ecosystemSubtitle: "An integrated ecosystem for entrepreneurs and project owners combining practical training, business club, and investment networking in Algeria.",
    clubTitle: "The Biggest Business Club in West Algeria",
    clubDesc: "An elite gathering of business leaders, investors, and entrepreneurs in Western Algeria to exchange investment opportunities and forge strategic alliances.",
    academyBranchTitle: "Digital Academy & Practical Training",
    academyBranchDesc: "Specialized training courses and mentoring programs led by expert practitioners to develop leadership skills and accelerate project growth.",
    networkBranchTitle: "Networking & Business Opportunities",
    networkBranchDesc: "A strategic bridge connecting project owners, investors, and institutions to accelerate deals and open commercial horizons and quality partnerships.",
    activeTrainees: "Active Trainees",
    recordedLectures: "Recorded Lectures",
    clubItem1: "Periodic meetings & strategic business seminars",
    clubItem2: "Incubator for partnerships and leading business clusters",
    clubItem3: "Professional environment to support business expansion",
    academyItem1: "Interactive & high-quality recorded lessons",
    academyItem2: "Downloadable templates & work files",
    academyItem3: "Completion certificates & expert mentorship",
    networkItem1: "Closed networking sessions (B2B Networking)",
    networkItem2: "Direct connection between promising projects and investors",
    networkItem3: "Exclusive opportunities for contracting and funding",
    aboutTitle: "About Us",
    aboutSubtitle: "The integrated MARIN ecosystem • Our vision, mission and passion in empowering entrepreneurs and building a sustainable economy.",
    visionTitle: "Our Strategic Vision",
    visionDesc: "To be the premier and most impactful ecosystem in Algeria to support and empower business leaders, providing an integrated investment and learning environment.",
    missionTitle: "Our Practical Mission",
    missionDesc: "Delivering training and practical programs based on real-world cases and field studies, while facilitating networking among entrepreneurs, investors, and experts.",
    valuesTitle: "Our Values & Principles",
    valuesDesc: "Realism, avoidance of abstract theorizing, transparency, commitment to excellence and quality, and forging strong and continuous business alliances.",
    ctaTitle: "Start Your Training Journey and Grow Your Business Today",
    ctaDesc: "Join elite entrepreneurs and benefit from the latest strategic and practical courses at MARIN Academy.",
    ctaButton: "Enter Academy & Start Now",
    contactUsHeading: "Contact Us",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  t: (key) => translations.ar[key] || key,
  isRTL: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("marin_lang");
    if (saved === "en") return saved;
    // Default to Arabic for the app
    return "ar";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("marin_lang", lang);
  };

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: keyof Translations): string => {
    return translations[language]?.[key] || translations.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
