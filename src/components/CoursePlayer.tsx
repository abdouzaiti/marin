import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, BookOpen, Bot, Send, Award, Sparkles, HelpCircle, FileText, Check, Loader2, Play } from "lucide-react";
import { TrainingPath, QuizQuestion, UserProfile } from "../types";

interface CoursePlayerProps {
  activePath: TrainingPath;
  userProfile: UserProfile;
  completeModule: (moduleId: string) => void;
  goBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  activePath,
  userProfile,
  completeModule,
  goBack
}) => {
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const currentModule = activePath.modules[selectedModuleIdx] || activePath.modules[0];

  // AI Tutor chat state
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: `Bonjour ! Je suis votre tuteur IA BOTSCHAFT. Posez-moi toutes vos questions sur le module "${currentModule?.title}" ou demandez des cas pratiques.` }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || chatLoading) return;

    const userMsg = inputQuery;
    setInputQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: activePath.title,
          moduleTitle: currentModule.title,
          messages,
          userQuestion: userMsg
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue lors de la communication avec le tuteur IA." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenQuiz = async () => {
    setQuizLoading(true);
    setQuizOpen(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuizIdx(0);

    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: activePath.title,
          moduleTitle: currentModule.title,
          topic: currentModule.topics[0] || currentModule.title
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuizQuestions(data.quiz || []);
    } catch (err) {
      setQuizQuestions([
        {
          id: "q1",
          question: "Quel est le principe fondamental associé à ce module ?",
          options: ["Option A (Standard)", "Option B (Avancé)", "Option C (Alternative)", "Option D (Incorrect)"],
          correctAnswerIndex: 0,
          explanation: "L'option A correspond aux normes professionnelles reconnues."
        }
      ]);
    } finally {
      setQuizLoading(false);
    }
  };

  const isCompleted = userProfile.completedModules.includes(currentModule.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Tableau de Bord</span>
        </button>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {activePath.title}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Course Content & Syllabus */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Syllabus Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 overflow-x-auto">
            {activePath.modules.map((mod, idx) => {
              const done = userProfile.completedModules.includes(mod.id);
              const isSelected = selectedModuleIdx === idx;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : done
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>M{idx + 1}: {mod.title}</span>
                  {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {/* Current Module Content Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Module {selectedModuleIdx + 1} • {currentModule.duration}</span>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{currentModule.title}</h1>
              </div>
              {isCompleted ? (
                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Validé (+100 XP)
                </span>
              ) : (
                <button
                  onClick={() => completeModule(currentModule.id)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Marquer comme validé
                </button>
              )}
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p className="text-base font-medium text-slate-800">{currentModule.description}</p>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Points Clés du Programme
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentModule.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm bg-white p-2.5 rounded-lg border border-slate-200 font-medium">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" /> Cas Pratique en Entreprise
                </h3>
                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl text-sm text-amber-900">
                  <p className="font-semibold mb-1">Mission Pratique :</p>
                  <p>{currentModule.practicalProject}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Testez vos connaissances avec le quiz intelligent</span>
              <button
                onClick={handleOpenQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Lancer le Quiz Certifiant IA
              </button>
            </div>
          </div>

        </div>

        {/* Right Col: AI Tutor Chat Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[650px]">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Tuteur IA BOTSCHAFT</h2>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> En ligne 24/7
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"}`}>
                  {msg.role === "user" ? userProfile.name.charAt(0) : "AI"}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">AI</div>
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Réflexion pédagogique...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Posez votre question sur le cours..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* AI Quiz Modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Quiz Certifiant IA</h2>
                  <p className="text-xs text-slate-500">{currentModule.title}</p>
                </div>
              </div>
              <button
                onClick={() => setQuizOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quizLoading ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-sm font-medium text-slate-600">Génération des questions par l'IA...</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-6">
                {!quizSubmitted ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Question {currentQuizIdx + 1} sur {quizQuestions.length}</span>
                      <span>Progression</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {quizQuestions[currentQuizIdx].question}
                    </h3>

                    <div className="space-y-2.5">
                      {quizQuestions[currentQuizIdx].options.map((option, optIdx) => {
                        const isSelected = selectedAnswers[currentQuizIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuizIdx]: optIdx })}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            <span>{option}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"}`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setCurrentQuizIdx(Math.max(0, currentQuizIdx - 1))}
                        disabled={currentQuizIdx === 0}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer"
                      >
                        Précédent
                      </button>

                      {currentQuizIdx < quizQuestions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuizIdx(currentQuizIdx + 1)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          Suivant
                        </button>
                      ) : (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-md"
                        >
                          Soumettre mes réponses
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900">Quiz Terminé !</h3>
                      <p className="text-sm text-slate-600">
                        Vos réponses ont été analysées par l'IA. Vous avez validé les compétences de ce module.
                      </p>
                    </div>

                    <div className="space-y-4 text-left max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
                      {quizQuestions.map((q, qIdx) => {
                        const userAns = selectedAnswers[qIdx];
                        const isCorrect = userAns === q.correctAnswerIndex;
                        return (
                          <div key={q.id} className="text-xs space-y-1 pb-3 border-b border-slate-200 last:border-none">
                            <p className="font-bold text-slate-900">Q{qIdx + 1}: {q.question}</p>
                            <p className={isCorrect ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                              Votre réponse : {q.options[userAns] ?? "Aucune"} {isCorrect ? "✓" : "✗"}
                            </p>
                            {!isCorrect && (
                              <p className="text-slate-600">Bonne réponse : <span className="font-semibold">{q.options[q.correctAnswerIndex]}</span></p>
                            )}
                            <p className="text-slate-500 italic">{q.explanation}</p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setQuizOpen(false);
                        completeModule(currentModule.id);
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm cursor-pointer"
                    >
                      Enregistrer mes XP et Continuer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-8">Aucune question disponible.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
