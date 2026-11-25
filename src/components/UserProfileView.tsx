import React, { useState, useEffect } from "react";
import {
  Award,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  Mail,
  Briefcase,
  Edit3,
  ShieldCheck,
  GraduationCap,
  Target,
  PlayCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  LogOut,
  LogIn,
  Loader2,
  AlertCircle,
  AtSign,
  Send,
  Layers,
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, UserRole } from "../types";
import { VideoCourse } from "../data/videoCourses";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { LandingFooter } from "./LandingFooter";

interface UserProfileViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  courses: VideoCourse[];
  selectCourse: (course: VideoCourse) => void;
  setActiveTab: (tab: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  courses,
  selectCourse,
  setActiveTab,
}) => {
  const { language, isRTL } = useLanguage();
  const {
    authenticated,
    isDeveloper,
    updateProfile,
    submitRoleRequest,
    logout,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: userProfile.name,
    username: userProfile.username || "",
    title: userProfile.title,
    activeDomain: userProfile.activeDomain || "المالية الذكية",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guest Role Request state
  const [desiredRole, setDesiredRole] = useState<"student" | "teacher">(
    userProfile.requestedRole === "teacher" ? "teacher" : "student"
  );
  const [requestNote, setRequestNote] = useState<string>(userProfile.requestNote || "");
  const [requestingRole, setRequestingRole] = useState<boolean>(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: userProfile.name,
      username: userProfile.username || "",
      title: userProfile.title,
      activeDomain: userProfile.activeDomain || "المالية الذكية",
    });
    setDesiredRole(userProfile.requestedRole === "teacher" ? "teacher" : "student");
    setRequestNote(userProfile.requestNote || "");
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    const res = await updateProfile({
      name: formData.name,
      username: formData.username || undefined,
      title: formData.title,
      activeDomain: formData.activeDomain,
    });
    setIsSaving(false);

    if (!res.ok) {
      setSaveError(res.error || "Erreur lors de la sauvegarde.");
      return;
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRoleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestingRole(true);
    setRequestMsg(null);
    const res = await submitRoleRequest(
      desiredRole,
      requestNote,
      userProfile.activeDomain || undefined
    );
    setRequestingRole(false);
    if (res.ok) {
      setRequestMsg(copy.requestSentMsg);
    } else {
      setSaveError(res.error || "Erreur");
    }
  };

  const level = Math.floor(userProfile.xp / 300) + 1;
  const progressToNextLevel = ((userProfile.xp % 300) / 300) * 100;
  const currentRole: UserRole = userProfile.role || "guest";

  const copy = useLanguageCopy(language);

  const badges = [
    {
      icon: GraduationCap,
      title: copy.badge1Title,
      desc: copy.badge1Desc,
      bg: "bg-[#041d37]",
    },
    {
      icon: Flame,
      title: copy.badge2Title,
      desc: copy.badge2Desc,
      bg: "bg-[#1d8ccc]",
    },
    {
      icon: Zap,
      title: copy.badge3Title,
      desc: copy.badge3Desc,
      bg: "bg-[#0b4f7c]",
    },
    {
      icon: Target,
      title: copy.badge4Title,
      desc: copy.badge4Desc,
      bg: "bg-[#1d8ccc]",
    },
  ];

  return (
    <div
      className="flex-1 bg-white text-slate-900 w-full flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex-1 w-full">
        {/* 1. MARIN Blue Wave Profile Banner */}
        <section className="relative overflow-hidden bg-[#1d8ccc] text-white pt-10 sm:pt-14 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 right-1/4 w-[500px] h-[280px] bg-white/20 rounded-full blur-3xl" />
            <div className="absolute top-10 left-10 w-[380px] h-[240px] bg-sky-200/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{copy.memberSpace}</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {copy.profileTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="px-4 py-2 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs text-xs sm:text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span>
                  {copy.level} {level} • {userProfile.xp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Animated 3-Layer Ocean Wave Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none -mb-[1px]">
            <svg
              className="relative block w-full h-12 sm:h-16 text-white"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <motion.path
                initial={{
                  d: "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                    "M0,18 C200,10 380,92 560,32 C760,2 960,88 1200,52 L1200,130 L0,130 Z",
                    "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                fill="#ffffff"
                opacity="0.25"
              />
              <motion.path
                initial={{
                  d: "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                    "M0,32 C190,98 370,14 550,68 C740,108 950,16 1200,28 L1200,130 L0,130 Z",
                    "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
                fill="#ffffff"
                opacity="0.45"
              />
              <motion.path
                initial={{
                  d: "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                    "M0,64 C180,18 380,104 560,42 C740,6 940,94 1200,62 L1200,130 L0,130 Z",
                    "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* 2. Main Profile Workspace Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 pb-12 space-y-8 relative z-10">
          {/* Unauthenticated Visitor Banner */}
          {!authenticated && (
            <div className="bg-sky-50 border border-sky-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <p className="text-sm font-black text-[#041d37]">{copy.guestTitle}</p>
                <p className="text-xs text-slate-600 font-medium">{copy.guestDesc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{copy.signInAction}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-[#1d8ccc] text-[#041d37] text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>{copy.registerAction}</span>
                </button>
              </div>
            </div>
          )}

          {/* Authenticated Guest Pending/Rejected Request Card */}
          {authenticated && currentRole === "guest" && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {userProfile.requestStatus === "rejected"
                        ? copy.requestRejectedTitle
                        : copy.requestPendingTitle}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#041d37]">
                    {copy.requestedRolePrefix}{" "}
                    <span className="text-[#1d8ccc]">
                      {copy.roleLabels[userProfile.requestedRole || "student"]}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600">{copy.guestApprovalHint}</p>
                </div>
              </div>

              <form
                onSubmit={handleRoleRequestSubmit}
                className="pt-3 border-t border-amber-200/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-[#041d37]">
                    {copy.changeRequestRole}
                  </label>
                  <select
                    value={desiredRole}
                    onChange={(e) =>
                      setDesiredRole(e.target.value as "student" | "teacher")
                    }
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                  >
                    <option value="student">{copy.roleLabels.student}</option>
                    <option value="teacher">{copy.roleLabels.teacher}</option>
                  </select>
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-[#041d37]">
                    {copy.requestNoteLabel}
                  </label>
                  <input
                    type="text"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder={copy.requestNotePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={requestingRole}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#041d37] hover:bg-[#1d8ccc] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {requestingRole ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{copy.updateRequestBtn}</span>
                  </button>
                </div>
              </form>

              {requestMsg && (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{requestMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Profile Identity Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
              <svg
                className="absolute bottom-0 left-0 w-full h-24 text-sky-50"
                viewBox="0 0 800 100"
                fill="currentColor"
                preserveAspectRatio="none"
              >
                <path d="M0,45 C220,95 520,10 800,55 L800,100 L0,100 Z" />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#041d37] to-[#1d8ccc] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-blue-950/20 shrink-0">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <div className={`space-y-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#041d37] tracking-tight">
                      {userProfile.name}
                    </h2>
                    <span className="bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>
                        {authenticated
                          ? copy.roleLabels[currentRole]
                          : copy.guestBadge}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#1d8ccc] shrink-0" />
                    <span>{userProfile.title}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{userProfile.email}</span>
                    </span>
                    {userProfile.username && (
                      <span
                        className="flex items-center gap-1 font-semibold text-[#1d8ccc]"
                        dir="ltr"
                      >
                        <AtSign className="w-3.5 h-3.5 shrink-0" />
                        <span>{userProfile.username}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {isDeveloper && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("developer")}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{copy.openDevDashboard}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#041d37] hover:bg-[#1d8ccc] text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? copy.closeEdit : copy.editProfile}</span>
                </button>
                {authenticated && (
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setActiveTab("home");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{copy.signOutAction}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Edit Form Inline */}
            {isEditing && (
              <form
                onSubmit={handleSave}
                className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10"
              >
                {saveError && (
                  <div className="sm:col-span-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#041d37]">{copy.fullName}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-[#041d37] focus:ring-2 focus:ring-[#1d8ccc] focus:border-[#1d8ccc] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#041d37]">
                    {copy.usernameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="user_name"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-[#041d37] focus:ring-2 focus:ring-[#1d8ccc] focus:border-[#1d8ccc] focus:outline-none text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#041d37]">{copy.roleLabel}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-[#041d37] focus:ring-2 focus:ring-[#1d8ccc] focus:border-[#1d8ccc] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#041d37]">
                    {copy.domainLabel}
                  </label>
                  <select
                    value={formData.activeDomain}
                    onChange={(e) =>
                      setFormData({ ...formData, activeDomain: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-[#041d37] focus:ring-2 focus:ring-[#1d8ccc] focus:border-[#1d8ccc] focus:outline-none"
                  >
                    <option value="المالية الذكية">المالية الذكية</option>
                    <option value="التسويق الاستراتيجي">التسويق الاستراتيجي</option>
                    <option value="نظام الشركة">نظام الشركة</option>
                    <option value="Comptabilité & Finance">Comptabilité & Finance</option>
                    <option value="Management & Leadership">Management & Leadership</option>
                    <option value="Agence de Voyage & Tourisme">
                      Agence de Voyage & Tourisme
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {copy.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1d8ccc] hover:bg-[#0062c4] disabled:opacity-60 text-white rounded-full text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{copy.saveChanges}</span>
                  </button>
                </div>
              </form>
            )}

            {saveSuccess && (
              <div className="mt-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-[#041d37] text-xs font-bold flex items-center gap-2 relative z-10">
                <CheckCircle2 className="w-4 h-4 text-[#1d8ccc] shrink-0" />
                <span>{copy.saveSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {copy.activeStreak}
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">
                {userProfile.streak} {copy.days}
              </p>
              <p className="text-xs text-slate-500 font-medium">{copy.streakSub}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {copy.validatedModules}
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#1d8ccc]">
                {userProfile.completedModules.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">{copy.modulesSub}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {copy.levelProgress}
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#041d37] text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl sm:text-3xl font-black text-[#041d37]">
                  {copy.level} {level}
                </p>
                <span className="text-xs font-bold text-[#1d8ccc]">{userProfile.xp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${Math.min(100, Math.max(8, progressToNextLevel))}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#1d8ccc] to-[#041d37]"
                />
              </div>
            </div>
          </div>

          {/* Badges & Distinctions */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg space-y-5">
            <h2 className="font-black text-base sm:text-lg text-[#041d37] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span>{copy.badgesHeading}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 hover:bg-sky-50 border border-sky-100 flex flex-col items-center text-center space-y-2.5 transition-colors"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl ${badge.bg} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-black text-xs sm:text-sm text-[#041d37]">
                      {badge.title}
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current & Enrolled Courses */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-black text-base sm:text-lg text-[#041d37] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>{copy.yourCourses}</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("academy")}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1d8ccc] hover:text-[#041d37] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>{copy.exploreMore}</span>
                <ArrowLeft className={`w-4 h-4 ${!isRTL ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 3).map((course) => {
                const useFallbackCover =
                  !course.thumbnail ||
                  course.thumbnail === "/instructor.jpg" ||
                  failedThumbnails[course.id];

                return (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className="border border-slate-200/90 rounded-3xl overflow-hidden hover:border-[#1d8ccc] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between bg-white"
                  >
                    <div className="relative h-36 bg-gradient-to-br from-[#041d37] via-[#0b355e] to-[#1d8ccc] overflow-hidden">
                      {!useFallbackCover ? (
                        <>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            onError={() =>
                              setFailedThumbnails((prev) => ({ ...prev, [course.id]: true }))
                            }
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#041d37]/75 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-14 h-14 text-white/15" />
                        </div>
                      )}

                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/95 text-[#041d37] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        <Clock className="w-3 h-3 text-[#1d8ccc]" />
                        <span>{course.duration}</span>
                      </span>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/95 text-[#1d8ccc] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#1d8ccc] group-hover:text-white transition-all">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none -mb-[1px]">
                        <svg
                          className="w-full h-6 block text-white"
                          viewBox="0 0 400 40"
                          fill="currentColor"
                          preserveAspectRatio="none"
                        >
                          <path d="M0,35 C120,5 260,38 400,12 L400,40 L0,40 Z" />
                        </svg>
                      </div>
                    </div>

                    <div className={`p-4 space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[10px] font-bold">
                        {course.domain}
                      </span>
                      <h3 className="font-black text-xs sm:text-sm text-[#041d37] line-clamp-2 group-hover:text-[#1d8ccc] transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        {course.instructor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Matching Wave Footer */}
      <LandingFooter />
    </div>
  );
};

function useLanguageCopy(language: "fr" | "ar" | "en") {
  if (language === "ar") {
    return {
      memberSpace: "فضاء المتدرب",
      profileTitle: "الملف الشخصي والتقدم",
      level: "المستوى",
      guestBadge: "جلسة زائر",
      guestTitle: "سجّل الدخول لحفظ تقدمك وشهاداتك في حسابك الشخصي",
      guestDesc: "سيتم حفظ الدروس المكتملة ونقاط الخبرة (XP) مباشرة في قاعدة البيانات.",
      signInAction: "تسجيل الدخول",
      registerAction: "إنشاء حساب",
      signOutAction: "خروج",
      openDevDashboard: "لوحة المطور",
      requestPendingTitle: "حساب زائر • طلبك قيد المراجعة",
      requestRejectedTitle: "حساب زائر • لم يتم قبول الطلب بعد",
      requestedRolePrefix: "الدور المطلوب:",
      guestApprovalHint:
        "يظهر طلبك في لوحة تحكم المطور لاعتماد دورك (طالب أو أستاذ) ومنحك الصلاحيات الكاملة.",
      changeRequestRole: "تغيير الدور المطلوب",
      requestNoteLabel: "ملاحظة أو تخصص",
      requestNotePlaceholder: "أضف ملاحظة للمطور...",
      updateRequestBtn: "إرسال الطلب",
      requestSentMsg: "تم إرسال طلبك بنجاح إلى لوحة المطور.",
      editProfile: "تعديل الملف",
      closeEdit: "إغلاق التعديل",
      fullName: "الاسم الكامل",
      usernameLabel: "اسم المستخدم",
      roleLabel: "المسمى الوظيفي / الهدف",
      domainLabel: "التخصص المفضل",
      cancel: "إلغاء",
      saveChanges: "حفظ التغييرات",
      saveSuccessMsg: "تم تحديث الملف الشخصي بنجاح في قاعدة البيانات.",
      activeStreak: "سلسلة الالتزام",
      days: "أيام",
      streakSub: "انتظام التعلم اليومي",
      validatedModules: "الوحدات المنجزة",
      modulesSub: "ضمن المسارات التدريبية",
      levelProgress: "تقدم المستوى",
      badgesHeading: "الأوسمة وإنجازات MARIN Academy",
      badge1Title: "الخطوة الأولى",
      badge1Desc: "إتمام أول درس بنجاح",
      badge2Title: "مواظبة 5 أيام",
      badge2Desc: "سلسلة تعلم لـ 5 أيام متواصلة",
      badge3Title: "خبير +500 XP",
      badge3Desc: "تحصيل أكثر من 500 نقطة خبرة",
      badge4Title: "تعلم مستمر",
      badge4Desc: "مواصلة إنجاز الوحدات بانتظام",
      yourCourses: "دوراتك التدريبية الحالية",
      exploreMore: "استكشاف المزيد من الدورات",
      roleLabels: {
        guest: "زائر (Guest)",
        student: "طالب (Student)",
        teacher: "أستاذ (Teacher)",
        admin: "مدير (Admin)",
        developer: "مطور (Developer)",
      } as Record<UserRole, string>,
    };
  }
  if (language === "en") {
    return {
      memberSpace: "Learner Workspace",
      profileTitle: "Profile & Progress",
      level: "Level",
      guestBadge: "Guest Session",
      guestTitle: "Sign in to save your profile and course progress",
      guestDesc: "Completed lessons and XP are saved directly to your Supabase profile.",
      signInAction: "Sign In",
      registerAction: "Create Account",
      signOutAction: "Sign Out",
      openDevDashboard: "Developer Dashboard",
      requestPendingTitle: "Guest Account • Approval Pending",
      requestRejectedTitle: "Guest Account • Request Declined",
      requestedRolePrefix: "Requested role:",
      guestApprovalHint:
        "Your registration request is visible on the Developer Dashboard for role approval.",
      changeRequestRole: "Requested Role",
      requestNoteLabel: "Note / Specialty",
      requestNotePlaceholder: "Add a short note for the developer...",
      updateRequestBtn: "Send Request",
      requestSentMsg: "Your role request has been updated.",
      editProfile: "Edit Profile",
      closeEdit: "Close Editor",
      fullName: "Full Name",
      usernameLabel: "Username",
      roleLabel: "Title / Target Role",
      domainLabel: "Preferred Track",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saveSuccessMsg: "Profile saved successfully.",
      activeStreak: "Active Streak",
      days: "Days",
      streakSub: "Consistent daily learning",
      validatedModules: "Completed Modules",
      modulesSub: "Across enrolled tracks",
      levelProgress: "Level Progress",
      badgesHeading: "MARIN Academy Badges & Distinctions",
      badge1Title: "First Step",
      badge1Desc: "First lesson completed",
      badge2Title: "5-Day Streak",
      badge2Desc: "5 consecutive days of learning",
      badge3Title: "Expert 500+ XP",
      badge3Desc: "Over 500 experience points earned",
      badge4Title: "Continuous Growth",
      badge4Desc: "Consistent module completion",
      yourCourses: "Your Active Courses",
      exploreMore: "Explore more courses",
      roleLabels: {
        guest: "Guest",
        student: "Student",
        teacher: "Teacher",
        admin: "Admin",
        developer: "Developer",
      } as Record<UserRole, string>,
    };
  }
  return {
    memberSpace: "Espace Apprenant",
    profileTitle: "Profil & Progression",
    level: "Niveau",
    guestBadge: "Session Invité",
    guestTitle: "Connectez-vous pour enregistrer votre progression",
    guestDesc: "Vos modules validés et points XP sont sauvegardés dans votre profil Supabase.",
    signInAction: "Se connecter",
    registerAction: "Créer un compte",
    signOutAction: "Déconnexion",
    openDevDashboard: "Tableau Développeur",
    requestPendingTitle: "Compte Invité • En attente de validation",
    requestRejectedTitle: "Compte Invité • Demande refusée",
    requestedRolePrefix: "Rôle demandé :",
    guestApprovalHint:
      "Votre demande apparaît dans le tableau de bord du Développeur pour attribution de votre rôle.",
    changeRequestRole: "Rôle souhaité",
    requestNoteLabel: "Note / Spécialité",
    requestNotePlaceholder: "Ajouter une précision pour le développeur...",
    updateRequestBtn: "Envoyer la demande",
    requestSentMsg: "Votre demande a été mise à jour.",
    editProfile: "Modifier le profil",
    closeEdit: "Fermer l'édition",
    fullName: "Nom complet",
    usernameLabel: "Nom d'utilisateur",
    roleLabel: "Titre / Poste visé",
    domainLabel: "Domaine de prédilection",
    cancel: "Annuler",
    saveChanges: "Enregistrer les modifications",
    saveSuccessMsg: "Profil mis à jour avec succès.",
    activeStreak: "Série Active",
    days: "Jours",
    streakSub: "Régularité d'apprentissage",
    validatedModules: "Modules Validés",
    modulesSub: "Sur les parcours suivis",
    levelProgress: "Progression Niveau",
    badgesHeading: "Badges & Distinctions MARIN Academy",
    badge1Title: "Premier Pas",
    badge1Desc: "Première leçon complétée",
    badge2Title: "Assiduité 5j",
    badge2Desc: "Série de 5 jours consécutifs",
    badge3Title: "Expert 500+ XP",
    badge3Desc: "Cumul de plus de 500 points",
    badge4Title: "Apprentissage Continu",
    badge4Desc: "Validation assidue des modules",
    yourCourses: "Vos Formations en Cours",
    exploreMore: "Explorer d'autres cours",
    roleLabels: {
      guest: "Invité (Guest)",
      student: "Étudiant (Student)",
      teacher: "Formateur (Teacher)",
      admin: "Admin",
      developer: "Développeur",
    } as Record<UserRole, string>,
  };
}
