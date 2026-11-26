import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Users,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  Wifi,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Briefcase,
  Mail,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Classroom, ClassAccessRequest, UserRole } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useRealtimeSync } from "../hooks/useRealtimeSync";
import { LandingFooter } from "./LandingFooter";

interface TeacherDashboardProps {
  onBackToHome: () => void;
  onExploreCourses?: () => void;
}

const DOMAINS = [
  "المالية الذكية",
  "التسويق الاستراتيجي",
  "نظام الشركة",
  "Comptabilité & Finance",
  "Management & Leadership",
  "Agence de Voyage & Tourisme",
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onBackToHome,
}) => {
  const { language, isRTL } = useLanguage();
  const { profile, getAuthHeaders, updateProfile } = useAuth();
  const copy = useTeacherCopy(language);

  const [activeTab, setActiveTab] = useState<"classes" | "requests" | "students" | "profile">("classes");
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [requests, setRequests] = useState<ClassAccessRequest[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");

  // Create / Edit Class Modal
  const [classModalOpen, setClassModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [classForm, setClassForm] = useState({
    title: "",
    domain: DOMAINS[0],
    schedule: "",
    capacity: 30,
    status: "active" as "active" | "draft" | "archived",
    description: "",
  });
  const [savingClass, setSavingClass] = useState<boolean>(false);

  // Manage Students Modal for a specific class
  const [activeManageClass, setActiveManageClass] = useState<Classroom | null>(null);
  const [actionBusyStudentId, setActionBusyStudentId] = useState<string | null>(null);

  // Edit Teacher Profile Modal
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    name: profile.name || "",
    title: profile.title || "",
    activeDomain: profile.activeDomain || DOMAINS[0],
  });
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchTeacherData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/teacher/dashboard", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.loadError);
        return;
      }

      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setRequests(Array.isArray(data.requests) ? data.requests : []);
      setEnrolledStudents(Array.isArray(data.enrolledStudents) ? data.enrolledStudents : []);
    } catch {
      setErrorMsg(copy.loadError);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [getAuthHeaders, copy.loadError]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  // Real-Time WebSocket sync
  const { isConnected } = useRealtimeSync({
    onEvent: (event) => {
      // Whenever a class or enrollment or access request changes, refresh quietly
      if (
        event.type === "access:requested" ||
        event.type === "access:decided" ||
        event.type === "class:created" ||
        event.type === "class:updated" ||
        event.type === "class:deleted" ||
        event.type === "enrollments:updated"
      ) {
        fetchTeacherData(true);
      }
    },
  });

  const handleCreateOrUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClass(true);
    setErrorMsg(null);

    const isEdit = Boolean(editingClass);
    const url = isEdit
      ? `/api/teacher/classes/${encodeURIComponent(editingClass!.id)}`
      : "/api/teacher/classes";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }

      setClassModalOpen(false);
      setEditingClass(null);
      showToast(isEdit ? copy.classUpdated : copy.classCreated);
      await fetchTeacherData(true);
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm(copy.confirmDeleteClass)) return;
    try {
      const res = await fetch(`/api/teacher/classes/${encodeURIComponent(classId)}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      showToast(copy.classDeleted);
      if (activeManageClass?.id === classId) {
        setActiveManageClass(null);
      }
      await fetchTeacherData(true);
    } catch {
      setErrorMsg(copy.actionError);
    }
  };

  const handleStudentAccessDecision = async (
    classId: string,
    studentId: string,
    decision: "approved" | "rejected" | "removed"
  ) => {
    setActionBusyStudentId(studentId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/teacher/classes/${encodeURIComponent(classId)}/access`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, decision }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }

      if (decision === "approved") {
        showToast(copy.accessGranted);
      } else if (decision === "rejected") {
        showToast(copy.accessDenied);
      } else {
        showToast(copy.studentRemoved);
      }

      await fetchTeacherData(true);
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setActionBusyStudentId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg(null);
    const res = await updateProfile(profileForm);
    setSavingProfile(false);
    if (!res.ok) {
      setErrorMsg(res.error || copy.actionError);
      return;
    }
    setEditingProfile(false);
    showToast(copy.profileUpdated);
  };

  const openCreateClassModal = () => {
    setEditingClass(null);
    setClassForm({
      title: "",
      domain: profile.activeDomain || DOMAINS[0],
      schedule: "",
      capacity: 30,
      status: "active",
      description: "",
    });
    setClassModalOpen(true);
  };

  const openEditClassModal = (cls: Classroom) => {
    setEditingClass(cls);
    setClassForm({
      title: cls.title,
      domain: cls.domain || DOMAINS[0],
      schedule: cls.schedule || "",
      capacity: cls.capacity || 30,
      status: cls.status || "active",
      description: cls.description || "",
    });
    setClassModalOpen(true);
  };

  const formatTalabDateTime = (rawDate?: string) => {
    if (!rawDate) {
      return { dateStr: "—", timeStr: "", relativeStr: "" };
    }
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) {
        return { dateStr: "—", timeStr: "", relativeStr: "" };
      }

      const locale = language === "ar" ? "ar-DZ" : language === "en" ? "en-GB" : "fr-FR";

      const dateStr = d.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const timeStr = d.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const diffMs = Date.now() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relativeStr = "";
      if (language === "ar") {
        if (diffSec < 45) relativeStr = "الآن";
        else if (diffMin < 60) relativeStr = `منذ ${diffMin} د`;
        else if (diffHours < 24) relativeStr = `منذ ${diffHours} س`;
        else relativeStr = `منذ ${diffDays} يوم`;
      } else if (language === "en") {
        if (diffSec < 45) relativeStr = "just now";
        else if (diffMin < 60) relativeStr = `${diffMin}m ago`;
        else if (diffHours < 24) relativeStr = `${diffHours}h ago`;
        else relativeStr = `${diffDays}d ago`;
      } else {
        if (diffSec < 45) relativeStr = "à l'instant";
        else if (diffMin < 60) relativeStr = `il y a ${diffMin} min`;
        else if (diffHours < 24) relativeStr = `il y a ${diffHours} h`;
        else relativeStr = `il y a ${diffDays} j`;
      }

      return { dateStr, timeStr, relativeStr };
    } catch {
      return { dateStr: "—", timeStr: "", relativeStr: "" };
    }
  };

  // Filtered classes
  const filteredClasses = classes.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.domain && c.domain.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const classId = r.classId || (r as any).class_id;
    if (selectedClassFilter !== "all" && classId !== selectedClassFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (r.studentName || (r as any).student_name || (r as any).full_name || "").toLowerCase();
    const email = (r.studentEmail || (r as any).student_email || "").toLowerCase();
    const title = (r.classTitle || (r as any).class_title || "").toLowerCase();
    const msg = (r.message || (r as any).request_message || "").toLowerCase();
    return name.includes(q) || email.includes(q) || title.includes(q) || msg.includes(q);
  });

  // Filtered enrolled students
  const filteredStudents = enrolledStudents.filter((s) => {
    const classId = s.classId || s.class_id;
    if (selectedClassFilter !== "all" && classId !== selectedClassFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (s.studentName || s.student_name || "").toLowerCase();
    const email = (s.studentEmail || s.student_email || "").toLowerCase();
    const title = (s.classTitle || s.class_title || "").toLowerCase();
    return name.includes(q) || email.includes(q) || title.includes(q);
  });

  const totalEnrolledCount = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const pendingRequestsCount = requests.length;

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

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header Card */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            {/* Teacher Identity */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#041d37] to-[#1d8ccc] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#041d37]">
                    {profile.name}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-200 text-xs font-bold inline-flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{copy.roleTeacherBadge}</span>
                  </span>
                  {/* Real-time Indicator */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                    title={isConnected ? copy.liveConnected : copy.liveReconnecting}
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
                  <Briefcase className="w-3.5 h-3.5 text-[#1d8ccc]" />
                  <span>{profile.title || copy.defaultTitle}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{profile.activeDomain || DOMAINS[0]}</span>
                </p>
                <div className="text-xs text-slate-400 flex items-center gap-1.5" dir="ltr">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
              <button
                type="button"
                onClick={openCreateClassModal}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{copy.addClassBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{copy.editProfileBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => fetchTeacherData(false)}
                disabled={loading}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title={copy.refresh}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Quick Stat Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {copy.totalClasses}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">
                {classes.length}
              </p>
              <p className="text-[11px] text-slate-400">{copy.totalClassesSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {copy.enrolledStudents}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                {totalEnrolledCount}
              </p>
              <p className="text-[11px] text-slate-400">{copy.enrolledStudentsSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => setActiveTab("requests")}
            className={`rounded-3xl border p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              pendingRequestsCount > 0
                ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-300/40 hover:bg-amber-50"
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {copy.pendingAccessRequests}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black text-amber-700">
                  {pendingRequestsCount}
                </p>
                {pendingRequestsCount > 0 && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                    {copy.actionRequired}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/70">{copy.pendingRequestsSub}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
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

        {/* Navigation Tabs & Search Toolbar */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("classes")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "classes"
                    ? "bg-[#041d37] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {copy.tabClasses} ({classes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "requests"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{copy.tabRequests}</span>
                {pendingRequestsCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activeTab === "requests"
                        ? "bg-white text-amber-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "students"
                    ? "bg-[#041d37] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {copy.tabEnrolled} ({totalEnrolledCount})
              </button>
            </div>

            {/* Class filter dropdown */}
            {classes.length > 0 && (activeTab === "requests" || activeTab === "students") && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
                  {copy.filterByClass}:
                </span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                >
                  <option value="all">{copy.allMyClasses}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Bar */}
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
              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 ${
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              } text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#1d8ccc]`}
            />
          </div>
        </section>

        {/* Tab 1: Classes Content */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#1d8ccc]" />
                <span className="text-sm font-bold">{copy.loadingClasses}</span>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-sky-50 text-[#1d8ccc] mx-auto flex items-center justify-center">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#041d37]">{copy.emptyClassesTitle}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">{copy.emptyClassesSub}</p>
                </div>
                <button
                  type="button"
                  onClick={openCreateClassModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{copy.addClassBtn}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredClasses.map((cls) => {
                  const pendingInClass = requests.filter((r) => r.classId === cls.id).length;
                  return (
                    <div
                      key={cls.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-[#1d8ccc] transition-all"
                    >
                      <div className="space-y-3">
                        {/* Domain & Status badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-xs font-bold">
                            {cls.domain}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                cls.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : cls.status === "draft"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {cls.status === "active"
                                ? copy.statusActive
                                : cls.status === "draft"
                                  ? copy.statusDraft
                                  : copy.statusArchived}
                            </span>
                            {pendingInClass > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black animate-pulse">
                                {pendingInClass} {copy.requestsBadge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Class Title */}
                        <h2 className="text-lg font-black text-[#041d37] leading-tight">
                          {cls.title}
                        </h2>

                        {/* Description */}
                        {cls.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {cls.description}
                          </p>
                        )}

                        {/* Info details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{cls.schedule || copy.scheduleTBD}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#1d8ccc] shrink-0" />
                            <span className="font-bold text-[#041d37]">
                              {cls.studentCount || 0} / {cls.capacity} {copy.studentsCountLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Class Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveManageClass(cls);
                            setActiveTab("requests");
                            setSelectedClassFilter(cls.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            pendingInClass > 0
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900 font-black"
                              : "bg-slate-100 hover:bg-sky-50 hover:text-[#1d8ccc] text-[#041d37]"
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{copy.manageStudentsBtn}</span>
                          {pendingInClass > 0 && (
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center">
                              {pendingInClass}
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditClassModal(cls)}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] flex items-center justify-center cursor-pointer transition-colors"
                            title={copy.editBtn}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(cls.id)}
                            className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                            title={copy.deleteBtn}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Student Requests (Access Control) */}
        {activeTab === "requests" && (
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-amber-50/70 to-white">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                  {copy.pendingRequestsHeading}
                </h2>
                <p className="text-xs text-slate-500">{copy.pendingRequestsHeadingSub}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold self-start sm:self-center">
                {filteredRequests.length} {copy.pendingLabel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{copy.colStudent}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colTargetClass}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colStudentMessage}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colRequestDate}</th>
                    <th className="py-3.5 px-4 text-end">{copy.colGiveAccess}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                        {copy.noPendingRequests}
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const classId = req.classId || (req as any).class_id;
                      const studentId = req.studentId || (req as any).student_id;
                      const isBusy = actionBusyStudentId === studentId;

                      const studentName =
                        (typeof req.studentName === "string" && req.studentName.trim()) ||
                        (typeof (req as any).student_name === "string" && (req as any).student_name.trim()) ||
                        (typeof (req as any).full_name === "string" && (req as any).full_name.trim()) ||
                        (typeof (req as any).username === "string" && (req as any).username.trim()) ||
                        (req.studentEmail ? req.studentEmail.split("@")[0] : "") ||
                        "Étudiant";

                      const studentEmail = req.studentEmail || (req as any).student_email || "";
                      const studentUsername =
                        (req as any).studentUsername ||
                        (req as any).student_username ||
                        (req as any).username ||
                        "";
                      const studentDomain =
                        req.studentDomain || (req as any).student_domain || DOMAINS[0];
                      const studentXp = req.studentXp ?? (req as any).student_xp ?? 0;

                      const rawTalabDate =
                        req.createdAt ||
                        (req as any).created_at ||
                        (req as any).request_date ||
                        (req as any).requestDate ||
                        (req as any).updated_at ||
                        (req as any).updatedAt;

                      const { dateStr, timeStr, relativeStr } = formatTalabDateTime(rawTalabDate);

                      return (
                        <tr key={req.id || `${classId}-${studentId}`} className="hover:bg-amber-50/30 transition-colors">
                          {/* Student Info (Real Student Name) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#041d37] to-[#1d8ccc] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#041d37] text-sm leading-snug flex items-center gap-2 flex-wrap">
                                  <span className="truncate">{studentName}</span>
                                  {studentUsername && (
                                    <span className="text-[11px] text-slate-400 font-semibold" dir="ltr">
                                      @{studentUsername}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium truncate" dir="ltr">
                                  {studentEmail}
                                </div>
                                <div className="text-[10px] text-[#1d8ccc] font-bold mt-0.5">
                                  {studentDomain} • {studentXp} XP
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Class Title */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#041d37] block">
                              {req.classTitle || (req as any).class_title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {(req as any).class_domain || (req as any).classDomain}
                            </span>
                          </td>

                          {/* Note / Message from student */}
                          <td className="py-3.5 px-4 max-w-[260px]">
                            {req.message ? (
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
                                &ldquo;{req.message}&rdquo;
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">{copy.noMessage}</span>
                            )}
                          </td>

                          {/* Request Date & Time (Real time and date of talab) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#041d37]">
                                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{dateStr}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                {timeStr && (
                                  <span className="flex items-center gap-1" dir="ltr">
                                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-mono font-semibold text-slate-700">{timeStr}</span>
                                  </span>
                                )}
                                {relativeStr && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                                    {relativeStr}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Action Buttons: Give Access or Deny */}
                          <td className="py-3.5 px-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              {/* Give Access (Approve) */}
                              <button
                                type="button"
                                disabled={isBusy || !classId || !studentId}
                                onClick={() =>
                                  handleStudentAccessDecision(classId, studentId, "approved")
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                                <span>{copy.giveAccessBtn}</span>
                              </button>

                              {/* Deny (Reject) */}
                              <button
                                type="button"
                                disabled={isBusy || !classId || !studentId}
                                onClick={() =>
                                  handleStudentAccessDecision(classId, studentId, "rejected")
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>{copy.denyAccessBtn}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 3: Enrolled Students (Access Granted) */}
        {activeTab === "students" && (
          <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-emerald-50/70 to-white">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                  {copy.enrolledStudentsHeading}
                </h2>
                <p className="text-xs text-slate-500">{copy.enrolledStudentsHeadingSub}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-center">
                {filteredStudents.length} {copy.studentsCountLabel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3.5 px-4 text-start">{copy.colStudent}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colClass}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colDomain}</th>
                    <th className="py-3.5 px-4 text-start">{copy.colEnrollDate}</th>
                    <th className="py-3.5 px-4 text-end">{copy.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                        {copy.noEnrolledStudents}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const classId = st.classId || st.class_id;
                      const studentId = st.studentId || st.student_id;
                      const isBusy = actionBusyStudentId === studentId;

                      const studentName =
                        (typeof st.studentName === "string" && st.studentName.trim()) ||
                        (typeof st.student_name === "string" && st.student_name.trim()) ||
                        (typeof (st as any).full_name === "string" && (st as any).full_name.trim()) ||
                        (st.studentEmail ? st.studentEmail.split("@")[0] : "") ||
                        (st.student_email ? st.student_email.split("@")[0] : "") ||
                        "Étudiant";

                      const studentEmail = st.studentEmail || st.student_email || "";
                      const rawEnrollDate = st.enrolledAt || st.enrolled_at || st.createdAt || st.created_at;
                      const { dateStr, timeStr } = formatTalabDateTime(rawEnrollDate);

                      return (
                        <tr key={st.id || `${classId}-${studentId}`} className="hover:bg-sky-50/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#041d37] text-sm leading-tight truncate">
                                  {studentName}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium truncate" dir="ltr">
                                  {studentEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#041d37]">
                            {st.classTitle || st.class_title}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                              {st.studentDomain || st.student_domain || DOMAINS[0]}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{dateStr}</span>
                            </div>
                            {timeStr && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5" dir="ltr">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{timeStr}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleStudentAccessDecision(classId, studentId, "removed")
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                              title={copy.revokeAccessTitle}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{copy.revokeAccessBtn}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* CREATE / EDIT CLASS MODAL */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#041d37] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1d8ccc]" />
                <span>{editingClass ? copy.editClassTitle : copy.addClassTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">
                  {copy.classTitleLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={classForm.title}
                  onChange={(e) => setClassForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={copy.classTitlePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.domainLabel}</label>
                  <select
                    value={classForm.domain}
                    onChange={(e) => setClassForm((f) => ({ ...f, domain: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.statusLabel}</label>
                  <select
                    value={classForm.status}
                    onChange={(e) =>
                      setClassForm((f) => ({
                        ...f,
                        status: e.target.value as "active" | "draft" | "archived",
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    <option value="active">{copy.statusActive}</option>
                    <option value="draft">{copy.statusDraft}</option>
                    <option value="archived">{copy.statusArchived}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">
                    {copy.scheduleLabel}
                  </label>
                  <input
                    type="text"
                    value={classForm.schedule}
                    onChange={(e) =>
                      setClassForm((f) => ({ ...f, schedule: e.target.value }))
                    }
                    placeholder="Dimanche 18h - 20h"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">
                    {copy.capacityLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={classForm.capacity}
                    onChange={(e) =>
                      setClassForm((f) => ({
                        ...f,
                        capacity: Number(e.target.value) || 30,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">
                  {copy.descriptionLabel}
                </label>
                <textarea
                  rows={3}
                  value={classForm.description}
                  onChange={(e) =>
                    setClassForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder={copy.descriptionPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={savingClass}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingClass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingClass ? copy.saveBtn : copy.createClassBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#041d37] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1d8ccc]" />
                <span>{copy.editProfileTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.fullNameLabel} *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.titleLabel}</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={copy.defaultTitle}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.domainLabel}</label>
                <select
                  value={profileForm.activeDomain}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, activeDomain: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{copy.saveBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
};

function useTeacherCopy(language: "fr" | "ar" | "en") {
  if (language === "ar") {
    return {
      roleTeacherBadge: "أستاذ ومؤطر معتمد",
      liveSync: "متصل بالبث الحي",
      syncing: "جاري المزامنة",
      liveConnected: "نظام التحديث الفوري نشط",
      liveReconnecting: "جاري إعادة الاتصال الفوري...",
      defaultTitle: "أستاذ ومؤطر معتمد",
      addClassBtn: "إضافة فصل جديد",
      editProfileBtn: "تعديل بياناتي",
      refresh: "تحديث البيانات",
      totalClasses: "الفصول المفتوحة",
      totalClassesSub: "فصولك الدراسية النشطة",
      enrolledStudents: "الطلاب المعتمدون",
      enrolledStudentsSub: "الطلاب الذين منحتهم حق الدخول",
      pendingAccessRequests: "طلبات انضمام الطلاب",
      actionRequired: "يتطلب قرارك",
      pendingRequestsSub: "طلاب بانتظار موافقتك للدخول",
      tabClasses: "فصولي الدراسية",
      tabRequests: "طلبات الانضمام المعلقة",
      tabEnrolled: "قائمة الطلاب المقبولين",
      filterByClass: "تصفية حسب الفصل",
      allMyClasses: "جميع فصولي",
      searchPlaceholder: "بحث عن فصل أو طالب أو بريد إلكتروني...",
      loadingClasses: "جاري تحميل بيانات الفصول والطلاب...",
      emptyClassesTitle: "لم تقم بإنشاء أي فصول بعد",
      emptyClassesSub: "أنشئ فصلك الدراسي الأول وابدأ في قبول الطلاب وتنظيم الدروس والمتابعة.",
      statusActive: "نشط",
      statusDraft: "مسودة",
      statusArchived: "مؤرشف",
      requestsBadge: "طلب جديد",
      scheduleTBD: "يحدد لاحقاً",
      studentsCountLabel: "طالب",
      manageStudentsBtn: "إدارة الطلاب والطلبات",
      editBtn: "تعديل",
      deleteBtn: "حذف",
      confirmDeleteClass: "هل أنت متأكد من حذف هذا الفصل؟ سيتم إلغاء كافة ارتباطات الطلاب به.",
      pendingRequestsHeading: "طلبات الطلاب المعلقة للدخول إلى فصولك",
      pendingRequestsHeadingSub: "يمكنك قبول دخول الطالب إلى الفصل أو رفض طلبه مباشرة بنقرة واحدة.",
      pendingLabel: "طلب قيد الانتظار",
      colStudent: "الطالب",
      colTargetClass: "الفصل المطلوب",
      colStudentMessage: "رسالة / ملاحظة الطالب",
      colRequestDate: "تاريخ الطلب",
      colGiveAccess: "منح صلاحية الدخول",
      noPendingRequests: "لا توجد طلبات انضمام جديدة حالياً.",
      noMessage: "بدون رسالة",
      giveAccessBtn: "قبول ومنح الدخول",
      denyAccessBtn: "رفض الطلب",
      accessGranted: "تم منح الطالب صلاحية دخول الفصل بنجاح!",
      accessDenied: "تم رفض طلب انضمام الطالب.",
      studentRemoved: "تم إلغاء صلاحية الطالب وسحبه من الفصل.",
      enrolledStudentsHeading: "الطلاب المقبولون في فصولك",
      enrolledStudentsHeadingSub: "هؤلاء الطلاب لديهم تصريح رسمي بالدخول ومتابعة الفصل.",
      colClass: "الفصل الدراسي",
      colDomain: "التخصص",
      colEnrollDate: "تاريخ القبول",
      colActions: "إجراءات",
      noEnrolledStudents: "لا يوجد طلاب مسجلون بعد في فصولك.",
      revokeAccessTitle: "إلغاء صلاحية دخول الطالب",
      revokeAccessBtn: "سحب الصلاحية",
      addClassTitle: "إنشاء فصل دراسي جديد",
      editClassTitle: "تعديل بيانات الفصل",
      classTitleLabel: "عنوان الفصل",
      classTitlePlaceholder: "مثال: المحاسبة المعمقة والمعايير الدولية IFRS",
      domainLabel: "المسار / التخصص",
      statusLabel: "حالة الفصل",
      scheduleLabel: "الجدول الزمني / المواعيد",
      capacityLabel: "الطاقة الاستيعابية القصوى (عدد المقاعد)",
      descriptionLabel: "وصف الفصل وأهدافه",
      descriptionPlaceholder: "اكتب نبذة عن محتوى الفصل وما سيتعلمه الطالب...",
      cancelBtn: "إلغاء",
      saveBtn: "حفظ التغييرات",
      createClassBtn: "إنشاء الفصل",
      classCreated: "تم إنشاء الفصل الدراسي بنجاح!",
      classUpdated: "تم تحديث بيانات الفصل بنجاح!",
      classDeleted: "تم حذف الفصل بنجاح.",
      editProfileTitle: "تعديل الملف الشخصي للأستاذ",
      fullNameLabel: "الاسم الكامل",
      titleLabel: "الصفة / اللقب الأكاديمي",
      profileUpdated: "تم تحديث بياناتك الشخصية بنجاح.",
      loadError: "تعذر تحميل بيانات الأستاذ. يرجى المحاولة ثانية.",
      actionError: "حدث خطأ أثناء تنفيذ العملية.",
    };
  }

  if (language === "en") {
    return {
      roleTeacherBadge: "Certified Instructor",
      liveSync: "Live Real-Time",
      syncing: "Syncing...",
      liveConnected: "Live real-time sync active",
      liveReconnecting: "Reconnecting real-time...",
      defaultTitle: "Master Instructor",
      addClassBtn: "Add New Class",
      editProfileBtn: "Edit Profile",
      refresh: "Refresh Data",
      totalClasses: "Active Classes",
      totalClassesSub: "Cohorts you teach",
      enrolledStudents: "Admitted Students",
      enrolledStudentsSub: "Students granted access",
      pendingAccessRequests: "Student Join Requests",
      actionRequired: "Decision needed",
      pendingRequestsSub: "Awaiting your approval",
      tabClasses: "My Classes",
      tabRequests: "Pending Requests",
      tabEnrolled: "Admitted Students",
      filterByClass: "Filter by Class",
      allMyClasses: "All My Classes",
      searchPlaceholder: "Search class, student name, email...",
      loadingClasses: "Loading classes and students...",
      emptyClassesTitle: "No classes created yet",
      emptyClassesSub: "Create your first class to admit students, schedule sessions, and teach.",
      statusActive: "Active",
      statusDraft: "Draft",
      statusArchived: "Archived",
      requestsBadge: "New request",
      scheduleTBD: "Schedule TBD",
      studentsCountLabel: "students",
      manageStudentsBtn: "Manage Students & Access",
      editBtn: "Edit",
      deleteBtn: "Delete",
      confirmDeleteClass: "Are you sure you want to delete this class? All student enrollments will be removed.",
      pendingRequestsHeading: "Pending Student Access Requests",
      pendingRequestsHeadingSub: "Grant or deny student access to enter your classes.",
      pendingLabel: "pending",
      colStudent: "Student",
      colTargetClass: "Target Class",
      colStudentMessage: "Student Note",
      colRequestDate: "Request Date",
      colGiveAccess: "Grant Access Decision",
      noPendingRequests: "No pending access requests at the moment.",
      noMessage: "No note attached",
      giveAccessBtn: "Give Access",
      denyAccessBtn: "Deny",
      accessGranted: "Student access granted successfully!",
      accessDenied: "Student access request denied.",
      studentRemoved: "Student access revoked from class.",
      enrolledStudentsHeading: "Enrolled Students (Access Granted)",
      enrolledStudentsHeadingSub: "These students have authorized access to attend this class.",
      colClass: "Classroom",
      colDomain: "Track",
      colEnrollDate: "Admitted Date",
      colActions: "Actions",
      noEnrolledStudents: "No students currently enrolled.",
      revokeAccessTitle: "Revoke student access",
      revokeAccessBtn: "Revoke Access",
      addClassTitle: "Create New Classroom",
      editClassTitle: "Edit Classroom Details",
      classTitleLabel: "Class Title",
      classTitlePlaceholder: "e.g. Advanced Financial Analytics & IFRS",
      domainLabel: "Track / Domain",
      statusLabel: "Class Status",
      scheduleLabel: "Schedule & Meeting Hours",
      capacityLabel: "Capacity (Maximum seats)",
      descriptionLabel: "Class Description & Syllabus",
      descriptionPlaceholder: "Describe what students will learn in this class...",
      cancelBtn: "Cancel",
      saveBtn: "Save Changes",
      createClassBtn: "Create Class",
      classCreated: "Classroom created successfully!",
      classUpdated: "Classroom updated successfully!",
      classDeleted: "Classroom deleted.",
      editProfileTitle: "Edit Teacher Profile",
      fullNameLabel: "Full Name",
      titleLabel: "Academic Title / Expertise",
      profileUpdated: "Profile updated successfully.",
      loadError: "Unable to load teacher dashboard.",
      actionError: "Action failed.",
    };
  }

  // French default
  return {
    roleTeacherBadge: "Formateur Agréé",
    liveSync: "En direct",
    syncing: "Synchronisation...",
    liveConnected: "Synchronisation en direct active",
    liveReconnecting: "Reconnexion en direct...",
    defaultTitle: "Formateur Expert",
    addClassBtn: "Créer une classe",
    editProfileBtn: "Modifier mon profil",
    refresh: "Actualiser",
    totalClasses: "Classes créées",
    totalClassesSub: "Vos cours et cohortes",
    enrolledStudents: "Étudiants admis",
    enrolledStudentsSub: "Ayant accès à vos classes",
    pendingAccessRequests: "Demandes d'accès",
    actionRequired: "À valider",
    pendingRequestsSub: "En attente de votre accord",
    tabClasses: "Mes Classes",
    tabRequests: "Demandes d'accès",
    tabEnrolled: "Étudiants admis",
    filterByClass: "Filtrer par classe",
    allMyClasses: "Toutes mes classes",
    searchPlaceholder: "Rechercher une classe, un étudiant ou un email...",
    loadingClasses: "Chargement de votre espace formateur...",
    emptyClassesTitle: "Aucune classe créée pour le moment",
    emptyClassesSub: "Créez votre première classe pour commencer à accepter des étudiants et animer vos cours.",
    statusActive: "Active",
    statusDraft: "Brouillon",
    statusArchived: "Archivée",
    requestsBadge: "demande",
    scheduleTBD: "Horaires à définir",
    studentsCountLabel: "étudiants",
    manageStudentsBtn: "Gérer l'accès des étudiants",
    editBtn: "Modifier",
    deleteBtn: "Supprimer",
    confirmDeleteClass: "Confirmez-vous la suppression de cette classe ? Toutes les inscriptions associées seront effacées.",
    pendingRequestsHeading: "Demandes d'accès des étudiants à vos classes",
    pendingRequestsHeadingSub: "Décidez en un clic qui peut entrer dans vos classes ou refusez les demandes.",
    pendingLabel: "en attente",
    colStudent: "Étudiant",
    colTargetClass: "Classe visée",
    colStudentMessage: "Message de l'étudiant",
    colRequestDate: "Date de demande",
    colGiveAccess: "Décision d'accès",
    noPendingRequests: "Aucune demande d'accès en attente pour le moment.",
    noMessage: "Aucun message",
    giveAccessBtn: "Donner l'accès",
    denyAccessBtn: "Refuser",
    accessGranted: "Accès accordé à l'étudiant avec succès !",
    accessDenied: "Demande d'accès refusée.",
    studentRemoved: "Étudiant retiré de la classe.",
    enrolledStudentsHeading: "Étudiants autorisés (Accès accordé)",
    enrolledStudentsHeadingSub: "Ces étudiants ont validé leur accès et peuvent suivre la classe.",
    colClass: "Classe",
    colDomain: "Domaine",
    colEnrollDate: "Date d'admission",
    colActions: "Actions",
    noEnrolledStudents: "Aucun étudiant actuellement admis.",
    revokeAccessTitle: "Retirer l'accès de l'étudiant",
    revokeAccessBtn: "Retirer l'accès",
    addClassTitle: "Créer une nouvelle classe",
    editClassTitle: "Modifier la classe",
    classTitleLabel: "Intitulé de la classe",
    classTitlePlaceholder: "Ex: Comptabilité Approfondie & Normes IFRS",
    domainLabel: "Spécialité / Domaine",
    statusLabel: "Statut",
    scheduleLabel: "Horaires et jours de session",
    capacityLabel: "Capacité (Nombre de places)",
    descriptionLabel: "Description et objectifs de la classe",
    descriptionPlaceholder: "Précisez le programme et ce que les étudiants vont apprendre...",
    cancelBtn: "Annuler",
    saveBtn: "Enregistrer",
    createClassBtn: "Créer la classe",
    classCreated: "Classe créée avec succès !",
    classUpdated: "Classe mise à jour avec succès !",
    classDeleted: "Classe supprimée.",
    editProfileTitle: "Modifier mon profil formateur",
    fullNameLabel: "Nom complet",
    titleLabel: "Titre professionnel / Expertise",
    profileUpdated: "Votre profil formateur a été mis à jour.",
    loadError: "Impossible de charger l'espace formateur.",
    actionError: "Erreur lors de l'opération.",
  };
}
