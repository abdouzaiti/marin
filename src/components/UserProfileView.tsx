import React, { useState } from "react";
import { User, Award, Flame, Zap, BookOpen, CheckCircle2, Calendar, Mail, Briefcase, Sparkles, Trophy, Edit3, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";
import { VideoCourse } from "../data/videoCourses";

interface UserProfileViewProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  courses: VideoCourse[];
  selectCourse: (course: VideoCourse) => void;
  setActiveTab: (tab: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  setUserProfile,
  courses,
  selectCourse,
  setActiveTab
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    title: userProfile.title,
    activeDomain: userProfile.activeDomain || "Comptabilité & Finance"
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev) => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      title: formData.title,
      activeDomain: formData.activeDomain
    }));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const level = Math.floor(userProfile.xp / 300) + 1;
  const progressToNextLevel = ((userProfile.xp % 300) / 300) * 100;

  // Completed courses
  const completedCoursesList = courses.filter((c) =>
    userProfile.completedModules.some((modId) => modId.startsWith(c.id))
  );

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Profile Header Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/70 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md shrink-0">
                {userProfile.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{userProfile.name}</h1>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Membre Certifié
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {userProfile.title}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> {userProfile.email}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Fermer l'édition" : "Modifier le profil"}</span>
              </button>
            </div>
          </div>

          {/* Edit Form Modal/Inline */}
          {isEditing && (
            <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adresse Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Titre / Poste visé</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Domaine de prédilection</label>
                <select
                  value={formData.activeDomain}
                  onChange={(e) => setFormData({ ...formData, activeDomain: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Comptabilité & Finance">Comptabilité & Finance</option>
                  <option value="Management & Leadership">Management & Leadership</option>
                  <option value="Agence de Voyage & Tourisme">Agence de Voyage & Tourisme</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                  <option value="Data Analysis">Data Analysis</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {saveSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Profil mis à jour avec succès.
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Série Active</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-black text-orange-500">{userProfile.streak} Jours</p>
            <p className="text-[11px] text-slate-500 font-medium">Régularité d'apprentissage</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Modules Validés</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{userProfile.completedModules.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Sur les parcours suivis</p>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" /> Badges & Distinctions MARIN Academy
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col items-center text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🎓
              </div>
              <p className="font-bold text-xs text-slate-900">Premier Pas</p>
              <p className="text-[10px] text-slate-500">Première leçon complétée</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🔥
              </div>
              <p className="font-bold text-xs text-slate-900">Assiduité 5j</p>
              <p className="text-[10px] text-slate-500">Série de 5 jours consécutifs</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ⚡
              </div>
              <p className="font-bold text-xs text-slate-900">Expert 500+ XP</p>
              <p className="text-[10px] text-slate-500">Cumul de plus de 500 points</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col items-center text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🎯
              </div>
              <p className="font-bold text-xs text-slate-900">Apprentissage Continu</p>
              <p className="text-[10px] text-slate-500">Validation assidue des modules</p>
            </div>
          </div>
        </div>

        {/* Current & Enrolled Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Vos Formations en Cours
            </h2>
            <button
              onClick={() => setActiveTab("explore")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Explorer d'autres cours →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                onClick={() => selectCourse(course)}
                className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="aspect-video relative bg-slate-900 overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    {course.duration}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{course.domain}</span>
                  <h3 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">{course.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
