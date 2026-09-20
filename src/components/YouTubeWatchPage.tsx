import React, { useState } from "react";
import { CheckCircle2, Play, X } from "lucide-react";
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

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-2.5 sm:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        
        {/* Left 2 Cols: Video Player & Metadata */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Simulated Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs" style={{ backgroundImage: `url(${course.thumbnail})` }}></div>
            
            {/* Player Top Overlay */}
            <div className="relative z-10 p-2.5 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
              <span className="text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 bg-blue-600 rounded-md truncate max-w-[80%]">
                MARIN Academy HD • {currentLesson.title}
              </span>
              <button
                onClick={goHome}
                aria-label="Fermer la vidéo"
                className="text-white bg-white/20 hover:bg-white/30 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Center Play Button Simulator */}
            <div className="relative z-10 flex items-center justify-center my-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white ml-0.5 sm:ml-1" />
              </div>
            </div>

            {/* Player Bottom Bar */}
            <div className="relative z-10 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-[11px] sm:text-xs">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-semibold">Lecture en cours ({currentLesson.duration})</span>
              </div>
            </div>
          </div>

          {/* Video Title & Channel Info */}
          <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {course.title} — {currentLesson.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructor}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{course.instructor}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">142k abonnés professionnels</p>
                </div>
              </div>
            </div>

            {/* Description & Chapters */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-2.5 sm:space-y-3 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900">{course.views} • {course.uploadedAt} • Domaine : {course.domain}</p>
              <p>{course.description}</p>
              
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Chapitres de la vidéo :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentLesson.chapters.map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] shrink-0">{ch.time}</span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Lessons Playlist & Recommended */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Lessons Playlist Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Programme de la Formation ({course.lessons.length} leçons)
            </h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isSelected = currentLessonIdx === idx;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLessonIdx(idx)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Leçon {idx + 1}</span>
                      <h4 className="font-bold text-xs line-clamp-1">{lesson.title}</h4>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0">
                      {lesson.duration}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Formations Recommandées
            </h3>
            <div className="space-y-3">
              {courses.filter(c => c.id !== course.id).slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => selectCourse(rec)}
                  className="flex gap-2.5 sm:gap-3 group cursor-pointer"
                >
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    className="w-24 sm:w-28 aspect-video rounded-xl object-cover shrink-0 border border-slate-200 group-hover:opacity-90"
                  />
                  <div className="space-y-1 min-w-0">
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
