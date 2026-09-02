import React, { useState } from "react";
import { Briefcase, Sparkles, Loader2, Award, CheckCircle2, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react";
import { UserProfile, CareerAdvice } from "../types";

interface CareerAdvisorProps {
  userProfile: UserProfile;
}

export const CareerAdvisorView: React.FC<CareerAdvisorProps> = ({ userProfile }) => {
  const [careerGoal, setCareerGoal] = useState("Directeur Administratif et Financier (DAF) ou Chef Comptable Senior");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<CareerAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/career-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedCourses: userProfile.completedModules,
          careerGoal
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAdvice(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          <span>Orientation & Carrière Propulsée par IA</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Conseil Carrière & Roadmap Professionnelle
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Définissez votre ambition professionnelle. Notre IA analyse vos acquis sur BOTSCHAFT, évalue votre employabilité et vous recommande les certifications clés pour réussir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Input Goal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Votre Objectif de Carrière</h2>
              <p className="text-xs text-slate-500">Personnalisez votre cible professionnelle</p>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Poste ou Rôle Cible
              </label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="Ex: Directeur d'Agence, Chef Comptable, Consultant Senior..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Modules Validés sur BOTSCHAFT
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                {userProfile.completedModules.length > 0 ? (
                  <p className="font-semibold text-emerald-700">✓ {userProfile.completedModules.length} module(s) validé(s) pris en compte</p>
                ) : (
                  <p className="text-slate-500">Aucun module validé pour l'instant (l'IA évaluera votre profil général)</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyse par l'IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Lancer l'analyse de carrière IA</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right 2 Cols: Advice & Roadmap Results */}
        <div className="lg:col-span-2 space-y-6">
          {advice ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Readiness Score Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Indice d'Employabilité IA
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900">{careerGoal}</h3>
                  <p className="text-sm text-slate-600 max-w-md">{advice.marketDemandSummary}</p>
                </div>
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col items-center justify-center shadow-lg shrink-0">
                  <span className="text-3xl font-black">{advice.readinessScore}%</span>
                  <span className="text-[10px] uppercase tracking-widest text-indigo-200 font-semibold mt-1">Prêt pour le poste</span>
                </div>
              </div>

              {/* Grid: Missing Skills & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" /> Compétences à Acquérir
                  </h4>
                  <ul className="space-y-2">
                    {advice.missingSkills.map((skill, i) => (
                      <li key={i} className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200 p-3 rounded-xl flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" /> Certifications Recommandées
                  </h4>
                  <ul className="space-y-2">
                    {advice.recommendedCertifications.map((cert, i) => (
                      <li key={i} className="text-xs text-slate-700 bg-indigo-50/60 border border-indigo-200 p-3 rounded-xl flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Interview Tips */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Conseils pour Entretiens & Négociation Salariale
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {advice.interviewTips.map((tip, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                      <p className="font-bold text-slate-900 mb-1">Conseil #{i + 1}</p>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Lancez votre diagnostic de carrière</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Entrez votre objectif ci-contre et laissez l'IA analyser votre employabilité sur le marché du travail.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
