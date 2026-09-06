import React, { useState } from "react";
import { VideoCourse, YOUTUBE_CATEGORIES } from "../data/videoCourses";
import { UserProfile } from "../types";
import { Clock, Star, ArrowRight, Play, BookOpen, ChevronRight } from "lucide-react";
import { LandingFooter } from "./LandingFooter";

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
}) => {
  const [showAllCatalog, setShowAllCatalog] = useState(false);

  // The 3 exact featured courses matching the user image
  const primaryCourses = [
    {
      courseIndex: 0,
      title: "المالية الذكية",
      subtitleLine1: "كيف تضمن أموالك",
      subtitleLine2: "وتتحكم في مستقبلك",
      accentColor: "#22c55e",
      accentGlow: "rgba(34, 197, 94, 0.45)",
      rimBorder: "border-emerald-400",
      dotBg: "radial-gradient(#22c55e 2px, transparent 2px)",
      starColor: "#22c55e",
      tag: "smart-finance",
    },
    {
      courseIndex: 1,
      title: "التسويق الاستراتيجي",
      subtitleLine1: "أطلق قيمة",
      subtitleLine2: "تجعلك بلا منافسة",
      accentColor: "#ef4444",
      accentGlow: "rgba(239, 68, 68, 0.45)",
      rimBorder: "border-red-500",
      dotBg: "radial-gradient(#ef4444 2px, transparent 2px)",
      starColor: "#ef4444",
      tag: "strategic-marketing",
    },
    {
      courseIndex: 2,
      title: "نظام الشركة",
      subtitleLine1: "من التسيير العشوائي",
      subtitleLine2: "إلى التحكم الكامل",
      accentColor: "#fbbf24",
      accentGlow: "rgba(251, 191, 36, 0.45)",
      rimBorder: "border-amber-400",
      dotBg: "radial-gradient(#fbbf24 2px, transparent 2px)",
      starColor: "#fbbf24",
      tag: "company-system",
    },
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "Tout" || c.domain.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 bg-white text-slate-900 w-full">
      
      {/* Hero Content Area Matching Image Exactly */}
      <div className="pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Main Arabic Title */}
        <div className="text-center space-y-2 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#041d37] tracking-tight select-none">
            دوراتنا التدريبية الإلكترونية
          </h1>
          
          {/* Exact Hand-Drawn Blue Curve Stroke Underline */}
          <div className="flex justify-center -mt-1 sm:-mt-2">
            <svg
              className="w-48 sm:w-64 md:w-72 h-4 text-[#0066cc]"
              viewBox="0 0 260 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 9 C 80 15, 170 15, 250 7"
                stroke="#0066cc"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M40 11 C 100 14, 180 14, 220 9"
                stroke="#0080ff"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        {/* 3 Featured Course Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {primaryCourses.map((item, idx) => {
            const courseData = courses[item.courseIndex] || courses[0];

            return (
              <div
                key={idx}
                onClick={() => selectCourse(courseData)}
                className="rounded-[28px] border-2 border-[#2dd4bf] sm:border-[#34d399]/90 bg-white p-3 sm:p-3.5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                {/* Inner Dark Card Canvas */}
                <div className="rounded-[20px] bg-[#0c111a] relative overflow-hidden aspect-[16/10] sm:aspect-[16/9.6] flex justify-between p-4 sm:p-5 text-white border border-white/5 select-none">
                  
                  {/* Subtle Background Radial Lighting */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      background: `radial-gradient(circle at 25% 40%, ${item.accentColor} 0%, transparent 60%)`,
                    }}
                  />

                  {/* Left: Instructor Cutout with Halftone Dots & Rim Glow */}
                  <div className="relative w-[46%] sm:w-[48%] h-full flex items-end justify-start overflow-hidden">
                    
                    {/* Halftone Dot Matrix Pattern */}
                    <div
                      className="absolute top-2 left-2 w-28 h-28 opacity-40 rounded-full pointer-events-none"
                      style={{
                        backgroundImage: item.dotBg,
                        backgroundSize: "7px 7px",
                      }}
                    />

                    {/* Instructor Portrait Image */}
                    <div className="relative w-full h-[95%] flex items-end">
                      {/* Neon Rim Light Effect along outer silhouette */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-80"
                        style={{
                          filter: `drop-shadow(-3px 0px 8px ${item.accentColor})`,
                        }}
                      />
                      
                      <img
                        src="/instructor.jpg"
                        alt="Instructor"
                        className="w-full h-full object-contain object-bottom filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-300"
                        style={{
                          filter: `drop-shadow(-4px 0px 6px ${item.accentColor})`,
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop";
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Content in Arabic RTL matching image */}
                  <div className="relative z-10 w-[54%] sm:w-[52%] flex flex-col justify-between items-end text-right pl-2">
                    
                    {/* Top Content: Star + Title + Subtitle */}
                    <div className="w-full flex flex-col items-end pt-1">
                      
                      {/* Sparkle 4-point Star in accent color */}
                      <div className="mb-1">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill={item.starColor}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
                        </svg>
                      </div>

                      {/* Course Title */}
                      <h2
                        className="font-black text-xl sm:text-2xl lg:text-[28px] leading-tight tracking-tight text-right drop-shadow-xs"
                        style={{ color: item.accentColor }}
                      >
                        {item.title}
                      </h2>

                      {/* 2-line Subtitle in Crisp White */}
                      <p className="text-slate-100 text-xs sm:text-[13px] font-medium leading-relaxed mt-2 text-right">
                        {item.subtitleLine1}
                        <br />
                        {item.subtitleLine2}
                      </p>
                    </div>

                    {/* Bottom Action: ابدأ الآن ►►► */}
                    <div className="w-full flex items-center justify-end gap-1.5 pt-2 border-t border-white/10 group-hover:border-white/20 transition-colors">
                      <span className="text-xs sm:text-[13px] font-bold text-white group-hover:underline">
                        ابدأ الآن
                      </span>
                      <div
                        className="flex items-center text-[10px] sm:text-xs font-black tracking-tighter"
                        style={{ color: item.accentColor }}
                      >
                        <span>►</span>
                        <span>►</span>
                        <span>►</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional: Catalog Expander for full course catalog */}
        <div className="mt-14 w-full flex flex-col items-center">
          <button
            onClick={() => setShowAllCatalog((prev) => !prev)}
            className="px-6 py-2.5 rounded-full border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>{showAllCatalog ? "إخفاء باقي الدورات" : "عرض كل الدورات والبرامج التدريبية"}</span>
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showAllCatalog ? "-rotate-90" : "rotate-90"}`} />
          </button>

          {showAllCatalog && (
            <div className="mt-10 w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Category Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
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

              {/* Full Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                        {course.domain}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-right">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
                        </span>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-slate-600 truncate font-medium">{course.instructor}</span>
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructor}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Matching Dark Capsule Footer with Logo, Social Icons & Contact Details */}
      <LandingFooter />
    </div>
  );
};

