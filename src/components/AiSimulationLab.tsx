import React, { useState } from "react";
import { Bot, Sparkles, Send, Loader2, Award, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { SimulationEvaluation } from "../types";

export const AiSimulationLab: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("Comptabilité & Finance");
  const [scenarioTitle, setScenarioTitle] = useState("Audit d'un écart de trésorerie inexpliqué de 45 000€");
  const [scenarioDesc, setScenarioDesc] = useState("Vous êtes auditeur senior dans une PME. Lors de la clôture trimestrielle, vous remarquez un écart non justifié de 45 000€ entre le grand livre bancaire et les relevés de la banque. Décrivez votre démarche d'investigation et vos mesures correctrices.");
  const [userAction, setUserAction] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SimulationEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scenarios = [
    {
      domain: "Comptabilité & Finance",
      title: "Audit d'un écart de trésorerie inexpliqué de 45 000€",
      desc: "Vous êtes auditeur senior dans une PME. Lors de la clôture trimestrielle, vous remarquez un écart non justifié de 45 000€ entre le grand livre bancaire et les relevés de la banque. Décrivez votre démarche d'investigation et vos mesures correctrices."
    },
    {
      domain: "Management & Leadership",
      title: "Gestion d'un conflit de charge de travail entre deux chefs de projet",
      desc: "Deux de vos meilleurs chefs de projet se disputent l'allocation des ressources techniques seniors pour leurs projets respectifs, menaçant la livraison des deux clients. Comment menez-vous l'entretien de médiation ?"
    },
    {
      domain: "Agence de Voyage & Tourisme",
      title: "Annulation de vol de dernière minute pour un groupe VIP de 15 personnes",
      desc: "À 2h du départ d'un vol long-courrier vers Tokyo pour un groupe VIP d'entreprise, la compagnie aérienne annule le vol pour grève. Les clients sont furieux à l'aéroport. Quelle est votre stratégie immédiate de relogement et de prise en charge ?"
    }
  ];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAction.trim() || evaluating) return;

    setEvaluating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/evaluate-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedDomain,
          scenarioTitle,
          userAction
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvaluation(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'évaluation");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 bg-indigo-500/30 px-3 py-1 rounded-full text-indigo-200 text-xs font-semibold">
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulateur Pratique Propulsé par IA</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Lab de Simulation Professionnelle
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
          Mettez vos compétences en pratique face à des situations réelles d'entreprise. Notre IA analyse vos réponses et vous délivre un score et un débriefing d'expert.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Scenario Selector */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Scénarios Disponibles</h2>
          <div className="space-y-3">
            {scenarios.map((scen, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDomain(scen.domain);
                  setScenarioTitle(scen.title);
                  setScenarioDesc(scen.desc);
                  setEvaluation(null);
                  setUserAction("");
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  scenarioTitle === scen.title
                    ? "bg-indigo-50/70 border-indigo-600 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    {scen.domain}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{scen.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{scen.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Simulation Workspace & AI Evaluation */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{selectedDomain}</span>
              <h2 className="text-xl font-bold text-slate-900">{scenarioTitle}</h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {scenarioDesc}
              </p>
            </div>

            <form onSubmit={handleEvaluate} className="space-y-4">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Votre Plan d'Action / Réponse Professionnelle :
              </label>
              <textarea
                rows={6}
                value={userAction}
                onChange={(e) => setUserAction(e.target.value)}
                placeholder="Rédigez votre démarche étape par étape (ex: 1. Vérification des rapprochements bancaires, 2. Contact avec le service comptable, 3. Écriture de régularisation...)"
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              ></textarea>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={evaluating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Évaluation par l'IA en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Soumettre à l'évaluation IA</span>
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

          {/* AI Evaluation Results */}
          {evaluation && (
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-8 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    {evaluation.score}/100
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Évaluation de l'Expert IA BOTSCHAFT</h3>
                    <p className="text-xs text-slate-500">Analyse professionnelle des compétences</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${evaluation.score >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {evaluation.score >= 75 ? 'Maîtrisé avec succès ✓' : 'À perfectionner'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Débriefing Global :</p>
                  <p>{evaluation.feedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Points Forts
                    </h4>
                    <ul className="space-y-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-800 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                    <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Pistes d'Amélioration
                    </h4>
                    <ul className="space-y-1">
                      {evaluation.improvements.map((imp, i) => (
                        <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-0.5">Conseil d'Expert Industrie :</p>
                    <p>{evaluation.expertTip}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
