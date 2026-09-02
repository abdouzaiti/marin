import React from "react";
import { Sparkles, BookOpen, Award, ArrowRight, Play, CheckCircle2, Clock, Zap, Bot, Compass } from "lucide-react";
import { UserProfile, TrainingPath } from "../types";
import { DOMAIN_CATEGORIES, PRESET_PATHS } from "../data/domains";

interface DashboardProps {
  userProfile: UserProfile;
  setActiveTab: (tab: string) => void;
  selectPath: (path: TrainingPath, domainName: string) => void;
  startCourse: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  setActiveTab,
  selectPath,
  startCourse
}) => {
  const activePath = userProfile.enrolledPath;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Plateforme IA Personnalisée BOTSCHAFT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Bonjour, {userProfile.name} 👋
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Votre parcours professionnel est optimisé par l'IA pour s'adapter à votre rythme, vos objectifs et vos cas pratiques en entreprise.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            {activePath ? (
              <button
                onClick={startCourse}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Reprendre ma formation
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("catalog")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Choisir une formation professionnelle
              </button>
            )}
            <button
              onClick={() => setActiveTab("generator")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/20 text-sm backdrop-blur-md cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              Générer un parcours sur-mesure par IA
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parcours Actif</p>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[200px]">
              {activePath ? activePath.title : "Aucun parcours"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modules Validés</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {userProfile.completedModules.length} <span className="text-xs font-normal text-slate-500">/ modules</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Points XP</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{userProfile.xp} XP</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Série Active</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{userProfile.streak} Jours</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-rose-500" />
          </div>
        </div>
      </div>

      {/* Current Active Path Progress */}
      {activePath && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                En cours
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{activePath.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{activePath.description}</p>
            </div>
            <button
              onClick={startCourse}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Continuer l'apprentissage
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Modules du Programme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activePath.modules.map((mod, idx) => {
                const isCompleted = userProfile.completedModules.includes(mod.id);
                return (
                  <div key={mod.id} className={`p-4 rounded-xl border ${isCompleted ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'} space-y-2 relative`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Module {idx + 1}</span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validé
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> {mod.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{mod.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{mod.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Professional Domains Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Domaines de Formation Professionnelle</h2>
            <p className="text-sm text-slate-600">Explorez nos filières phares ou créez votre parcours personnalisé par IA</p>
          </div>
          <button
            onClick={() => setActiveTab("catalog")}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOMAIN_CATEGORIES.map((domain) => {
            const preset = PRESET_PATHS[domain.id];
            return (
              <div
                key={domain.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${domain.color}`}>
                    {domain.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-xs font-medium text-indigo-600 mt-0.5">{domain.tagline}</p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{domain.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modules Clés :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {domain.popularModules.slice(0, 3).map((mod, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Certification incluse</span>
                  {preset ? (
                    <button
                      onClick={() => selectPath(preset, domain.name)}
                      className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      Démarrer <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("generator")}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      Générer par IA <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
