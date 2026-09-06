import React, { useState, useEffect } from "react";
import { User, Mail, Lock, AtSign, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Compass, Anchor } from "lucide-react";
import { UserProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface AuthPageProps {
  initialMode?: "login" | "register";
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  setUserProfile,
  onSuccess,
  onBackToHome
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { t, isRTL } = useLanguage();
  
  // Registration fields
  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

      const fullName = `${prenom.trim()} ${nom.trim()}`;
      setUserProfile((prev) => ({
        ...prev,
        name: fullName,
        email: email.trim()
      }));

      setSuccessMessage(`${t("accountCreated")} ${prenom.trim()} !`);
      setTimeout(() => {
        onSuccess();
      }, 1400);

    } else {
      // Login mode
      if (!loginIdentifier.trim() || !loginPassword) {
        setErrorMessage(t("fillCredentials"));
        return;
      }

      if (loginIdentifier.includes("@")) {
        setUserProfile((prev) => ({
          ...prev,
          email: loginIdentifier.trim()
        }));
      }

      setSuccessMessage(t("loginSuccess"));
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div className={`min-h-full w-full bg-white text-slate-900 flex flex-col justify-between overflow-y-auto pt-[86px] ${isRTL ? "text-right" : "text-left"}`}>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Hero / Brand Showcase Column */}
          <div className="relative lg:col-span-5 bg-slate-50 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 overflow-hidden text-slate-900">
            {/* Background Image / Ambient Overlay */}
            <div className="absolute inset-0 z-0 opacity-15">
              <img
                src="/back1.png"
                alt="Maritime Academy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white/40"></div>
            </div>

            {/* Top Back Navigation */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer group"
              >
                <ArrowLeft className={`w-3.5 h-3.5 transition-transform ${isRTL ? "rotate-180 group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`} />
                <span>{t("backToHome")}</span>
              </button>

              <div className="mt-8">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {t("academyHeadline")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-medium">
                  {t("academySubheadline")}
                </p>
              </div>
            </div>

            {/* Bottom Highlights */}
            <div className="relative z-10 pt-8 mt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <span>Modules certifiés & cursus d'excellence</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Anchor className="w-4 h-4" />
                </div>
                <span>Suivi de progression et validation d'acquis</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white text-slate-900">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-sm mb-8">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t("signIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t("signUp")}
              </button>
            </div>

            {/* Success Notification */}
            {successMessage ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{successMessage}</h3>
                <p className="text-xs text-slate-500">Chargement en cours...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {mode === "login" ? t("loginTitle") : t("registerTitle")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ================= REGISTER FIELDS ================= */}
                {mode === "register" && (
                  <>
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{t("lastName")} *</label>
                        <div className="relative">
                          <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                          <input
                            type="text"
                            required
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder={t("lastName")}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{t("firstName")} *</label>
                        <div className="relative">
                          <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                          <input
                            type="text"
                            required
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder={t("firstName")}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nom d'utilisateur */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t("username")} *</label>
                      <div className="relative">
                        <AtSign className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="capitaine123"
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t("emailAddress")} *</label>
                      <div className="relative">
                        <Mail className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="marin@marinacademy.pro"
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                        />
                      </div>
                    </div>

                    {/* Mot de passe et Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{t("password")} *</label>
                        <div className="relative">
                          <Lock className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">{t("confirmPassword")} *</label>
                        <div className="relative">
                          <ShieldCheck className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ================= LOGIN FIELDS ================= */}
                {mode === "login" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">{t("loginIdentifier")}</label>
                      <div className="relative">
                        <User className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="marin@marinacademy.pro"
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">{t("password")}</label>
                        <button
                          type="button"
                          onClick={() => alert(t("resetPasswordAlert"))}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                        >
                          {t("forgotPassword")}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${isRTL ? "pr-10 pl-3.5" : "pl-10 pr-3.5"}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{mode === "login" ? t("signIn") : t("createAccount")}</span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                </button>

                {/* Footer Switcher */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-600">
                    {mode === "login" ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setErrorMessage(null);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold underline ml-1 cursor-pointer"
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

