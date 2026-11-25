import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  AtSign,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Compass,
  Anchor,
  Loader2,
  Info,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { UserProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  initialMode?: "login" | "register";
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  onSuccess,
  onBackToHome,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { t, language, isRTL } = useLanguage();
  const { login, register, supabaseConfigured } = useAuth();

  // Registration fields
  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [requestedRole, setRequestedRole] = useState<"student" | "teacher">("student");
  const [requestNote, setRequestNote] = useState<string>("");

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setInfoMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  const roleLabels =
    language === "ar"
      ? {
          requestType: "نوع الحساب المطلوب",
          student: "طالب / متدرب",
          studentSub: "دخول الدورات والمسارات التدريبية",
          teacher: "أستاذ / مدرب",
          teacherSub: "تأطير الفصول وإدارة الدروس",
          noteLabel: "التخصص أو ملاحظة الطلب (اختياري)",
          notePlaceholder: "مثال: أستاذ مالية، طالب إدارة أعمال...",
          guestNotice:
            "عند التسجيل، تدخل المنصة بصفة زائر (Guest) ويظهر طلبك في لوحة المطور لتأكيد دورك.",
          pendingConfirmation:
            "تم إنشاء حسابك بصفة زائر! تم إرسال طلبك بنجاح وبانتظار مراجعة المطور.",
        }
      : language === "en"
        ? {
            requestType: "Requested Account Role",
            student: "Student",
            studentSub: "Access courses and learning tracks",
            teacher: "Teacher",
            teacherSub: "Lead classes and publish lessons",
            noteLabel: "Specialty or Request Note (Optional)",
            notePlaceholder: "e.g., Finance instructor, MBA student...",
            guestNotice:
              "New registrations enter as Guest and appear in the Developer Dashboard for role approval.",
            pendingConfirmation:
              "Account created as Guest! Your role request has been sent to the Developer Dashboard.",
          }
        : {
            requestType: "Rôle demandé à l'inscription",
            student: "Étudiant",
            studentSub: "Accès aux cours et parcours",
            teacher: "Formateur / Enseignant",
            teacherSub: "Animer des classes et cours",
            noteLabel: "Spécialité ou note (Optionnel)",
            notePlaceholder: "Ex : Formateur finance, étudiant management...",
            guestNotice:
              "À l'inscription, vous entrez en tant qu'Invité (Guest) et votre demande apparaît au Développeur pour validation.",
            pendingConfirmation:
              "Compte créé en tant qu'Invité ! Votre demande a été envoyée au tableau Développeur.",
          };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === "register") {
      if (!nom.trim() || !prenom.trim() || !username.trim() || !email.trim() || !password) {
        setErrorMessage(t("fillRequiredFields"));
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage(t("passwordMismatch"));
        return;
      }

      if (password.length < 6) {
        setErrorMessage(t("passwordMinLength"));
        return;
      }

      setIsSubmitting(true);
      const res = await register({
        firstName: prenom.trim(),
        lastName: nom.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        requestedRole,
        requestNote: requestNote.trim(),
      });
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(res.error || "Erreur lors de la création du compte.");
        return;
      }

      if (res.needsEmailConfirmation) {
        setSuccessMessage(
          language === "ar"
            ? "تم إنشاء حسابك! يرجى تأكيد بريدك الإلكتروني (أو تعطيل Confirm email في إعدادات Supabase Auth لتسجيل الدخول مباشرة)."
            : language === "en"
              ? "Account created! Please confirm your email link (or turn off 'Confirm email' in Supabase Auth → Providers → Email for instant login)."
              : "Compte créé ! Veuillez confirmer votre email (ou désactiver 'Confirm email' dans Supabase Auth → Providers → Email pour une connexion immédiate)."
        );
        return;
      }

      setSuccessMessage(`${t("accountCreated")} ${prenom.trim()} — ${roleLabels.pendingConfirmation}`);
      setTimeout(() => {
        onSuccess();
      }, 1100);
    } else {
      if (!loginIdentifier.trim() || !loginPassword) {
        setErrorMessage(t("fillCredentials"));
        return;
      }

      setIsSubmitting(true);
      const res = await login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });
      setIsSubmitting(false);

      if (!res.ok) {
        setErrorMessage(res.error || "Email ou mot de passe incorrect.");
        return;
      }

      setSuccessMessage(t("loginSuccess"));
      setTimeout(() => {
        onSuccess();
      }, 800);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-full w-full bg-slate-50/70 text-slate-900 flex flex-col justify-between overflow-y-auto pt-4 pb-12 ${
        isRTL ? "text-right" : "text-left"
      } font-sans`}
    >
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* MARIN Brand Showcase Column */}
          <div
            className={`relative lg:col-span-5 bg-gradient-to-br from-[#041d37] via-[#0a3c6b] to-[#1d8ccc] text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 ${
              isRTL ? "lg:border-l" : "lg:border-r"
            } border-sky-900/30 overflow-hidden`}
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute bottom-10 -left-16 w-72 h-72 rounded-full bg-sky-300/15 blur-3xl" />
              <svg
                className="absolute bottom-0 left-0 right-0 w-full h-24 text-white/10"
                viewBox="0 0 600 120"
                preserveAspectRatio="none"
                fill="currentColor"
              >
                <path d="M0,45 C140,95 280,10 430,60 C510,85 560,55 600,40 L600,120 L0,120 Z" />
              </svg>
            </div>

            <div className="relative z-10">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-white/95 hover:text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2 rounded-full transition-all cursor-pointer group backdrop-blur-xs"
              >
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isRTL
                      ? "group-hover:translate-x-1"
                      : "rotate-180 group-hover:-translate-x-1"
                  }`}
                />
                <span>{t("backToHome")}</span>
              </button>

              <div className="mt-8">
                <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-sky-100 border border-white/25 text-[11px] font-bold mb-3">
                  MARIN Academy
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  {t("authHeroTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-sky-100/90 mt-3 leading-relaxed font-medium">
                  {t("authHeroDesc")}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-white/15 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center text-sky-200 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <span>{t("authHighlight1")}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center text-sky-200 shrink-0">
                  <Anchor className="w-4 h-4" />
                </div>
                <span>{t("authHighlight2")}</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white text-slate-900">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-sm mb-6 mx-auto sm:mx-0">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setInfoMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#1d8ccc] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#041d37]"
                }`}
              >
                {t("signIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  setInfoMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#1d8ccc] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#041d37]"
                }`}
              >
                {t("signUp")}
              </button>
            </div>

            {!supabaseConfigured && (
              <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-2.5 text-xs text-[#041d37] font-semibold">
                <Info className="w-4 h-4 text-[#1d8ccc] shrink-0 mt-0.5" />
                <span>
                  {language === "ar"
                    ? "لتفعيل التسجيل وحفظ الحسابات عبر Supabase، يرجى إضافة SUPABASE_URL و SUPABASE_ANON_KEY في إعدادات البيئة."
                    : language === "en"
                      ? "Add SUPABASE_URL and SUPABASE_ANON_KEY in environment secrets to enable live Supabase authentication."
                      : "Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY dans les secrets d'environnement pour activer l'authentification Supabase."}
                </span>
              </div>
            )}

            {successMessage ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-[#1d8ccc] flex items-center justify-center mx-auto ring-4 ring-sky-50 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#041d37]">
                  {successMessage}
                </h3>
                {mode === "register" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessMessage(null);
                      setMode("login");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] text-white text-xs font-bold cursor-pointer"
                  >
                    {t("signIn")}
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#041d37] tracking-tight">
                    {mode === "login" ? t("loginTitle") : t("registerTitle")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {infoMessage && (
                  <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-2.5 text-xs text-[#041d37] font-semibold">
                    <Info className="w-4 h-4 text-[#1d8ccc] shrink-0" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                {mode === "register" && (
                  <>
                    {/* Requested Role Selection (Student or Teacher -> enters as Guest) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#041d37]">
                        {roleLabels.requestType} *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRequestedRole("student")}
                          className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                            requestedRole === "student"
                              ? "border-[#1d8ccc] bg-sky-50/80 ring-1 ring-[#1d8ccc]"
                              : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              requestedRole === "student"
                                ? "bg-[#1d8ccc] text-white"
                                : "bg-white text-slate-500 border border-slate-200"
                            }`}
                          >
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#041d37]">
                              {roleLabels.student}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {roleLabels.studentSub}
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRequestedRole("teacher")}
                          className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                            requestedRole === "teacher"
                              ? "border-[#1d8ccc] bg-sky-50/80 ring-1 ring-[#1d8ccc]"
                              : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              requestedRole === "teacher"
                                ? "bg-[#041d37] text-white"
                                : "bg-white text-slate-500 border border-slate-200"
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#041d37]">
                              {roleLabels.teacher}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {roleLabels.teacherSub}
                            </div>
                          </div>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {roleLabels.guestNotice}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("lastName")} *
                        </label>
                        <div className="relative">
                          <User
                            className={`w-4 h-4 text-slate-400 absolute ${
                              isRTL ? "right-3.5" : "left-3.5"
                            } top-1/2 -translate-y-1/2`}
                          />
                          <input
                            type="text"
                            required
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder={t("lastName")}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 ${
                              isRTL ? "pr-10 pl-3.5 text-right" : "pl-10 pr-3.5 text-left"
                            } text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("firstName")} *
                        </label>
                        <div className="relative">
                          <User
                            className={`w-4 h-4 text-slate-400 absolute ${
                              isRTL ? "right-3.5" : "left-3.5"
                            } top-1/2 -translate-y-1/2`}
                          />
                          <input
                            type="text"
                            required
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder={t("firstName")}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 ${
                              isRTL ? "pr-10 pl-3.5 text-right" : "pl-10 pr-3.5 text-left"
                            } text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("username")} *
                        </label>
                        <div className="relative">
                          <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="user_name"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("emailAddress")} *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#041d37]">
                        {roleLabels.noteLabel}
                      </label>
                      <input
                        type="text"
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        placeholder={roleLabels.notePlaceholder}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("password")} *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("confirmPassword")} *
                        </label>
                        <div className="relative">
                          <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mode === "login" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#041d37]">
                        {t("loginIdentifier")} *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="example@email.com"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#041d37]">
                          {t("password")} *
                        </label>
                        <button
                          type="button"
                          onClick={() => setInfoMessage(t("resetPasswordAlert"))}
                          className="text-xs text-[#1d8ccc] hover:text-[#041d37] font-bold cursor-pointer"
                        >
                          {t("forgotPassword")}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1d8ccc] focus:ring-1 focus:ring-[#1d8ccc] transition-colors text-left"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-[#1d8ccc] hover:bg-[#041d37] disabled:opacity-60 text-white font-bold py-3.5 rounded-full text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-900/15"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{mode === "login" ? t("signIn") : t("createAccount")}</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-600">
                    {mode === "login" ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setErrorMessage(null);
                        setInfoMessage(null);
                      }}
                      className="text-[#1d8ccc] hover:text-[#041d37] font-bold underline mx-1 cursor-pointer"
                    >
                      {mode === "login" ? t("signUpForFree") : t("signIn")}
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
