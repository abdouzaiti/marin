import React from "react";
import { Play, CheckCircle2, Sparkles, BookOpen, Clock, Star, Flame, ArrowRight, Award } from "lucide-react";
import { VideoCourse, YOUTUBE_CATEGORIES } from "../data/videoCourses";
import { UserProfile } from "../types";

interface YouTubeHomeFeedProps {
  courses: VideoCourse[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
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
  selectCourse,
  userProfile,
  setActiveTab
}) => {
  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "Tout" || c.domain.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredCourse = courses[0]; // Masterclass en vedette

  return (
    <div className="app-scroll-container flex-1 bg-slate-50/60 overflow-y-auto scroll-smooth">
      
      {/* 100% Full Screen Hero Banner across the entire viewport */}
      {searchQuery === "" && selectedCategory === "Tout" && featuredCourse && (
        <div className="relative w-full h-screen min-h-[550px] bg-slate-950 text-white overflow-hidden flex flex-col justify-end">
          {/* Background image covering 100% full screen */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredCourse.thumbnail}
              alt={featuredCourse.title}
              className="w-full h-full object-cover object-center opacity-75 hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic Gradient Overlays for High Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent hidden sm:block"></div>
          </div>

          {/* Hero Content positioned over the 100% full screen canvas */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-5xl space-y-4 sm:space-y-5 pb-16 sm:pb-20">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
              {featuredCourse.title}
            </h1>

            <p className="text-slate-200 text-sm sm:text-base lg:text-lg line-clamp-3 leading-relaxed max-w-3xl drop-shadow-sm font-normal">
              {featuredCourse.description}
            </p>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">

      {/* Continue Learning Quick Strip (If user has progress) */}
      {userProfile && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Progression en cours</p>
              <h3 className="text-sm font-bold text-slate-900">
                {userProfile.completedModules.length} module(s) complété(s) • {userProfile.xp} XP accumulés
              </h3>
            </div>
          </div>

          <button
            onClick={() => selectCourse(courses[0])}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            <span>Reprendre mon apprentissage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Pills Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" /> Formations & Filières Professionnelles
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredCourses.length} formation{filteredCourses.length > 1 ? "s" : ""} disponible{filteredCourses.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {YOUTUBE_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-xs ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-blue-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid - Complete Clean Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => selectCourse(course)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                {course.domain}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {course.duration}
              </div>
            </div>

            {/* Video Metadata */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                  <span className="text-xs text-slate-600 truncate font-medium">{course.instructor}</span>
                </div>

                <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <p className="text-slate-600 font-medium text-sm">Aucune formation ne correspond à votre sélection.</p>
          <button
            onClick={() => setSelectedCategory("Tout")}
            className="text-xs font-bold text-blue-600 underline cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      </div>
    </div>
  );
};
