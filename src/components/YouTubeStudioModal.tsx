import React, { useState } from "react";
import { Sparkles, Loader2, Bot, Video, X } from "lucide-react";
import { VideoCourse } from "../data/videoCourses";

interface YouTubeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseGenerated: (newCourse: VideoCourse) => void;
}

export const YouTubeStudioModal: React.FC<YouTubeStudioModalProps> = ({
  isOpen,
  onClose,
  onCourseGenerated
}) => {
  const [domainInput, setDomainInput] = useState("Management d'Équipe Agile & Scrum");
  const [levelInput, setLevelInput] = useState("Intermédiaire");
  const [goalInput, setGoalInput] = useState("Devenir Scrum Master certifié et animer des sprints efficaces");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
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
          weeklyHours: 5
        })
      });

      const pathData = await res.json();
      if (!res.ok) throw new Error(pathData.error || "Erreur de génération");

      // Transform pathData into a VideoCourse format
      const newCourse: VideoCourse = {
        id: "vc-gen-" + Date.now(),
        title: pathData.title || domainInput,
        domain: "Formation IA Générée",
        instructor: "BOTSCHAFT Studio IA",
        instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
        views: "1 vue",
        uploadedAt: "À l'instant",
        duration: (pathData.modules.length * 15) + ":00",
        description: pathData.description,
        rating: 5.0,
        lessons: pathData.modules.map((m: any, i: number) => ({
          id: `l-gen-${i}`,
          title: m.title,
          duration: m.duration || "15:00",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          transcript: `Transcription générée par l'IA pour ${m.title}. ${m.description}`,
          chapters: [
            { time: "00:00", title: "Introduction" },
            { time: "05:00", title: "Concepts Clés" },
            { time: "10:00", title: "Application Pratique" }
          ]
        }))
      };

      onCourseGenerated(newCourse);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Studio de Création Vidéo IA</h2>
            <p className="text-xs text-slate-500">Générez une formation vidéo complète sur-mesure</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Domaine ou Sujet Professionnel
            </label>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Ex: Comptabilité des cryptomonnaies, Management agile..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Niveau Visé
            </label>
            <select
              value={levelInput}
              onChange={(e) => setLevelInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé / Expert</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Objectif Pédagogique
            </label>
            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Décrivez ce que l'apprenant doit maîtriser à la fin..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération vidéo IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer la formation vidéo</span>
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
    </div>
  );
};
