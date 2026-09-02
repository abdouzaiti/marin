import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Send, Bot, CheckCircle2, Play, MessageSquare, Loader2 } from "lucide-react";
import { VideoCourse, VideoLesson } from "../data/videoCourses";
import { UserProfile } from "../types";

interface YouTubeWatchPageProps {
  course: VideoCourse;
  courses: VideoCourse[];
  selectCourse: (c: VideoCourse) => void;
  goHome: () => void;
  userProfile: UserProfile;
  completeModule: (id: string) => void;
}

export const YouTubeWatchPage: React.FC<YouTubeWatchPageProps> = ({
  course,
  courses,
  selectCourse,
  goHome,
  userProfile,
  completeModule
}) => {
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const currentLesson: VideoLesson = course.lessons[currentLessonIdx] || course.lessons[0];

  // AI Tutor chat state inside watch page
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: `Bonjour ! Je suis votre tuteur IA MARIN Academy. Posez-moi vos questions sur la leçon "${currentLesson.title}" ou demandez un résumé.` }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Array<{ author: string; text: string; time: string }>>([
    { author: "Marc Leroy", text: "Excellente explication du bilan, très clair pour une PME !", time: "Il y a 2 jours" },
    { author: "Sophie Martin", text: "Le cas pratique à la fin m'a permis de valider mes acquis. Merci MARIN Academy.", time: "Il y a 5 jours" }
  ]);
  const [newComment, setNewComment] = useState("");

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
          domain: course.title,
          moduleTitle: currentLesson.title,
          messages,
          userQuestion: userMsg
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue avec le tuteur IA." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([{ author: userProfile.name, text: newComment, time: "À l'instant" }, ...comments]);
    setNewComment("");
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Video Player & Metadata */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Simulated Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
            
            {/* Player Top Overlay */}
            <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-white text-xs font-bold px-3 py-1 bg-blue-600 rounded-md">
                MARIN Academy HD • {currentLesson.title}
              </span>
              <button
                onClick={goHome}
                className="text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-md cursor-pointer"
              >
                ✕ Fermer la vidéo
              </button>
            </div>

            {/* Center Play Button Simulator */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>

            {/* Player Bottom Bar */}
            <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Lecture en cours ({currentLesson.duration})</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => completeModule(course.id + "-" + currentLesson.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valider la leçon (+100 XP)
                </button>
              </div>
            </div>
          </div>

          {/* Video Title & Channel Info */}
          <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {course.title} — {currentLesson.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructor}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{course.instructor}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </h3>
                  <p className="text-xs text-slate-500">142k abonnés professionnels</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <button className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-200 text-xs font-bold text-slate-700 border-r border-slate-200 cursor-pointer">
                    <ThumbsUp className="w-4 h-4" /> 3.4k
                  </button>
                  <button className="px-3 py-2 hover:bg-slate-200 text-slate-700 cursor-pointer">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-700 cursor-pointer border border-slate-200">
                  <Share2 className="w-4 h-4" /> Partager
                </button>
                <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-xs font-bold text-slate-700 cursor-pointer border border-slate-200">
                  <Bookmark className="w-4 h-4" /> Sauvegarder
                </button>
              </div>
            </div>

            {/* Description & Chapters */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">{course.views} • {course.uploadedAt} • Domaine : {course.domain}</p>
              <p>{course.description}</p>
              
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Chapitres de la vidéo :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentLesson.chapters.map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">{ch.time}</span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" /> Discussions et Avis ({comments.length + 42})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userProfile.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire professionnel..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Commenter
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {comments.map((comm, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
                    {comm.author.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{comm.author}</span>
                      <span className="text-slate-400 text-[10px]">{comm.time}</span>
                    </div>
                    <p className="text-slate-700">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Lessons Playlist & AI Tutor Companion */}
        <div className="space-y-6">
          
          {/* Lessons Playlist Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Programme de la Formation ({course.lessons.length} leçons)
            </h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isSelected = currentLessonIdx === idx;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLessonIdx(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Leçon {idx + 1}</span>
                      <h4 className="font-bold text-xs line-clamp-1">{lesson.title}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {lesson.duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Tutor Assistant Companion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[500px]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tuteur IA MARIN Academy</h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Actif sur la vidéo
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs leading-relaxed ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-blue-600 text-white"}`}>
                    {msg.role === "user" ? userProfile.name.charAt(0) : "AI"}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">AI</div>
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Analyse de la transcription...</span>
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
                placeholder="Posez une question sur le cours..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Formations Recommandées
            </h3>
            <div className="space-y-3">
              {courses.filter(c => c.id !== course.id).slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => selectCourse(rec)}
                  className="flex gap-3 group cursor-pointer"
                >
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    className="w-28 aspect-video rounded-xl object-cover shrink-0 border border-slate-200 group-hover:opacity-90"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-slate-500">{rec.instructor}</p>
                    <p className="text-[10px] text-slate-400">{rec.views}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
