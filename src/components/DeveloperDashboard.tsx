import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  UserPlus,
  BookOpen,
  GraduationCap,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  Layers,
  Eye,
  EyeOff,
  Copy,
  Key,
} from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, UserRole, Classroom } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { LandingFooter } from "./LandingFooter";

interface DeveloperDashboardProps {
  onBackToHome: () => void;
}

type TableViewTab = "all" | "requests" | "classes" | "teachers" | "students" | "staff" | "users";

const ALL_ROLES: UserRole[] = ["guest", "student", "teacher", "admin", "developer"];

const DOMAINS = [
  "المالية الذكية",
  "التسويق الاستراتيجي",
  "نظام الشركة",
  "Comptabilité & Finance",
  "Management & Leadership",
  "Agence de Voyage & Tourisme",
];

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  onBackToHome,
}) => {
  const { language, isRTL } = useLanguage();
  const { isDeveloper, profile, getAuthHeaders } = useAuth();
  const copy = useDeveloperCopy(language);

  const [activeView, setActiveView] = useState<TableViewTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [requests, setRequests] = useState<UserProfile[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  // Per-row selected role for pending requests before clicking Approve
  const [pendingRoleSelection, setPendingRoleSelection] = useState<
    Record<string, UserRole>
  >({});
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  // Add User Modal
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "student" as UserRole,
    title: "",
    activeDomain: DOMAINS[0],
  });
  const [creatingUser, setCreatingUser] = useState<boolean>(false);

  // Edit User Modal (All Users)
  const [editUserModalOpen, setEditUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "student" as UserRole,
    title: "",
    activeDomain: DOMAINS[0],
    password: "",
  });
  const [savingEditUser, setSavingEditUser] = useState<boolean>(false);
  const [allPasswordsMasked, setAllPasswordsMasked] = useState<boolean>(false);
  const [maskedUserPasswords, setMaskedUserPasswords] = useState<Record<string, boolean>>({});
  const [showEditPassword, setShowEditPassword] = useState<boolean>(true);

  const isPasswordMasked = (id: string) => {
    if (maskedUserPasswords[id] !== undefined) {
      return maskedUserPasswords[id];
    }
    return allPasswordsMasked;
  };

  const toggleMaskPassword = (id: string) => {
    setMaskedUserPasswords((prev) => {
      const current = prev[id] !== undefined ? prev[id] : allPasswordsMasked;
      return {
        ...prev,
        [id]: !current,
      };
    });
  };

  const toggleAllPasswords = () => {
    setAllPasswordsMasked((prev) => {
      const next = !prev;
      setMaskedUserPasswords({});
      return next;
    });
  };

  // Create / Edit Class Modal
  const [classModalOpen, setClassModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [classForm, setClassForm] = useState({
    title: "",
    domain: DOMAINS[0],
    teacherId: "",
    schedule: "",
    capacity: 30,
    status: "active" as "active" | "draft" | "archived",
  });
  const [savingClass, setSavingClass] = useState<boolean>(false);

  // Manage Class Students Modal
  const [enrollClass, setEnrollClass] = useState<Classroom | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [savingEnrollments, setSavingEnrollments] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchDashboard = useCallback(async () => {
    if (!isDeveloper) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/dev/dashboard", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.loadError);
        return;
      }

      const reqList: UserProfile[] = Array.isArray(data.requests) ? data.requests : [];
      setRequests(reqList);
      setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      setStudents(Array.isArray(data.students) ? data.students : []);
      setStaff(Array.isArray(data.staff) ? data.staff : []);
      setAllUsers(Array.isArray(data.allUsers) ? data.allUsers : []);
      setClasses(Array.isArray(data.classes) ? data.classes : []);

      const defaults: Record<string, UserRole> = {};
      for (const reqUser of reqList) {
        if (reqUser.id) {
          defaults[reqUser.id] =
            reqUser.requestedRole && ALL_ROLES.includes(reqUser.requestedRole)
              ? reqUser.requestedRole
              : "student";
        }
      }
      setPendingRoleSelection(defaults);
    } catch {
      setErrorMsg(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [isDeveloper, getAuthHeaders, copy.loadError]);

  const openEditUserModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditUserForm({
      fullName: u.name || "",
      email: u.email || "",
      username: u.username || "",
      role: u.role || "student",
      title: u.title || "",
      activeDomain: u.activeDomain || DOMAINS[0],
      password: u.password || "",
    });
    setEditUserModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEditUser(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/dev/users/${encodeURIComponent(editingUser.id)}`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(editUserForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      setEditUserModalOpen(false);
      setEditingUser(null);
      showToast(copy.userUpdated);
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setSavingEditUser(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleUpdateUserRole = async (
    userId: string,
    role: UserRole,
    requestStatus: "approved" | "rejected" | "pending" = role === "guest" ? "rejected" : "approved"
  ) => {
    setBusyUserId(userId);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/dev/users/${encodeURIComponent(userId)}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role, requestStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      showToast(copy.roleUpdated);
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/dev/users", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      setAddUserOpen(false);
      setNewUserForm({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        role: "student",
        title: "",
        activeDomain: DOMAINS[0],
      });
      showToast(copy.userCreated);
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setCreatingUser(false);
    }
  };

  const openCreateClassModal = () => {
    setEditingClass(null);
    setClassForm({
      title: "",
      domain: DOMAINS[0],
      teacherId: teachers[0]?.id || "",
      schedule: "",
      capacity: 30,
      status: "active",
    });
    setClassModalOpen(true);
  };

  const openEditClassModal = (cls: Classroom) => {
    setEditingClass(cls);
    setClassForm({
      title: cls.title,
      domain: cls.domain,
      teacherId: cls.teacherId || "",
      schedule: cls.schedule || "",
      capacity: cls.capacity || 30,
      status: cls.status || "active",
    });
    setClassModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClass(true);
    setErrorMsg(null);
    try {
      const endpoint = editingClass
        ? `/api/dev/classes/${encodeURIComponent(editingClass.id)}`
        : "/api/dev/classes";
      const method = editingClass ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...classForm,
          teacherId: classForm.teacherId || null,
          capacity: Number(classForm.capacity) || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      setClassModalOpen(false);
      showToast(editingClass ? copy.classUpdated : copy.classCreated);
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/dev/classes/${encodeURIComponent(classId)}`, {
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
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    }
  };

  const openEnrollModal = (cls: Classroom) => {
    setEnrollClass(cls);
    setSelectedStudentIds(cls.studentIds || []);
  };

  const handleSaveEnrollments = async () => {
    if (!enrollClass) return;
    setSavingEnrollments(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/dev/classes/${encodeURIComponent(enrollClass.id)}/enrollments`,
        {
          method: "PUT",
          credentials: "include",
          headers: getAuthHeaders(),
          body: JSON.stringify({ studentIds: selectedStudentIds }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || copy.actionError);
        return;
      }
      setEnrollClass(null);
      showToast(copy.enrollmentsUpdated);
      await fetchDashboard();
    } catch {
      setErrorMsg(copy.actionError);
    } finally {
      setSavingEnrollments(false);
    }
  };

  const matchesSearch = (text?: string | null) => {
    if (!searchQuery.trim()) return true;
    return (text || "").toLowerCase().includes(searchQuery.trim().toLowerCase());
  };

  const filterUsers = (list: UserProfile[]) =>
    list.filter(
      (u) =>
        matchesSearch(u.name) ||
        matchesSearch(u.email) ||
        matchesSearch(u.username) ||
        matchesSearch(u.activeDomain)
    );

  const filteredRequests = filterUsers(requests);
  const filteredTeachers = filterUsers(teachers);
  const filteredStudents = filterUsers(students);
  const filteredStaff = filterUsers(staff);
  const filteredAllUsers = filterUsers(allUsers);
  const filteredClasses = classes.filter(
    (c) =>
      matchesSearch(c.title) ||
      matchesSearch(c.domain) ||
      matchesSearch(c.teacherName) ||
      matchesSearch(c.schedule)
  );

  if (!isDeveloper) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="flex-1 bg-slate-50 flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-[#041d37]">{copy.accessDeniedTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {copy.accessDeniedDesc}
          </p>
          <button
            type="button"
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            {copy.backHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-white text-slate-900 w-full flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex-1 w-full">
        {/* 1. MARIN Blue Wave Header */}
        <section className="relative overflow-hidden bg-[#1d8ccc] text-white pt-10 sm:pt-14 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 right-1/4 w-[500px] h-[280px] bg-white/20 rounded-full blur-3xl" />
            <div className="absolute top-10 left-10 w-[380px] h-[240px] bg-sky-200/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{copy.badgeLabel}</span>
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {copy.pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 font-medium max-w-2xl">
                {copy.pageSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
              <button
                type="button"
                onClick={() => setAddUserOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#041d37] hover:bg-[#072a4f] text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>{copy.addUserBtn}</span>
              </button>
              <button
                type="button"
                onClick={openCreateClassModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#041d37] hover:bg-sky-50 text-xs sm:text-sm font-bold shadow-lg cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4 text-[#1d8ccc]" />
                <span>{copy.createClassBtn}</span>
              </button>
            </div>
          </div>

          {/* Animated Wave Bottom */}
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
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                fill="#ffffff"
                opacity="0.3"
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
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* 2. Workspace Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 space-y-6 relative z-10">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setActiveView("requests")}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-lg text-start hover:border-[#1d8ccc] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{copy.tabRequests}</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">{requests.length}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("classes")}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-lg text-start hover:border-[#1d8ccc] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{copy.tabClasses}</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#1d8ccc] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#1d8ccc]">{classes.length}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("teachers")}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-lg text-start hover:border-[#1d8ccc] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{copy.tabTeachers}</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#041d37] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">{teachers.length}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("students")}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-lg text-start hover:border-[#1d8ccc] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{copy.tabStudents}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#041d37]">{students.length}</p>
            </button>
          </div>

          {/* Alerts / Toast */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {toastMsg && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-[#041d37] text-xs sm:text-sm font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1d8ccc] shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Filter Tabs & Search Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: copy.tabAll },
                  { id: "users", label: `${copy.tabUsers} (${allUsers.length})` },
                  { id: "requests", label: `${copy.tabRequests} (${requests.length})` },
                  { id: "classes", label: `${copy.tabClasses} (${classes.length})` },
                  { id: "teachers", label: `${copy.tabTeachers} (${teachers.length})` },
                  { id: "students", label: `${copy.tabStudents} (${students.length})` },
                  { id: "staff", label: `${copy.tabStaff} (${staff.length})` },
                ] as { id: TableViewTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeView === tab.id
                      ? "bg-[#1d8ccc] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
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
                  className={`w-full bg-slate-50 border border-slate-200 rounded-full py-2 ${
                    isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                  } text-xs text-slate-900 focus:outline-none focus:border-[#1d8ccc]`}
                />
              </div>
              <button
                type="button"
                onClick={fetchDashboard}
                disabled={loading}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title={copy.refresh}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#1d8ccc]" />
              <span className="text-sm font-bold">{copy.loadingText}</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* TABLE 0: ALL USERS & PASSWORDS / EDIT */}
              {(activeView === "all" || activeView === "users") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/70 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.usersTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.usersSub}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold self-start sm:self-center">
                      {filteredAllUsers.length} {copy.itemsLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colUser}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colCurrentRole}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colNoteDomain}</th>
                          <th className="py-3.5 px-4 text-start">
                            <div className="flex items-center gap-2">
                              <span>{copy.colPassword}</span>
                              <button
                                type="button"
                                onClick={toggleAllPasswords}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                                title={allPasswordsMasked ? copy.showAllPasswords : copy.hideAllPasswords}
                              >
                                {allPasswordsMasked ? (
                                  <>
                                    <Eye className="w-3 h-3 text-[#1d8ccc]" />
                                    <span>{copy.showAllPasswords}</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-slate-600" />
                                    <span>{copy.hideAllPasswords}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </th>
                          <th className="py-3.5 px-4 text-end">{copy.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAllUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">
                              {copy.emptyRequests}
                            </td>
                          </tr>
                        ) : (
                          filteredAllUsers.map((u) => {
                            const uid = u.id || u.email;
                            return (
                              <tr key={uid} className="hover:bg-sky-50/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#041d37]">
                                    {u.name}
                                    {u.id === profile?.id && (
                                      <span className="ms-2 px-2 py-0.5 rounded-md bg-sky-100 text-[#1d8ccc] text-[10px] font-bold">
                                        {copy.youLabel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500" dir="ltr">
                                    {u.email}
                                    {u.username ? ` • @${u.username}` : ""}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <RoleBadge role={u.role || "guest"} copy={copy} />
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-slate-700">
                                    {u.activeDomain || "—"}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{u.title}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <PasswordCell
                                    user={u}
                                    isMasked={isPasswordMasked(uid)}
                                    onToggleMask={() => toggleMaskPassword(uid)}
                                    onEdit={() => openEditUserModal(u)}
                                    onCopy={(pwd) => {
                                      navigator.clipboard.writeText(pwd);
                                      showToast(copy.passwordCopied);
                                    }}
                                    copy={copy}
                                  />
                                </td>
                                <td className="py-3.5 px-4 text-end">
                                  <button
                                    type="button"
                                    onClick={() => openEditUserModal(u)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-[#1d8ccc] hover:text-white text-[#041d37] text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>{copy.editBtn}</span>
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

              {/* TABLE 1: ASKS FOR REGISTRATIONS */}
              {(activeView === "all" || activeView === "requests") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/70 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.requestsTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.requestsSub}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold self-start sm:self-center">
                      {filteredRequests.length} {copy.itemsLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colUser}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colRequestedRole}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colPassword}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colNoteDomain}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colStatus}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colAssignRole}</th>
                          <th className="py-3.5 px-4 text-end">{copy.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRequests.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                              {copy.emptyRequests}
                            </td>
                          </tr>
                        ) : (
                          filteredRequests.map((u) => {
                            const uid = u.id || u.email;
                            const chosenRole =
                              pendingRoleSelection[uid] || u.requestedRole || "student";
                            const isBusy = busyUserId === uid;
                            return (
                              <tr key={uid} className="hover:bg-sky-50/30 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#041d37]">{u.name}</div>
                                  <div className="text-[11px] text-slate-500" dir="ltr">
                                    {u.email}
                                    {u.username ? ` • @${u.username}` : ""}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <RoleBadge role={u.requestedRole || "student"} copy={copy} />
                                </td>
                                <td className="py-3.5 px-4">
                                  <PasswordCell
                                    user={u}
                                    isMasked={isPasswordMasked(uid)}
                                    onToggleMask={() => toggleMaskPassword(uid)}
                                    onEdit={() => openEditUserModal(u)}
                                    onCopy={(pwd) => {
                                      navigator.clipboard.writeText(pwd);
                                      showToast(copy.passwordCopied);
                                    }}
                                    copy={copy}
                                  />
                                </td>
                                <td className="py-3.5 px-4 max-w-[220px]">
                                  <div className="font-semibold text-slate-700 truncate">
                                    {u.activeDomain || "—"}
                                  </div>
                                  {u.requestNote && (
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {u.requestNote}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span
                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                      u.requestStatus === "rejected"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {u.requestStatus === "rejected"
                                      ? copy.statusRejected
                                      : copy.statusPending}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <select
                                    value={chosenRole}
                                    onChange={(e) =>
                                      setPendingRoleSelection((prev) => ({
                                        ...prev,
                                        [uid]: e.target.value as UserRole,
                                      }))
                                    }
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                                  >
                                    {ALL_ROLES.map((r) => (
                                      <option key={r} value={r}>
                                        {copy.roleNames[r]}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isBusy || !u.id}
                                      onClick={() =>
                                        u.id && handleUpdateUserRole(u.id, chosenRole, "approved")
                                      }
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {isBusy ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      )}
                                      <span>{copy.approveBtn}</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isBusy || !u.id}
                                      onClick={() =>
                                        u.id && handleUpdateUserRole(u.id, "guest", "rejected")
                                      }
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>{copy.rejectBtn}</span>
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

              {/* TABLE 2: CLASSES */}
              {(activeView === "all" || activeView === "classes") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/70 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#1d8ccc] flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.classesTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.classesSub}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateClassModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{copy.createClassBtn}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colClassTitle}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colDomain}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colTeacher}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colSchedule}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colStudentsCount}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colStatus}</th>
                          <th className="py-3.5 px-4 text-end">{copy.colActions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClasses.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                              {copy.emptyClasses}
                            </td>
                          </tr>
                        ) : (
                          filteredClasses.map((cls) => (
                            <tr key={cls.id} className="hover:bg-sky-50/30 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[#041d37]">
                                {cls.title}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                                  {cls.domain}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">
                                  {cls.teacherName || "—"}
                                </div>
                                {cls.teacherEmail && (
                                  <div className="text-[11px] text-slate-400" dir="ltr">
                                    {cls.teacherEmail}
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                {cls.schedule || "—"}
                              </td>
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => openEnrollModal(cls)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-sky-100 text-[#041d37] text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  <Users className="w-3 h-3 text-[#1d8ccc]" />
                                  <span>
                                    {cls.studentCount} / {cls.capacity}
                                  </span>
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    cls.status === "active"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : cls.status === "draft"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {cls.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditClassModal(cls)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-sky-100 text-[#041d37] flex items-center justify-center cursor-pointer"
                                    title={copy.editBtn}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer"
                                    title={copy.deleteBtn}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* TABLE 3: TEACHERS */}
              {(activeView === "all" || activeView === "teachers") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/70 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#041d37] text-white flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.teachersTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.teachersSub}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-[#041d37] text-xs font-bold self-start sm:self-center">
                      {filteredTeachers.length} {copy.itemsLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colUser}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colPassword}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colTitle}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colDomain}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colAssignedClasses}</th>
                          <th className="py-3.5 px-4 text-end">{copy.colAssignRole}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeachers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">
                              {copy.emptyTeachers}
                            </td>
                          </tr>
                        ) : (
                          filteredTeachers.map((teacher) => {
                            const tid = teacher.id || teacher.email;
                            const classCount = classes.filter(
                              (c) => c.teacherId === teacher.id
                            ).length;
                            return (
                              <tr
                                key={tid}
                                className="hover:bg-sky-50/30 transition-colors"
                              >
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#041d37]">{teacher.name}</div>
                                  <div className="text-[11px] text-slate-500" dir="ltr">
                                    {teacher.email}
                                    {teacher.username ? ` • @${teacher.username}` : ""}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <PasswordCell
                                    user={teacher}
                                    isMasked={isPasswordMasked(tid)}
                                    onToggleMask={() => toggleMaskPassword(tid)}
                                    onEdit={() => openEditUserModal(teacher)}
                                    onCopy={(pwd) => {
                                      navigator.clipboard.writeText(pwd);
                                      showToast(copy.passwordCopied);
                                    }}
                                    copy={copy}
                                  />
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">{teacher.title}</td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                                    {teacher.activeDomain || "—"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-[#041d37]">
                                  {classCount}
                                </td>
                                <td className="py-3.5 px-4 text-end">
                                  <div className="flex items-center justify-end gap-2">
                                    <select
                                      value={teacher.role || "teacher"}
                                      disabled={busyUserId === teacher.id || !teacher.id}
                                      onChange={(e) =>
                                        teacher.id &&
                                        handleUpdateUserRole(teacher.id, e.target.value as UserRole)
                                      }
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                                    >
                                      {ALL_ROLES.map((r) => (
                                        <option key={r} value={r}>
                                          {copy.roleNames[r]}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => openEditUserModal(teacher)}
                                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#1d8ccc] hover:text-white text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                                      title={copy.editBtn}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
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

              {/* TABLE 4: STUDENTS */}
              {(activeView === "all" || activeView === "students") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-sky-50/70 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.studentsTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.studentsSub}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-center">
                      {filteredStudents.length} {copy.itemsLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colUser}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colPassword}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colDomain}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colProgress}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colEnrolledClasses}</th>
                          <th className="py-3.5 px-4 text-end">{copy.colAssignRole}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">
                              {copy.emptyStudents}
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => {
                            const sid = student.id || student.email;
                            const enrolledCount = classes.filter((c) =>
                              student.id ? c.studentIds.includes(student.id) : false
                            ).length;
                            return (
                              <tr
                                key={sid}
                                className="hover:bg-sky-50/30 transition-colors"
                              >
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-[#041d37]">{student.name}</div>
                                  <div className="text-[11px] text-slate-500" dir="ltr">
                                    {student.email}
                                    {student.username ? ` • @${student.username}` : ""}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <PasswordCell
                                    user={student}
                                    isMasked={isPasswordMasked(sid)}
                                    onToggleMask={() => toggleMaskPassword(sid)}
                                    onEdit={() => openEditUserModal(student)}
                                    onCopy={(pwd) => {
                                      navigator.clipboard.writeText(pwd);
                                      showToast(copy.passwordCopied);
                                    }}
                                    copy={copy}
                                  />
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                                    {student.activeDomain || "—"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-bold text-[#041d37]">
                                    {student.xp} XP
                                  </span>
                                  <span className="text-slate-400 mx-1">•</span>
                                  <span className="text-slate-600">
                                    {student.completedModules.length} {copy.modulesWord}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-[#1d8ccc]">
                                  {enrolledCount}
                                </td>
                                <td className="py-3.5 px-4 text-end">
                                  <div className="flex items-center justify-end gap-2">
                                    <select
                                      value={student.role || "student"}
                                      disabled={busyUserId === student.id || !student.id}
                                      onChange={(e) =>
                                        student.id &&
                                        handleUpdateUserRole(student.id, e.target.value as UserRole)
                                      }
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc]"
                                    >
                                      {ALL_ROLES.map((r) => (
                                        <option key={r} value={r}>
                                          {copy.roleNames[r]}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => openEditUserModal(student)}
                                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#1d8ccc] hover:text-white text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                                      title={copy.editBtn}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
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

              {/* STAFF TABLE: ADMINS & DEVELOPERS */}
              {(activeView === "all" || activeView === "staff") && (
                <section className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-[#041d37]">
                          {copy.staffTitle}
                        </h2>
                        <p className="text-xs text-slate-500">{copy.staffSub}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold self-start sm:self-center">
                      {filteredStaff.length} {copy.itemsLabel}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80">
                        <tr>
                          <th className="py-3.5 px-4 text-start">{copy.colUser}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colPassword}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colTitle}</th>
                          <th className="py-3.5 px-4 text-start">{copy.colCurrentRole}</th>
                          <th className="py-3.5 px-4 text-end">{copy.colAssignRole}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStaff.map((member) => {
                          const mid = member.id || member.email;
                          const isSelf = member.id === profile.id;
                          return (
                            <tr
                              key={mid}
                              className="hover:bg-sky-50/30 transition-colors"
                            >
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#041d37]">
                                  {member.name}
                                  {isSelf ? ` (${copy.youLabel})` : ""}
                                </div>
                                <div className="text-[11px] text-slate-500" dir="ltr">
                                  {member.email}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <PasswordCell
                                  user={member}
                                  isMasked={isPasswordMasked(mid)}
                                  onToggleMask={() => toggleMaskPassword(mid)}
                                  onEdit={() => openEditUserModal(member)}
                                  onCopy={(pwd) => {
                                    navigator.clipboard.writeText(pwd);
                                    showToast(copy.passwordCopied);
                                  }}
                                  copy={copy}
                                />
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">{member.title}</td>
                              <td className="py-3.5 px-4">
                                <RoleBadge role={member.role || "admin"} copy={copy} />
                              </td>
                              <td className="py-3.5 px-4 text-end">
                                <div className="flex items-center justify-end gap-2">
                                  <select
                                    value={member.role || "admin"}
                                    disabled={busyUserId === member.id || !member.id || isSelf}
                                    onChange={(e) =>
                                      member.id &&
                                      handleUpdateUserRole(member.id, e.target.value as UserRole)
                                    }
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#041d37] focus:outline-none focus:border-[#1d8ccc] disabled:opacity-50"
                                  >
                                    {ALL_ROLES.map((r) => (
                                      <option key={r} value={r}>
                                        {copy.roleNames[r]}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => openEditUserModal(member)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#1d8ccc] hover:text-white text-[#041d37] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                                    title={copy.editBtn}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#041d37] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1d8ccc]" />
                <span>{copy.addUserBtn}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddUserOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.firstName} *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) =>
                      setNewUserForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.lastName} *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) =>
                      setNewUserForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.username}</label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) =>
                      setNewUserForm((f) => ({ ...f, username: e.target.value }))
                    }
                    dir="ltr"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colAssignRole} *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) =>
                      setNewUserForm((f) => ({ ...f, role: e.target.value as UserRole }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#041d37] focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {copy.roleNames[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.emailLabel} *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((f) => ({ ...f, email: e.target.value }))}
                  dir="ltr"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.passwordLabel} *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                  dir="ltr"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colTitle}</label>
                  <input
                    type="text"
                    value={newUserForm.title}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colDomain}</label>
                  <select
                    value={newUserForm.activeDomain}
                    onChange={(e) =>
                      setNewUserForm((f) => ({ ...f, activeDomain: e.target.value }))
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
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddUserOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {creatingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{copy.saveUserBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLASS MODAL */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#041d37] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#1d8ccc]" />
                <span>{editingClass ? copy.editClassTitle : copy.createClassBtn}</span>
              </h3>
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.colClassTitle} *</label>
                <input
                  type="text"
                  required
                  value={classForm.title}
                  onChange={(e) => setClassForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colDomain}</label>
                  <select
                    value={classForm.domain}
                    onChange={(e) => setClassForm((f) => ({ ...f, domain: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colTeacher}</label>
                  <select
                    value={classForm.teacherId}
                    onChange={(e) => setClassForm((f) => ({ ...f, teacherId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    <option value="">—</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colSchedule}</label>
                  <input
                    type="text"
                    value={classForm.schedule}
                    onChange={(e) => setClassForm((f) => ({ ...f, schedule: e.target.value }))}
                    placeholder="Lun & Mer 18:00"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.capacityLabel}</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={classForm.capacity}
                    onChange={(e) =>
                      setClassForm((f) => ({ ...f, capacity: Number(e.target.value) || 30 }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.colStatus}</label>
                <select
                  value={classForm.status}
                  onChange={(e) =>
                    setClassForm((f) => ({
                      ...f,
                      status: e.target.value as "active" | "draft" | "archived",
                    }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                >
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingClass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{copy.saveBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENTS MODAL */}
      {enrollClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#041d37]">
                {copy.manageStudentsTitle}: {enrollClass.title}
              </h3>
              <button
                type="button"
                onClick={() => setEnrollClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {students.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">{copy.emptyStudents}</p>
              ) : (
                students.map((st) => {
                  if (!st.id) return null;
                  const checked = selectedStudentIds.includes(st.id);
                  return (
                    <label
                      key={st.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-sky-50/50 cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#041d37]">{st.name}</div>
                        <div className="text-[11px] text-slate-500" dir="ltr">
                          {st.email}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (!st.id) return;
                          setSelectedStudentIds((prev) =>
                            e.target.checked
                              ? [...prev, st.id!]
                              : prev.filter((id) => id !== st.id)
                          );
                        }}
                        className="w-4 h-4 accent-[#1d8ccc]"
                      />
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEnrollClass(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {copy.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleSaveEnrollments}
                disabled={savingEnrollments}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {savingEnrollments && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{copy.saveBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#041d37] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1d8ccc]" />
                <span>{copy.editUserTitle}: {editingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.firstName} / {copy.colUser}</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.fullName}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.username}</label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, username: e.target.value }))}
                    dir="ltr"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, email: e.target.value }))}
                    dir="ltr"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colAssignRole}</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-[#041d37] focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {copy.roleNames[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colTitle}</label>
                  <input
                    type="text"
                    value={editUserForm.title}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#041d37]">{copy.colDomain}</label>
                  <select
                    value={editUserForm.activeDomain}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, activeDomain: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#041d37]">{copy.realPasswordLabel}</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-left font-mono focus:bg-white focus:outline-none focus:border-[#1d8ccc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1d8ccc] cursor-pointer"
                    title={showEditPassword ? copy.hidePassword : copy.showPassword}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">{copy.newPasswordHint}</p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {copy.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={savingEditUser}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#041d37] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingEditUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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

function RoleBadge({
  role,
  copy,
}: {
  role: UserRole;
  copy: ReturnType<typeof useDeveloperCopy>;
}) {
  const styles: Record<UserRole, string> = {
    guest: "bg-slate-100 text-slate-700",
    student: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    teacher: "bg-sky-50 text-[#1d8ccc] border border-sky-200",
    admin: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    developer: "bg-[#041d37] text-white",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[role]}`}>
      {copy.roleNames[role]}
    </span>
  );
}

interface PasswordCellProps {
  user: UserProfile;
  isMasked: boolean;
  onToggleMask: () => void;
  onEdit: () => void;
  onCopy: (pwd: string) => void;
  copy: ReturnType<typeof useDeveloperCopy>;
}

function PasswordCell({
  user,
  isMasked,
  onToggleMask,
  onEdit,
  onCopy,
  copy,
}: PasswordCellProps) {
  const hasPassword = Boolean(user.password && user.password.trim().length > 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isMasked ? (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-slate-400 border border-sky-100 select-none tracking-widest">
          ••••••••
        </span>
      ) : hasPassword ? (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 select-all tracking-wide">
          {user.password}
        </span>
      ) : (
        <span className="font-sans text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
          {copy.passwordNotSet}
        </span>
      )}

      {/* Eye toggle button - Unconditionally rendered for ALL users */}
      <button
        type="button"
        onClick={onToggleMask}
        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
        title={isMasked ? copy.showPassword : copy.hidePassword}
      >
        {isMasked ? (
          <Eye className="w-3.5 h-3.5 text-[#1d8ccc]" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-slate-600" />
        )}
      </button>

      {/* If revealed and has password, show Copy button */}
      {!isMasked && hasPassword && (
        <button
          type="button"
          onClick={() => onCopy(user.password!)}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          title={copy.copyPassword}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}

      {/* If revealed and password not set, show quick Set button */}
      {!isMasked && !hasPassword && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1d8ccc] hover:bg-[#041d37] text-white text-[10px] font-bold cursor-pointer transition-colors"
          title={copy.setPassword}
        >
          <Key className="w-3 h-3" />
          <span>{copy.setPassword}</span>
        </button>
      )}
    </div>
  );
}

function useDeveloperCopy(language: "fr" | "ar" | "en") {
  if (language === "ar") {
    return {
      badgeLabel: "لوحة تحكم المطور",
      pageTitle: "إدارة المنصة والأدوار والفصول",
      pageSubtitle:
        "مراجعة طلبات التسجيل، إضافة المستخدمين وتحديد أدوارهم، وإدارة الفصول والأساتذة والطلاب مباشرة.",
      addUserBtn: "إضافة مستخدم",
      createClassBtn: "إنشاء فصل",
      editClassTitle: "تعديل الفصل",
      manageStudentsTitle: "إدارة طلاب الفصل",
      tabAll: "جميع الجداول",
      tabUsers: "جميع المستخدمين",
      usersTitle: "جميع المستخدمين وكلمات المرور",
      usersSub: "عرض وإدارة جميع حسابات المنصة وصلاحياتهم وكلمات المرور.",
      colPassword: "كلمة المرور الحقيقية",
      realPasswordLabel: "كلمة المرور الحقيقية",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      copyPassword: "نسخ كلمة المرور",
      passwordCopied: "تم نسخ كلمة المرور إلى الحافظة!",
      passwordNotSet: "غير مسجل بعد",
      setPassword: "تعيين",
      showAllPasswords: "إظهار الكل",
      hideAllPasswords: "إخفاء الكل",
      editUserTitle: "تعديل حساب المستخدم",
      newPasswordHint: "يمكنك تعديل كلمة المرور هنا وسيتم تحديثها تلقائياً مع تشفير Bcrypt.",
      userUpdated: "تم تحديث بيانات المستخدم بنجاح.",
      tabRequests: "طلبات التسجيل",
      tabClasses: "الفصول",
      tabTeachers: "الأساتذة",
      tabStudents: "الطلاب",
      tabStaff: "الإدارة والمطورون",
      requestsTitle: "طلبات التسجيل (الزوار)",
      requestsSub: "المستخدمون الجدد يدخلون كزوار بانتظار اعتمادك لدورهم.",
      classesTitle: "جدول الفصول الدراسية",
      classesSub: "تنظيم الفصول وتعيين الأساتذة وتسجيل الطلاب.",
      teachersTitle: "جدول الأساتذة",
      teachersSub: "قائمة الأساتذة المعتمدين وصلاحياتهم.",
      studentsTitle: "جدول الطلاب",
      studentsSub: "قائمة الطلاب النشطين وتقدمهم.",
      staffTitle: "الإدارة والمطورون",
      staffSub: "أصحاب صلاحيات الإدارة وتطوير المنصة.",
      itemsLabel: "عنصر",
      colUser: "المستخدم",
      colRequestedRole: "الدور المطلوب",
      colNoteDomain: "التخصص / الملاحظة",
      colStatus: "الحالة",
      colAssignRole: "تعيين الدور",
      colActions: "إجراءات",
      colClassTitle: "اسم الفصل",
      colDomain: "التخصص",
      colTeacher: "الأستاذ",
      colSchedule: "الجدول الزمني",
      colStudentsCount: "الطلاب",
      colTitle: "الصفة",
      colAssignedClasses: "الفصول المسندة",
      colProgress: "التقدم",
      colEnrolledClasses: "الفصول المسجل بها",
      colCurrentRole: "الدور الحالي",
      approveBtn: "اعتماد",
      rejectBtn: "رفض",
      editBtn: "تعديل",
      deleteBtn: "حذف",
      cancelBtn: "إلغاء",
      saveBtn: "حفظ",
      saveUserBtn: "إنشاء المستخدم",
      firstName: "الاسم الأول",
      lastName: "اللقب",
      username: "اسم المستخدم",
      emailLabel: "البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      capacityLabel: "السعة",
      statusPending: "قيد الانتظار",
      statusRejected: "مرفوض",
      searchPlaceholder: "بحث بالاسم، البريد، التخصص...",
      refresh: "تحديث",
      loadingText: "جاري تحميل بيانات لوحة المطور...",
      emptyRequests: "لا توجد طلبات تسجيل معلّقة حالياً.",
      emptyClasses: "لا توجد فصول منشأة بعد.",
      emptyTeachers: "لا يوجد أساتذة مسجلون بعد.",
      emptyStudents: "لا يوجد طلاب مسجلون بعد.",
      modulesWord: "وحدات",
      youLabel: "أنت",
      roleUpdated: "تم تحديث دور المستخدم بنجاح.",
      userCreated: "تم إنشاء المستخدم وتعيين دوره بنجاح.",
      classCreated: "تم إنشاء الفصل بنجاح.",
      classUpdated: "تم تحديث الفصل بنجاح.",
      classDeleted: "تم حذف الفصل.",
      enrollmentsUpdated: "تم تحديث قائمة طلاب الفصل.",
      loadError: "تعذر تحميل بيانات لوحة المطور.",
      actionError: "تعذر تنفيذ العملية المطلوبة.",
      accessDeniedTitle: "وصول مقصور على المطور",
      accessDeniedDesc: "هذه اللوحة متاحة فقط للحسابات التي تحمل دور المطور (developer).",
      backHome: "العودة للرئيسية",
      roleNames: {
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
      badgeLabel: "Developer Control Panel",
      pageTitle: "Users, Roles & Classes Dashboard",
      pageSubtitle:
        "Review guest registration requests, add users with assigned roles, and manage classes, teachers, and students.",
      addUserBtn: "Add User",
      createClassBtn: "Create Class",
      editClassTitle: "Edit Class",
      manageStudentsTitle: "Manage Class Students",
      tabAll: "All Tables",
      tabUsers: "All Users",
      usersTitle: "All Users & Passwords Directory",
      usersSub: "View and edit all platform user accounts, roles, and credentials.",
      colPassword: "Real Password",
      realPasswordLabel: "Real Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      copyPassword: "Copy password",
      passwordCopied: "Password copied to clipboard!",
      passwordNotSet: "Not set yet",
      setPassword: "Set",
      showAllPasswords: "Show all",
      hideAllPasswords: "Hide all",
      editUserTitle: "Edit User Account",
      newPasswordHint: "Modify this field to update the password (updates both real password and bcrypt hash).",
      userUpdated: "User account updated successfully.",
      tabRequests: "Registration Requests",
      tabClasses: "Classes",
      tabTeachers: "Teachers",
      tabStudents: "Students",
      tabStaff: "Admins & Devs",
      requestsTitle: "Registration Requests (Guests)",
      requestsSub: "New registrants enter as Guests awaiting your role approval.",
      classesTitle: "Classes Directory",
      classesSub: "Manage cohorts, assigned teachers, and enrolled students.",
      teachersTitle: "Teachers Directory",
      teachersSub: "Approved instructors and class assignments.",
      studentsTitle: "Students Directory",
      studentsSub: "Approved learners and learning progress.",
      staffTitle: "Admins & Developers",
      staffSub: "Platform administrators and developers.",
      itemsLabel: "items",
      colUser: "User",
      colRequestedRole: "Requested Role",
      colNoteDomain: "Track / Note",
      colStatus: "Status",
      colAssignRole: "Assign Role",
      colActions: "Actions",
      colClassTitle: "Class Title",
      colDomain: "Track",
      colTeacher: "Teacher",
      colSchedule: "Schedule",
      colStudentsCount: "Students",
      colTitle: "Title",
      colAssignedClasses: "Assigned Classes",
      colProgress: "Progress",
      colEnrolledClasses: "Enrolled Classes",
      colCurrentRole: "Current Role",
      approveBtn: "Approve",
      rejectBtn: "Reject",
      editBtn: "Edit",
      deleteBtn: "Delete",
      cancelBtn: "Cancel",
      saveBtn: "Save",
      saveUserBtn: "Create User",
      firstName: "First Name",
      lastName: "Last Name",
      username: "Username",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      capacityLabel: "Capacity",
      statusPending: "Pending",
      statusRejected: "Rejected",
      searchPlaceholder: "Search name, email, domain...",
      refresh: "Refresh",
      loadingText: "Loading developer dashboard...",
      emptyRequests: "No pending registration requests.",
      emptyClasses: "No classes created yet.",
      emptyTeachers: "No teachers assigned yet.",
      emptyStudents: "No students assigned yet.",
      modulesWord: "modules",
      youLabel: "You",
      roleUpdated: "User role updated successfully.",
      userCreated: "User created with assigned role.",
      classCreated: "Class created successfully.",
      classUpdated: "Class updated successfully.",
      classDeleted: "Class deleted.",
      enrollmentsUpdated: "Class enrollments updated.",
      loadError: "Unable to load developer dashboard.",
      actionError: "Action failed.",
      accessDeniedTitle: "Developer Access Required",
      accessDeniedDesc: "This dashboard is restricted exclusively to Developer accounts.",
      backHome: "Back to Home",
      roleNames: {
        guest: "Guest",
        student: "Student",
        teacher: "Teacher",
        admin: "Admin",
        developer: "Developer",
      } as Record<UserRole, string>,
    };
  }
  return {
    badgeLabel: "Panneau Développeur",
    pageTitle: "Gestion des Rôles, Utilisateurs & Classes",
    pageSubtitle:
      "Validez les demandes d'inscription, ajoutez des utilisateurs avec leur rôle et gérez les classes, formateurs et étudiants.",
    addUserBtn: "Ajouter un utilisateur",
    createClassBtn: "Créer une classe",
    editClassTitle: "Modifier la classe",
    manageStudentsTitle: "Étudiants de la classe",
    tabAll: "Tous les tableaux",
    tabUsers: "Tous les utilisateurs",
    usersTitle: "Répertoire Global des Utilisateurs & Mots de passe",
    usersSub: "Visualisez et modifiez l'ensemble des comptes, rôles et mots de passe.",
    colPassword: "Mot de passe réel",
    realPasswordLabel: "Mot de passe réel",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    copyPassword: "Copier le mot de passe",
    passwordCopied: "Mot de passe copié dans le presse-papier !",
    passwordNotSet: "Non défini",
    setPassword: "Définir",
    showAllPasswords: "Tout afficher",
    hideAllPasswords: "Tout masquer",
    editUserTitle: "Modifier le compte utilisateur",
    newPasswordHint: "Modifiez ce champ pour changer le mot de passe (met à jour le mot de passe réel et le hash bcrypt).",
    userUpdated: "Compte utilisateur mis à jour avec succès.",
    tabRequests: "Demandes d'inscription",
    tabClasses: "Classes",
    tabTeachers: "Formateurs",
    tabStudents: "Étudiants",
    tabStaff: "Admins & Devs",
    requestsTitle: "Demandes d'inscription (Invités)",
    requestsSub:
      "Les nouveaux inscrits entrent en Invité en attente de validation de leur rôle.",
    classesTitle: "Tableau des Classes",
    classesSub: "Organisez les classes, formateurs assignés et étudiants inscrits.",
    teachersTitle: "Tableau des Formateurs",
    teachersSub: "Formateurs validés et classes assignées.",
    studentsTitle: "Tableau des Étudiants",
    studentsSub: "Étudiants actifs et suivi de progression.",
    staffTitle: "Administrateurs & Développeurs",
    staffSub: "Comptes disposant des droits d'administration ou de développement.",
    itemsLabel: "éléments",
    colUser: "Utilisateur",
    colRequestedRole: "Rôle demandé",
    colNoteDomain: "Domaine / Note",
    colStatus: "Statut",
    colAssignRole: "Attribuer le rôle",
    colActions: "Actions",
    colClassTitle: "Nom de la classe",
    colDomain: "Domaine",
    colTeacher: "Formateur",
    colSchedule: "Horaires",
    colStudentsCount: "Étudiants",
    colTitle: "Titre",
    colAssignedClasses: "Classes assignées",
    colProgress: "Progression",
    colEnrolledClasses: "Classes suivies",
    colCurrentRole: "Rôle actuel",
    approveBtn: "Valider",
    rejectBtn: "Refuser",
    editBtn: "Modifier",
    deleteBtn: "Supprimer",
    cancelBtn: "Annuler",
    saveBtn: "Enregistrer",
    saveUserBtn: "Créer l'utilisateur",
    firstName: "Prénom",
    lastName: "Nom",
    username: "Nom d'utilisateur",
    emailLabel: "Adresse Email",
    passwordLabel: "Mot de passe",
    capacityLabel: "Capacité",
    statusPending: "En attente",
    statusRejected: "Refusé",
    searchPlaceholder: "Rechercher nom, email, domaine...",
    refresh: "Actualiser",
    loadingText: "Chargement du tableau développeur...",
    emptyRequests: "Aucune demande d'inscription en attente.",
    emptyClasses: "Aucune classe créée pour le moment.",
    emptyTeachers: "Aucun formateur enregistré.",
    emptyStudents: "Aucun étudiant enregistré.",
    modulesWord: "modules",
    youLabel: "Vous",
    roleUpdated: "Rôle utilisateur mis à jour.",
    userCreated: "Utilisateur créé avec le rôle sélectionné.",
    classCreated: "Classe créée avec succès.",
    classUpdated: "Classe mise à jour.",
    classDeleted: "Classe supprimée.",
    enrollmentsUpdated: "Inscriptions de la classe mises à jour.",
    loadError: "Impossible de charger le tableau développeur.",
    actionError: "Erreur lors de l'opération.",
    accessDeniedTitle: "Accès réservé au Développeur",
    accessDeniedDesc:
      "Ce tableau de bord est exclusivement réservé aux comptes ayant le rôle Développeur.",
    backHome: "Retour à l'accueil",
    roleNames: {
      guest: "Invité (Guest)",
      student: "Étudiant (Student)",
      teacher: "Formateur (Teacher)",
      admin: "Admin",
      developer: "Développeur",
    } as Record<UserRole, string>,
  };
}
