import React, { useState, useEffect } from "react";
import { CheckCircle2, X, Sparkles, Clock } from "lucide-react";
import { VideoCourse, VideoLesson } from "../data/videoCourses";
import { UserProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";

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
  completeModule,
}) => {
  const { language, isRTL } = useLanguage();
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [resolvedEmbedUrl, setResolvedEmbedUrl] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCurrentLessonIdx(0);
  }, [course.id]);

  const currentLesson: VideoLesson =
    course.lessons[currentLessonIdx] || course.lessons[0];

  useEffect(() => {
    let active = true;
    if (currentLesson?.embedUrl) {
      setResolvedEmbedUrl(currentLesson.embedUrl);
      return;
    }

    if (currentLesson?.bunnyVideoId) {
      fetch(`/api/bunny/embed/${encodeURIComponent(currentLesson.bunnyVideoId)}`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.configured && data.embedUrl) {
            setResolvedEmbedUrl(data.embedUrl);
          } else if (active) {
            setResolvedEmbedUrl(null);
          }
        })
        .catch(() => {
          if (active) setResolvedEmbedUrl(null);
        });
    } else {
      setResolvedEmbedUrl(null);
    }

    return () => {
      active = false;
    };
  }, [currentLesson?.id, currentLesson?.embedUrl, currentLesson?.bunnyVideoId]);

  const isCompleted = userProfile.completedModules.includes(currentLesson.id);
  const safeAvatar =
    !course.instructorAvatar ||
    course.instructorAvatar === "/instructor.jpg" ||
    failedImages["avatar"]
      ? "/logo.png"
      : course.instructorAvatar;
  const safePoster =
    course.thumbnail &&
    course.thumbnail !== "/instructor.jpg" &&
    !failedImages["poster"]
      ? course.thumbnail
      : undefined;

  const labels =
    language === "ar"
      ? {
          close: "إغلاق الفيديو",
          markComplete: "إتمام الدرس (+100 XP)",
          completed: "تم إتمام الدرس",
          subscribers: "متدربون مسجلون في الأكاديمية",
          curriculum: "برنامج الدورة التدريبية",
          lessonsCount: "دروس",
          lessonLabel: "الدرس",
          recommended: "دورات مقترحة",
        }
      : language === "en"
        ? {
            close: "Close video",
            markComplete: "Mark Lesson Complete (+100 XP)",
            completed: "Lesson Completed",
            subscribers: "Active academy learners",
            curriculum: "Course Curriculum",
            lessonsCount: "lessons",
            lessonLabel: "Lesson",
            recommended: "Recommended Courses",
          }
        : {
            close: "Fermer la vidéo",
            markComplete: "Valider la leçon (+100 XP)",
            completed: "Leçon validée",
            subscribers: "Apprenants actifs de l'académie",
            curriculum: "Programme de la Formation",
            lessonsCount: "leçons",
            lessonLabel: "Leçon",
            recommended: "Formations Recommandées",
          };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`flex-1 bg-slate-50 overflow-y-auto p-3 sm:p-6 lg:p-8 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Left 2 Cols: Real Video Player & Channel Bar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player Frame */}
          <div className="relative aspect-video bg-[#041d37] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            {resolvedEmbedUrl ? (
              <iframe
                src={resolvedEmbedUrl}
                title={currentLesson.title}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                key={currentLesson.id}
                src={currentLesson.hlsUrl || currentLesson.videoUrl}
                poster={safePoster}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain bg-[#041d37]"
              />
            )}

            {/* Close Button Overlay */}
            <button
              type="button"
              onClick={goHome}
              aria-label={labels.close}
              className={`absolute top-3 ${
                isRTL ? "left-3" : "right-3"
              } z-10 text-white bg-[#041d37]/80 hover:bg-[#1d8ccc] w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors shadow-md`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video Title & Channel Info */}
          <div className="space-y-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                {course.domain}
              </span>
              {course.isBunnyStream && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#041d37] text-white text-[11px] font-bold">
                  Bunny Stream HD
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-[#041d37] leading-snug">
              {course.title} — {currentLesson.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={safeAvatar}
                  alt={course.instructor}
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, avatar: true }))
                  }
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 bg-slate-50"
                />
                <div>
                  <h3 className="font-bold text-[#041d37] text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{course.instructor}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1d8ccc]" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    {labels.subscribers}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => completeModule(currentLesson.id)}
                disabled={isCompleted}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isCompleted
                    ? "bg-sky-50 text-[#1d8ccc] border border-sky-200 cursor-default"
                    : "bg-[#1d8ccc] hover:bg-[#041d37] text-white shadow-md"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? labels.completed : labels.markComplete}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Lessons Playlist & Recommended */}
        <div className="space-y-4 sm:space-y-6">
          {/* Lessons Playlist Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <h3 className="font-black text-[#041d37] text-xs sm:text-sm uppercase tracking-wider">
              {labels.curriculum} ({course.lessons.length} {labels.lessonsCount})
            </h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isSelected = currentLessonIdx === idx;
                const lessonDone = userProfile.completedModules.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLessonIdx(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-sky-50 border-[#1d8ccc] text-[#041d37] shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-bold text-[#1d8ccc] uppercase flex items-center gap-1">
                        <span>
                          {labels.lessonLabel} {idx + 1}
                        </span>
                        {lessonDone && <CheckCircle2 className="w-3 h-3 text-[#1d8ccc]" />}
                      </span>
                      <h4 className="font-bold text-xs line-clamp-1">{lesson.title}</h4>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shrink-0 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#1d8ccc]" />
                      <span>{lesson.duration}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Courses */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <h3 className="font-black text-[#041d37] text-xs sm:text-sm uppercase tracking-wider">
              {labels.recommended}
            </h3>
            <div className="space-y-3">
              {courses
                .filter((c) => c.id !== course.id)
                .slice(0, 3)
                .map((rec) => {
                  const recFallback =
                    !rec.thumbnail ||
                    rec.thumbnail === "/instructor.jpg" ||
                    failedImages[rec.id];
                  return (
                    <div
                      key={rec.id}
                      onClick={() => selectCourse(rec)}
                      className="flex gap-2.5 sm:gap-3 group cursor-pointer"
                    >
                      <div className="w-24 sm:w-28 aspect-video rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-gradient-to-br from-[#041d37] to-[#1d8ccc] flex items-center justify-center">
                        {!recFallback ? (
                          <img
                            src={rec.thumbnail}
                            alt={rec.title}
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [rec.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:opacity-90"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-xs text-[#041d37] line-clamp-2 group-hover:text-[#1d8ccc] transition-colors">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">{rec.instructor}</p>
                        <p className="text-[10px] text-slate-400">{rec.views}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
