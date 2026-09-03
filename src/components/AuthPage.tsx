import React, { useState, useEffect } from "react";
import { User, Mail, Lock, AtSign, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Compass, Anchor, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface AuthPageProps {
  initialMode?: "login" | "register";
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = "login",
  userProfile,
  setUserProfile,
  onSuccess,
  onBackToHome
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  
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
        setErrorMessage("Veuillez remplir tous les champs obligatoires.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Les mots de passe ne correspondent pas.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Le mot de passe doit comporter au moins 6 caractères.");
        return;
      }

      const fullName = `${prenom.trim()} ${nom.trim()}`;
      setUserProfile((prev) => ({
        ...prev,
        name: fullName,
        email: email.trim()
      }));

      setSuccessMessage(`Bienvenue à bord, ${prenom.trim()} ! Votre compte a été créé avec succès.`);
      setTimeout(() => {
        onSuccess();
      }, 1400);

    } else {
      // Login mode
      if (!loginIdentifier.trim() || !loginPassword) {
        setErrorMessage("Veuillez renseigner vos identifiants et mot de passe.");
        return;
      }

      if (loginIdentifier.includes("@")) {
        setUserProfile((prev) => ({
          ...prev,
          email: loginIdentifier.trim()
        }));
      }

      setSuccessMessage("Connexion réussie ! Redirection en cours...");
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div className="min-h-full w-full bg-slate-950 text-white flex flex-col justify-between overflow-y-auto pt-[86px]">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Left Hero / Brand Showcase Column */}
          <div className="relative lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
            {/* Background Image / Ambient Blur */}
            <div className="absolute inset-0 z-0 opacity-25">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
                alt="Maritime Academy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
            </div>

            {/* Top Back Navigation */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Retour à l'accueil</span>
              </button>

              <div className="mt-8">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  L'excellence des formations maritimes et professionnelles
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Accédez à des centaines d'heures de masterclasses, des simulations radar interactives, des modules STCW et des certifications reconnues.
                </p>
              </div>
            </div>

            {/* Bottom Highlights */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                  <Compass className="w-4 h-4" />
                </div>
                <span>Modules certifiés par des experts du secteur</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                  <Anchor className="w-4 h-4" />
                </div>
                <span>Suivi de progression et validation d'acquis</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/60">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-950/70 p-1 rounded-2xl border border-white/10 max-w-sm mb-8">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Se connecter
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                S'inscrire
              </button>
            </div>

            {/* Success Notification */}
            {successMessage ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10 shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">{successMessage}</h3>
                <p className="text-xs text-slate-400">Préparation de votre passerelle d'apprentissage...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {mode === "login" ? "Connexion à votre espace" : "Créer un compte MARIN Academy"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {mode === "login"
                      ? "Entrez vos identifiants pour continuer votre formation."
                      : "Complétez le formulaire ci-dessous pour créer votre profil marin."}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300 font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ================= REGISTER FIELDS ================= */}
                {mode === "register" && (
                  <>
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Nom *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder="Dupont"
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Prénom *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="Alexandre"
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nom d'utilisateur */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Nom d'utilisateur *</label>
                      <div className="relative">
                        <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="alex_capitaine"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Adresse Email *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alexandre.dupont@exemple.com"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Mot de passe et Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Mot de passe *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Confirmation de mot de passe *</label>
                        <div className="relative">
                          <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                      <label className="text-xs font-semibold text-slate-300">Email ou Nom d'utilisateur</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="nom@exemple.com ou username"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Mot de passe</label>
                        <button
                          type="button"
                          onClick={() => alert("Un lien de réinitialisation vous sera envoyé par email.")}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{mode === "login" ? "Se connecter" : "Créer mon compte"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Footer Switcher */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-400">
                    {mode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setErrorMessage(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold underline ml-1 cursor-pointer"
                    >
                      {mode === "login" ? "S'inscrire gratuitement" : "Se connecter"}
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
