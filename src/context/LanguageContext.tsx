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
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "fr",
  setLanguage: () => {},
  t: (key) => translations.fr[key] || key,
  isRTL: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("marin_lang");
    if (saved === "ar" || saved === "en" || saved === "fr") return saved;
    return "fr";
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
