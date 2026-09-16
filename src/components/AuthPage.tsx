import React, { useState, useEffect } from "react";
import { User, Mail, Lock, AtSign, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Compass, Anchor } from "lucide-react";
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
  setUserProfile,
  onSuccess,
  onBackToHome,
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
        setErrorMessage("يرجى ملء جميع الحقول الإلزامية (*).");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("كلمتا المرور غير متطابقتين.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.");
        return;
      }

      const fullName = `${prenom.trim()} ${nom.trim()}`;
      setUserProfile((prev) => ({
        ...prev,
        name: fullName,
        email: email.trim(),
      }));

      setSuccessMessage(`تم إنشاء الحساب بنجاح! مرحباً بك ${prenom.trim()}`);
      setTimeout(() => {
        onSuccess();
      }, 1400);

    } else {
      // Login mode
      if (!loginIdentifier.trim() || !loginPassword) {
        setErrorMessage("يرجى إدخال اسم المستخدم/البريد الإلكتروني وكلمة المرور.");
        return;
      }

      if (loginIdentifier.includes("@")) {
        setUserProfile((prev) => ({
          ...prev,
          email: loginIdentifier.trim(),
        }));
      }

      setSuccessMessage("تم تسجيل الدخول بنجاح! مرحباً بعودتك.");
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }
  };

  return (
    <div dir="rtl" className="min-h-full w-full bg-white text-slate-900 flex flex-col justify-between overflow-y-auto pt-[86px] text-right font-sans">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* Right/Side Hero Brand Showcase Column */}
          <div className="relative lg:col-span-5 bg-[#071d37] text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-700/50 overflow-hidden">
            {/* Ambient Overlay */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/back1.png"
                alt="MARIN Academy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#071d37]/80"></div>
            </div>

            {/* Top Back Navigation */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer group backdrop-blur-xs"
              >
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                <span>العودة للرئيسية</span>
              </button>

              <div className="mt-8">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold mb-3">
                  MARIN Academy
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  التميز في التدريب والتطوير المهني
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed font-medium">
                  انضم إلى نخبة رواد الأعمال، المدراء والمهنيين لتطوير مهاراتك من خلال برامج ودورات تدريبية احترافية عالية التأثير.
                </p>
              </div>
            </div>

            {/* Bottom Highlights */}
            <div className="relative z-10 pt-8 mt-6 border-t border-white/15 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-slate-200 font-medium">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-sky-400 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <span>برامج تدريبية معتمدة ومناهج تعليمية متميزة</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 font-medium">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Anchor className="w-4 h-4" />
                </div>
                <span>متابعة دقيقة لمستوى التقدم وشهادات إتمام مهنية</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white text-slate-900">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-sm mb-8 mx-auto sm:mx-0">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#071d37] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                تسجيل الدخول
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
                    ? "bg-[#071d37] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                إنشاء حساب
              </button>
            </div>

            {/* Success Notification */}
            {successMessage ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{successMessage}</h3>
                <p className="text-xs text-slate-500">جاري التحميل...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {mode === "login" ? "تسجيل الدخول إلى حسابك" : "إنشاء حساب جديد"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {mode === "login" 
                      ? "أدخل بيانات حسابك للمتابعة في دوراتك التدريبية." 
                      : "أكمل النموذج التالي لإنشاء حسابك في أكاديمية MARIN."}
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-semibold animate-in fade-in">
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
                        <label className="text-xs font-bold text-slate-700">اللقب (الاسم العائلي) *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder="اللقب"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">الاسم الأول *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="الاسم"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nom d'utilisateur */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">اسم المستخدم *</label>
                      <div className="relative">
                        <AtSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="user_name"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
                        />
                      </div>
                    </div>

                    {/* Mot de passe et Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">كلمة المرور *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">تأكيد كلمة المرور *</label>
                        <div className="relative">
                          <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            dir="ltr"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
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
                      <label className="text-xs font-bold text-slate-700">البريد الإلكتروني أو اسم المستخدم *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="example@email.com أو اسم المستخدم"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">كلمة المرور *</label>
                        <button
                          type="button"
                          onClick={() => alert("سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.")}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#071d37] focus:ring-1 focus:ring-[#071d37] transition-colors text-right"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full mt-4 bg-[#071d37] hover:bg-[#0c2f57] text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{mode === "login" ? "تسجيل الدخول" : "إنشاء حسابي"}</span>
                </button>

                {/* Footer Switcher */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-slate-600">
                    {mode === "login" ? "ليس لديك حساب بعد؟" : "هل لديك حساب بالفعل؟"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setErrorMessage(null);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-bold underline mr-1 cursor-pointer"
                    >
                      {mode === "login" ? "إنشاء حساب مجاناً" : "تسجيل الدخول"}
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
