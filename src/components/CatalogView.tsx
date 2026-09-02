import React, { useState } from "react";
import { Sparkles, ArrowRight, BookOpen, Clock, Loader2, CheckCircle2, ShieldCheck, Compass, Bot } from "lucide-react";
import { DOMAIN_CATEGORIES, PRESET_PATHS } from "../data/domains";
import { TrainingPath } from "../types";

interface CatalogViewProps {
  selectPath: (path: TrainingPath, domainName: string) => void;
  setActiveTab: (tab: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ selectPath, setActiveTab }) => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("Comptabilité Avancée & Normes IFRS");
  const [levelInput, setLevelInput] = useState("Intermédiaire");
  const [goalInput, setGoalInput] = useState("Devenir Chef Comptable en cabinet ou entreprise internationale");
  const [hoursInput, setHoursInput] = useState("6");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domainInput,
          currentLevel: levelInput,
          goal: goalInput,
          weeklyHours: Number(hoursInput)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la génération");

      selectPath(data, domainInput);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & AI Generator Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-xl">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Générateur de Parcours Intelligent BOTSCHAFT</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Formations Professionnelles & IA Personnalisée
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Que vous souhaitiez vous spécialiser en comptabilité, management, gestion d'agence de voyage ou tout autre domaine, notre IA génère un cursus sur-mesure adapté à votre profil.
          </p>
        </div>
        <button
          onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer whitespace-nowrap"
        >
          <Bot className="w-5 h-5" />
          {isGeneratorOpen ? "Masquer le générateur IA" : "Créer mon parcours IA sur-mesure"}
        </button>
      </div>

      {/* AI Generator Modal / Expandable Card */}
      {isGeneratorOpen && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-8 shadow-lg space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Assistant IA de Conception Pédagogique</h2>
              <p className="text-xs text-slate-500">Décrivez votre projet professionnel, l'IA créera votre cursus complet en quelques secondes.</p>
            </div>
          </div>

          <form onSubmit={handleGeneratePath} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Domaine ou Métier Souhaité
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Ex: Comptabilité IFRS, Management Hôtelier, Agence de Voyage..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Niveau Actuel
              </label>
              <select
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
              >
                <option value="Débutant">Débutant (Reconversion / Premiers pas)</option>
                <option value="Intermédiaire">Intermédiaire (Expérience terrain)</option>
                <option value="Avancé">Avancé (Expertise / Encadrement)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Objectif Professionnel Précis
              </label>
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Ex: Ouvrir ma propre agence, diriger une équipe de 10 personnes, auditer des bilans..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Disponibilité Hebdomadaire (Heures)
              </label>
              <input
                type="number"
                min="2"
                max="40"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>L'IA conçoit votre parcours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Générer mon parcours personnalisé</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Catalog Categories */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Filières Professionnelles Certifiantes</h2>
          <p className="text-sm text-slate-600">Choisissez parmi nos programmes standard ou lancez votre parcours IA</p>
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
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${domain.color}`}>
                      {domain.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                      Certifiant
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{domain.tagline}</p>
                    <p className="text-sm text-slate-600 mt-2">{domain.description}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modules inclus :</span>
                    <ul className="space-y-1">
                      {domain.popularModules.map((mod, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>8 - 12 semaines</span>
                  </div>

                  {preset ? (
                    <button
                      onClick={() => selectPath(preset, domain.name)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      Démarrer <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setDomainInput(domain.name);
                        setIsGeneratorOpen(true);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      Personnaliser par IA <Sparkles className="w-3.5 h-3.5" />
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
