import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Search,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  MessageSquare,
  ShieldCheck,
  DoorOpen,
  GraduationCap,
  Briefcase,
  Mail,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Classroom } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { LandingFooter } from "./LandingFooter";

interface StudentDashboardProps {
  onBackToHome: () => void;
  onExploreCourses?: () => void;
}

const DOMAINS = [
  "Tous les domaines",
  "المالية الذكية",
  "التسويق الاستراتيجي",
  "نظام الشركة",
  "Comptabilité & Finance",
  "Management & Leadership",
  "Agence de Voyage & Tourisme",
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onBackToHome,
}) => {
  const { language, isRTL } = useLanguage();
  const { profile, authenticated, getAuthHeaders } = useAuth();
  const copy = useStudentCopy(language);

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [myClasses, setMyClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("Tous les domaines");
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending">("all");

  // Request Access Modal
  const [requestModalClass, setRequestModalClass] = useState<Classroom | null>(null);
  const [requestMessage, setRequestMessage] = useState<string>("");
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);

  // Active Entered Classroom Workspace Modal
  const [enteredClass, setEnteredClass] = useState<Classroom | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchStudentClasses = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/student/classes", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.loadError);
        return;
      }

      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setMyClasses(Array.isArray(data.myClasses) ? data.myClasses : []);
    } catch {
      setErrorMsg(copy.loadError);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [getAuthHeaders, copy.loadError]);

  useEffect(() => {
    fetchStudentClasses();
  }, [fetchStudentClasses]);

  // Real-Time WebSocket sync
  const { isConnected } = useRealtimeSync({
    onEvent: (event) => {
      if (
        event.type === "access:decided" ||
        event.type === "access:requested" ||
        event.type === "class:created" ||
        event.type === "class:updated" ||
        event.type === "class:deleted" ||
        event.type === "poll:tick"
      ) {
        // Refresh quietly in real-time
        fetchStudentClasses(true);
      }
    },
  });

  const handleSendAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalClass) return;
    setSendingRequest(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/student/classes/${encodeURIComponent(requestModalClass.id)}/request-access`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: requestMessage }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }

      showToast(copy.requestSentSuccess);
      setRequestModalClass(null);
      setRequestMessage("");
      await fetchStudentClasses(true);
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleCancelAccessRequest = async (classId: string) => {
    if (!window.confirm(copy.confirmCancelRequest)) return;
    try {
      const res = await fetch(
        `/api/student/classes/${encodeURIComponent(classId)}/request-access`,
        {
          method: "DELETE",
          credentials: "include",
          headers: getAuthHeaders(),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }

      showToast(copy.requestCancelled);
      await fetchStudentClasses(true);
    } catch {
      setErrorMsg(copy.actionError);
    }
  };

  // Filter classes according to search query, domain, and active tab
  const filteredClasses = classes.filter((cls) => {
    // Tab filter
    if (activeTab === "approved" && cls.accessStatus !== "approved") return false;
    if (activeTab === "pending" && cls.accessStatus !== "pending") return false;

    // Domain filter
    if (
      selectedDomain !== "Tous les domaines" &&
      cls.domain !== selectedDomain
    ) {
      return false;
    }

    // Search query: searches teacher name, teacher email, class title, description
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      cls.title.toLowerCase().includes(q) ||
      cls.domain.toLowerCase().includes(q) ||
      cls.teacherName.toLowerCase().includes(q) ||
      cls.teacherEmail.toLowerCase().includes(q) ||
      (cls.description && cls.description.toLowerCase().includes(q))
    );
  });

  const approvedClassesCount = classes.filter((c) => c.accessStatus === "approved").length;
  const pendingClassesCount = classes.filter((c) => c.accessStatus === "pending").length;

  return (
    <div
      className="flex-1 bg-slate-50 text-slate-900 min-h-screen flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#041d37] text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 border border-sky-400/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Student Profile & Overview Card */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Student Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1d8ccc] to-[#041d37] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#041d37]">
                    {profile.name || copy.defaultStudentName}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{copy.roleStudentBadge}</span>
                  </span>
                  {/* Real-time Indicator */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    <span>{isConnected ? copy.liveSync : copy.syncing}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#1d8ccc]" />
                  <span>
                    {profile.xp || 0} XP • {copy.levelLabel} {Math.floor((profile.xp || 0) / 300) + 1}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{profile.activeDomain || "المالية الذكية"}</span>
                </p>
                <div className="text-xs text-slate-400 flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            {/* Header Right Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchStudentClasses(false)}
                disabled={loading}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title={copy.refresh}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Stat Overview Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab("approved")}
            className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === "approved"
                ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-300/40"
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {copy.myApprovedClasses}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                {approvedClassesCount}
              </p>
              <p className="text-[11px] text-emerald-900/70">{copy.accessGrantedSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("pending")}
            className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === "pending"
                ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-300/40"
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {copy.pendingRequests}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-amber-700">
                {pendingClassesCount}
              </p>
              <p className="text-[11px] text-amber-900/70">{copy.pendingRequestsSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("all")}
            className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeTab === "all"
                ? "bg-sky-50/90 border-sky-300 ring-2 ring-sky-300/40"
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {copy.allAvailableClasses}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">
                {classes.length}
              </p>
              <p className="text-[11px] text-slate-400">{copy.allAvailableClassesSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search, Filter Toolbar & Tabs */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-[#041d37] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {copy.tabExploreAll} ({classes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("approved")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "approved"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {copy.tabMyClasses} ({approvedClassesCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "pending"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {copy.tabPending} ({pendingClassesCount})
              </button>
            </div>

            {/* Domain filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                {copy.filterByDomain}:
              </span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unified Search Bar: Searches Teacher name OR Class name */}
          <div className="relative">
            <Search
              className={`w-4 h-4 text-slate-400 absolute ${
                isRTL ? "right-3.5" : "left-3.5"
              } top-1/2 -translate-y-1/2`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              } text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8ccc] focus:bg-white transition-all`}
            />
          </div>
        </section>

        {/* Classes Grid */}
        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#1d8ccc]" />
              <span className="text-sm font-bold">{copy.loadingClasses}</span>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-sky-50 text-[#1d8ccc] mx-auto flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#041d37]">{copy.noClassesFoundTitle}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">{copy.noClassesFoundSub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClasses.map((cls) => {
                const isApproved = cls.accessStatus === "approved";
                const isPending = cls.accessStatus === "pending";
                const isRejected = cls.accessStatus === "rejected";

                return (
                  <div
                    key={cls.id}
                    className={`bg-white rounded-3xl border shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                      isApproved
                        ? "border-emerald-300 ring-1 ring-emerald-200 hover:shadow-md"
                        : isPending
                          ? "border-amber-300 ring-1 ring-amber-200 hover:shadow-md"
                          : "border-slate-200/90 hover:border-[#1d8ccc] hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Domain and Access Status Badge */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                          {cls.domain}
                        </span>

                        {/* Real Status Badge */}
                        {isApproved ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{copy.statusAccessGranted}</span>
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{copy.statusPendingTeacher}</span>
                          </span>
                        ) : isRejected ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{copy.statusAccessDenied}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                            {copy.statusOpen}
                          </span>
                        )}
                      </div>

                      {/* Class Title */}
                      <h2 className="text-base sm:text-lg font-black text-[#041d37] leading-snug">
                        {cls.title}
                      </h2>

                      {/* Description */}
                      {cls.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {cls.description}
                        </p>
                      )}

                      {/* Teacher Profile Box */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#041d37] to-[#1d8ccc] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {cls.teacherName ? cls.teacherName.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {copy.teacherLabel}
                          </p>
                          <p className="text-xs sm:text-sm font-black text-[#041d37] truncate">
                            {cls.teacherName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate" dir="ltr">
                            {cls.teacherEmail}
                          </p>
                        </div>
                      </div>

                      {/* Schedule & Capacity Details */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cls.schedule || copy.scheduleTBD}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#1d8ccc] shrink-0" />
                          <span className="font-bold text-[#041d37]">
                            {cls.studentCount || 0} / {cls.capacity} {copy.studentsCountLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar based on access state */}
                    <div className="pt-3 border-t border-slate-100">
                      {isApproved ? (
                        /* Student is authorized by teacher! Can enter class */
                        <button
                          type="button"
                          onClick={() => setEnteredClass(cls)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                        >
                          <DoorOpen className="w-4 h-4" />
                          <span>{copy.enterClassBtn}</span>
                        </button>
                      ) : isPending ? (
                        /* Request sent, awaiting teacher */
                        <div className="space-y-2">
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-800">
                            {copy.requestAwaitingApproval}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelAccessRequest(cls.id)}
                            className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer py-1"
                          >
                            {copy.cancelRequestBtn}
                          </button>
                        </div>
                      ) : isRejected ? (
                        /* Denied, can request again */
                        <button
                          type="button"
                          onClick={() => setRequestModalClass(cls)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{copy.reRequestAccessBtn}</span>
                        </button>
                      ) : (
                        /* Open to request */
                        <button
                          type="button"
                          onClick={() => setRequestModalClass(cls)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{copy.requestAccessBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* REQUEST ACCESS MODAL */}
      {requestModalClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-[#041d37] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1d8ccc]" />
                <span>{copy.modalRequestTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRequestModalClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
              <p className="text-xs text-slate-500 font-bold">{copy.targetClassLabel}</p>
              <p className="text-sm font-black text-[#041d37]">{requestModalClass.title}</p>
              <p className="text-xs text-slate-600">
                {copy.teacherLabel}: <span className="font-bold">{requestModalClass.teacherName}</span>
              </p>
            </div>

            <form onSubmit={handleSendAccessRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">
                  {copy.messageToTeacherLabel}
                </label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder={copy.messageToTeacherPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
                <p className="text-[11px] text-slate-400">{copy.messageHint}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRequestModalClass(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {sendingRequest && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{copy.sendRequestBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTERED CLASSROOM WORKSPACE MODAL */}
      {enteredClass && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{copy.authorizedWorkspace}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#041d37]">
                  {enteredClass.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEnteredClass(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher Details & Meeting Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {copy.yourTeacher}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#041d37] text-white flex items-center justify-center font-bold">
                    {enteredClass.teacherName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#041d37]">
                      {enteredClass.teacherName}
                    </p>
                    <a
                      href={`mailto:${enteredClass.teacherEmail}`}
                      className="text-xs text-[#1d8ccc] hover:underline"
                      dir="ltr"
                    >
                      {enteredClass.teacherEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {copy.sessionSchedule}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-[#041d37]">
                  <Calendar className="w-4 h-4 text-[#1d8ccc]" />
                  <span>{enteredClass.schedule || copy.scheduleTBD}</span>
                </div>
                <p className="text-xs text-slate-500">{copy.liveSessionNote}</p>
              </div>
            </div>

            {/* Class Description & Syllabus */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-[#041d37] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1d8ccc]" />
                <span>{copy.classSyllabusTitle}</span>
              </h3>
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {enteredClass.description || copy.defaultClassDescription}
              </div>
            </div>

            {/* Class Announcements Board */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{copy.classAnnouncements}</span>
              </h3>
              <p className="text-xs text-amber-950 font-medium">
                {copy.announcementsDesc}
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setEnteredClass(null)}
                className="px-6 py-2.5 rounded-full bg-[#041d37] hover:bg-[#1d8ccc] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                {copy.backToClassesBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
};

function useStudentCopy(language: "fr" | "ar" | "en") {
  if (language === "ar") {
    return {
      defaultStudentName: "متعلم أكاديمية مارين",
      roleStudentBadge: "طالب معتمد",
      liveSync: "متصل بالبث الحي",
      syncing: "جاري المزامنة",
      levelLabel: "المستوى",
      refresh: "تحديث البيانات",
      myApprovedClasses: "فصولي المقبول بها",
      accessGrantedSub: "لديك تصريح كامل بالدخول",
      pendingRequests: "طلبات قيد المراجعة",
      pendingRequestsSub: "بانتظار موافقة الأستاذ",
      allAvailableClasses: "فصول الأساتذة المتاحة",
      allAvailableClassesSub: "فصول حقيقية يقودها أساتذة معتمدون",
      tabExploreAll: "استكشاف جميع فصول الأساتذة",
      tabMyClasses: "فصولي المعتمدة",
      tabPending: "طلباتي المعلقة",
      filterByDomain: "تصفية حسب التخصص",
      searchPlaceholder: "ابحث باسم الأستاذ، عنوان الفصل، أو البريد الإلكتروني...",
      loadingClasses: "جاري تحميل الفصول الدراسية...",
      noClassesFoundTitle: "لم يتم العثور على فصول مطابقة",
      noClassesFoundSub: "جرب تغيير مصطلح البحث أو اختيار تخصص آخر لاستكشاف فصول الأساتذة.",
      teacherLabel: "الأستاذ المؤطر",
      studentsCountLabel: "طالب",
      scheduleTBD: "المواعيد تحدد مع الأستاذ",
      statusAccessGranted: "تم قبولك",
      statusPendingTeacher: "قيد المراجعة",
      statusAccessDenied: "الطلب مرفوض",
      statusOpen: "متاح للانضمام",
      enterClassBtn: "الدخول إلى قاعة الفصل",
      requestAwaitingApproval: "طلبك بانتظار موافقة الأستاذ المؤطر",
      cancelRequestBtn: "إلغاء الطلب",
      reRequestAccessBtn: "إعادة إرسال طلب الانضمام",
      requestAccessBtn: "طلب الانضمام إلى الفصل",
      modalRequestTitle: "طلب تصريح بالانضمام إلى الفصل",
      targetClassLabel: "الفصل الدراسي المستهدف",
      messageToTeacherLabel: "رسالة موجهة للأستاذ (اختياري)",
      messageToTeacherPlaceholder: "اكتب رسالة قصيرة توضح فيها دوافعك أو استفسارك للأستاذ...",
      messageHint: "سيصل هذا الطلب مباشرة إلى لوحة تحكم الأستاذ ليمنحك صلاحية الدخول.",
      cancelBtn: "إلغاء",
      sendRequestBtn: "إرسال الطلب للأستاذ",
      confirmCancelRequest: "هل أنت متأكد من إلغاء طلب الانضمام إلى هذا الفصل؟",
      requestSentSuccess: "تم إرسال طلب الانضمام للأستاذ بنجاح!",
      requestCancelled: "تم إلغاء الطلب بنجاح.",
      authorizedWorkspace: "فضاء الفصل المعتمد",
      yourTeacher: "الأستاذ المشرف",
      sessionSchedule: "أوقات الحصص والمتابعة",
      liveSessionNote: "يتم إرسال روابط الجلسات الحية والتحديثات للطلاب المعتمدين.",
      classSyllabusTitle: "برنامج الفصل والمحاور التعليمية",
      defaultClassDescription: "يتضمن هذا الفصل محاور نظرية وتطبيقية متقدمة يتم تأطيرها من طرف الأستاذ مع تمارين تطبيقية ومتابعة دورية.",
      classAnnouncements: "لوحة إعلانات الأستاذ",
      announcementsDesc: "مرحباً بك في الفصل! سيقوم الأستاذ بنشر مواعيد الجلسات والملفات التعليمية والواجبات هنا.",
      backToClassesBtn: "الرجوع لقائمة الفصول",
      loadError: "تعذر تحميل فصول الأساتذة. يرجى المحاولة ثانية.",
      actionError: "حدث خطأ أثناء تنفيذ العملية.",
    };
  }

  if (language === "en") {
    return {
      defaultStudentName: "MARIN Learner",
      roleStudentBadge: "Verified Student",
      liveSync: "Live Real-Time",
      syncing: "Syncing...",
      levelLabel: "Level",
      refresh: "Refresh Data",
      myApprovedClasses: "My Admitted Classes",
      accessGrantedSub: "Access granted by teacher",
      pendingRequests: "Pending Requests",
      pendingRequestsSub: "Awaiting teacher approval",
      allAvailableClasses: "All Instructor Classes",
      allAvailableClassesSub: "Real classes taught by expert teachers",
      tabExploreAll: "Explore All Teacher Classes",
      tabMyClasses: "My Admitted Classes",
      tabPending: "Pending Requests",
      filterByDomain: "Filter by Track",
      searchPlaceholder: "Search by teacher name, class title, or email...",
      loadingClasses: "Loading real teacher classes...",
      noClassesFoundTitle: "No classes match your search",
      noClassesFoundSub: "Try adjusting your search terms or selecting another track.",
      teacherLabel: "Lead Instructor",
      studentsCountLabel: "students",
      scheduleTBD: "Schedule TBD with instructor",
      statusAccessGranted: "Access Granted",
      statusPendingTeacher: "Awaiting Teacher",
      statusAccessDenied: "Access Denied",
      statusOpen: "Open for Enrollment",
      enterClassBtn: "Enter Classroom",
      requestAwaitingApproval: "Your request is awaiting the instructor's approval",
      cancelRequestBtn: "Cancel request",
      reRequestAccessBtn: "Submit New Request",
      requestAccessBtn: "Request Access to Class",
      modalRequestTitle: "Request Admission to Classroom",
      targetClassLabel: "Target Classroom",
      messageToTeacherLabel: "Message to Instructor (Optional)",
      messageToTeacherPlaceholder: "Introduce yourself or explain your interest to the instructor...",
      messageHint: "The instructor will review your request and decide whether to grant access.",
      cancelBtn: "Cancel",
      sendRequestBtn: "Send Request",
      confirmCancelRequest: "Are you sure you want to cancel your join request?",
      requestSentSuccess: "Access request sent to instructor successfully!",
      requestCancelled: "Request cancelled.",
      authorizedWorkspace: "Official Classroom Workspace",
      yourTeacher: "Your Instructor",
      sessionSchedule: "Session Schedule",
      liveSessionNote: "Live interactive links and files are accessible to admitted students.",
      classSyllabusTitle: "Class Syllabus & Curriculum",
      defaultClassDescription: "This classroom includes practical coursework, live mentorship, and guided projects led directly by the instructor.",
      classAnnouncements: "Instructor Notice Board",
      announcementsDesc: "Welcome to class! Your instructor will post upcoming live links, study materials, and assignments here.",
      backToClassesBtn: "Back to Classes",
      loadError: "Unable to load teacher classes.",
      actionError: "Action failed.",
    };
  }

  // French default
  return {
    defaultStudentName: "Apprenant MARIN",
    roleStudentBadge: "Étudiant Validé",
    liveSync: "En direct",
    syncing: "Synchronisation...",
    levelLabel: "Niveau",
    refresh: "Actualiser",
    myApprovedClasses: "Mes classes autorisées",
    accessGrantedSub: "Accès accordé par le formateur",
    pendingRequests: "Demandes en attente",
    pendingRequestsSub: "En attente de validation",
    allAvailableClasses: "Classes de formateurs",
    allAvailableClassesSub: "Classes réelles animées par des experts",
    tabExploreAll: "Explorer les classes de formateurs",
    tabMyClasses: "Mes classes autorisées",
    tabPending: "Demandes en attente",
    filterByDomain: "Filtrer par domaine",
    searchPlaceholder: "Rechercher par nom de formateur, titre de classe ou email...",
    loadingClasses: "Chargement des classes...",
    noClassesFoundTitle: "Aucune classe trouvée",
    noClassesFoundSub: "Modifiez votre recherche ou sélectionnez un autre domaine pour trouver la classe idéale.",
    teacherLabel: "Formateur Enseignant",
    studentsCountLabel: "étudiants",
    scheduleTBD: "Horaires à convenir avec le formateur",
    statusAccessGranted: "Accès accordé",
    statusPendingTeacher: "En attente du formateur",
    statusAccessDenied: "Accès refusé",
    statusOpen: "Ouverte à l'inscription",
    enterClassBtn: "Entrer dans la classe",
    requestAwaitingApproval: "Votre demande est en attente de validation par le formateur",
    cancelRequestBtn: "Annuler ma demande",
    reRequestAccessBtn: "Refaire une demande",
    requestAccessBtn: "Demander l'accès à la classe",
    modalRequestTitle: "Demande d'accès à la classe",
    targetClassLabel: "Classe visée",
    messageToTeacherLabel: "Message pour le formateur (optionnel)",
    messageToTeacherPlaceholder: "Présentez-vous ou expliquez vos motivations au formateur...",
    messageHint: "Le formateur recevra votre demande en temps réel pour autoriser votre accès.",
    cancelBtn: "Annuler",
    sendRequestBtn: "Envoyer ma demande",
    confirmCancelRequest: "Êtes-vous sûr de vouloir annuler votre demande d'accès ?",
    requestSentSuccess: "Votre demande d'accès a été transmise au formateur !",
    requestCancelled: "Demande annulée.",
    authorizedWorkspace: "Espace Classe Autorisé",
    yourTeacher: "Votre Formateur",
    sessionSchedule: "Horaires et sessions",
    liveSessionNote: "Les liens de visioconférence et ressources sont partagés aux membres autorisés.",
    classSyllabusTitle: "Programme et objectifs de la classe",
    defaultClassDescription: "Cette classe comprend des sessions pratiques, du mentorat en direct et un suivi personnalisé assuré par le formateur.",
    classAnnouncements: "Tableau d'annonces du formateur",
    announcementsDesc: "Bienvenue dans votre classe ! Votre enseignant partagera ici les actualités, supports et liens de cours.",
    backToClassesBtn: "Retour aux classes",
    loadError: "Impossible de charger les classes de formateurs.",
    actionError: "Erreur lors de l'opération.",
  };
}
