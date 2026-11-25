import React, { useMemo, useState } from "react";
import { Search, X, PlayCircle, Clock, Star, BookOpen, ArrowLeft, GraduationCap, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { VideoCourse } from "../data/videoCourses";
import { UserProfile } from "../types";
import { LandingFooter } from "./LandingFooter";
import { useLanguage } from "../context/LanguageContext";

interface YouTubeHomeFeedProps {
  courses: VideoCourse[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery?: (cat: string) => void;
  selectCourse: (course: VideoCourse) => void;
  openStudio?: () => void;
  userProfile?: UserProfile;
  setActiveTab?: (tab: string) => void;
}

export const YouTubeHomeFeed: React.FC<YouTubeHomeFeedProps> = ({
  courses,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectCourse,
}) => {
  const { language, isRTL, t } = useLanguage();
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const uniqueDomains = Array.from(new Set(courses.map((c) => c.domain)));
    return ["Tout", ...uniqueDomains];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory = selectedCategory === "Tout" || course.domain === selectedCategory;
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.domain.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [courses, selectedCategory, searchQuery]);

  const allLabel = language === "ar" ? "الكل" : language === "en" ? "All" : "Tout";
  const lessonsLabel = language === "ar" ? "دروس" : language === "en" ? "lessons" : "leçons";
  const emptyTitle =
    language === "ar"
      ? "لا توجد دورات مطابقة لبحثك"
      : language === "en"
        ? "No matching courses found"
        : "Aucune formation trouvée";
  const resetLabel =
    language === "ar" ? "إعادة ضبط البحث" : language === "en" ? "Reset filters" : "Réinitialiser";

  return (
    <div className="flex-1 bg-white text-slate-900 w-full flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      {/* Main Academy Content Area */}
      <div className="w-full flex-1">
        {/* 1. MARIN Blue Wave Header Banner */}
        <section className="relative overflow-hidden bg-[#1d8ccc] text-white pt-10 sm:pt-14 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
          {/* Ambient Soft Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-12 right-1/4 w-[500px] h-[280px] bg-white/20 rounded-full blur-3xl" />
            <div className="absolute top-10 left-10 w-[380px] h-[240px] bg-sky-200/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-bold backdrop-blur-xs">
              <GraduationCap className="w-4 h-4" />
              <span>MARIN Academy</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {t("featuredMasterclasses")}
            </h1>

            <p className="text-xs sm:text-base text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
              {t("academySubheadline")}
            </p>

            {/* Clean White Search Bar */}
            {setSearchQuery && (
              <div className="max-w-xl mx-auto pt-2">
                <div className="relative flex items-center bg-white rounded-full shadow-xl border border-white/40 px-4 py-1.5">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d8ccc] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className={`w-full bg-transparent text-[#041d37] placeholder:text-slate-400 text-xs sm:text-sm font-medium py-2 px-3 focus:outline-none ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                      className="p-1.5 rounded-full text-slate-400 hover:text-[#041d37] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Animated Multi-Layer Ocean Wave Bottom Edge */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none -mb-[1px]">
            <svg
              className="relative block w-full h-12 sm:h-16 text-white"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              fill="none"
            >
              <motion.path
                initial={{
                  d: "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                    "M0,18 C200,10 380,92 560,32 C760,2 960,88 1200,52 L1200,130 L0,130 Z",
                    "M0,38 C180,95 360,5 540,54 C720,104 940,12 1200,34 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                fill="#ffffff"
                opacity="0.25"
              />
              <motion.path
                initial={{
                  d: "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                    "M0,32 C190,98 370,14 550,68 C740,108 950,16 1200,28 L1200,130 L0,130 Z",
                    "M0,52 C160,18 350,96 520,46 C710,8 920,86 1200,48 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
                fill="#ffffff"
                opacity="0.45"
              />
              <motion.path
                initial={{
                  d: "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                }}
                animate={{
                  d: [
                    "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                    "M0,64 C180,18 380,104 560,42 C740,6 940,94 1200,62 L1200,130 L0,130 Z",
                    "M0,42 C150,98 350,8 520,62 C700,115 910,20 1200,46 L1200,130 L0,130 Z",
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                fill="currentColor"
              />
            </svg>
          </div>
        </section>

        {/* 2. Filter Bar & MARIN Courses Grid */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          {/* Category Filters + Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const displayLabel = cat === "Tout" ? allLabel : cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#041d37] text-white shadow-md shadow-[#041d37]/20"
                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:border-[#1d8ccc] hover:text-[#1d8ccc]"
                    }`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-500 shrink-0">
              <span className="text-[#1d8ccc] font-black">{filteredCourses.length}</span>{" "}
              {t("coursesAvailable")}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#1d8ccc] border border-sky-100 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-[#041d37]">{emptyTitle}</h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Tout");
                  if (setSearchQuery) setSearchQuery("");
                }}
                className="px-6 py-2.5 rounded-full bg-[#1d8ccc] hover:bg-[#0062c4] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                {resetLabel}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => {
                const useFallbackCover =
                  !course.thumbnail ||
                  course.thumbnail === "/instructor.jpg" ||
                  failedThumbnails[course.id];

                return (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className="group bg-white rounded-3xl border border-slate-200/80 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                  >
                    {/* Card Visual Header */}
                    <div className="relative h-48 bg-gradient-to-br from-[#041d37] via-[#0b355e] to-[#1d8ccc] overflow-hidden shrink-0">
                      {!useFallbackCover ? (
                        <>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            onError={() =>
                              setFailedThumbnails((prev) => ({ ...prev, [course.id]: true }))
                            }
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#041d37]/80 via-[#041d37]/20 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#1d8ccc]/30 blur-2xl" />
                          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-sky-300/20 blur-2xl" />
                          <Sparkles className="w-20 h-20 text-white/10" />
                        </div>
                      )}

                      {/* Top Metadata Badges */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[#041d37] text-[11px] font-bold shadow-sm">
                          <Clock className="w-3 h-3 text-[#1d8ccc]" />
                          <span>{course.duration}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#041d37]/85 text-white text-[11px] font-bold backdrop-blur-xs border border-white/15">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{course.rating}</span>
                        </span>
                      </div>

                      {/* Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-[#1d8ccc] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#1d8ccc] group-hover:text-white transition-all duration-300">
                          <PlayCircle className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Bottom White Wave Cap */}
                      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none -mb-[1px]">
                        <svg
                          className="w-full h-7 block text-white"
                          viewBox="0 0 400 40"
                          fill="currentColor"
                          preserveAspectRatio="none"
                        >
                          <path d="M0,35 C120,5 260,38 400,12 L400,40 L0,40 Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className={`px-6 pb-6 pt-2 flex-1 flex flex-col justify-between ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="space-y-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-[#1d8ccc] border border-sky-100 text-[11px] font-bold">
                          {course.domain}
                        </span>

                        <h2 className="text-lg font-black text-[#041d37] group-hover:text-[#1d8ccc] transition-colors leading-snug line-clamp-2">
                          {course.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 font-normal">
                          {course.description}
                        </p>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold truncate">
                          <span className="text-[#041d37] font-bold truncate">{course.instructor}</span>
                          <span>•</span>
                          <span className="shrink-0">
                            {course.lessons.length} {lessonsLabel}
                          </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-[#041d37] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1d8ccc] transition-colors shrink-0">
                          <ArrowLeft className={`w-4 h-4 ${!isRTL ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Matching Wave Footer */}
      <LandingFooter />
    </div>
  );
};
