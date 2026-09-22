import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { VideoCourse } from "../data/videoCourses";
import { UserProfile } from "../types";
import { LandingFooter } from "./LandingFooter";

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
  searchQuery,
  setSearchQuery,
  selectCourse,
}) => {
  const [localSearch, setLocalSearch] = useState<string>(searchQuery || "");

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  // The 3 featured courses matching the curriculum
  const primaryCourses = useMemo(() => [
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
  ], []);

  // Filter primary courses based on search query
  const filteredPrimaryCourses = useMemo(() => {
    const query = localSearch.trim().toLowerCase();
    if (!query) return primaryCourses;

    return primaryCourses.filter((item) => {
      const courseData = courses[item.courseIndex];
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSub1 = item.subtitleLine1.toLowerCase().includes(query);
      const matchSub2 = item.subtitleLine2.toLowerCase().includes(query);
      const matchCourseTitle = courseData?.title.toLowerCase().includes(query) ?? false;
      const matchDesc = courseData?.description.toLowerCase().includes(query) ?? false;
      const matchDomain = courseData?.domain.toLowerCase().includes(query) ?? false;
      const matchInstructor = courseData?.instructor.toLowerCase().includes(query) ?? false;

      return (
        matchTitle ||
        matchSub1 ||
        matchSub2 ||
        matchCourseTitle ||
        matchDesc ||
        matchDomain ||
        matchInstructor
      );
    });
  }, [localSearch, courses, primaryCourses]);

  // Also check if any additional courses in catalog match
  const otherMatchedCourses = useMemo(() => {
    const query = localSearch.trim().toLowerCase();
    if (!query) return [];

    return courses.filter((c, idx) => {
      if (idx < 3) return false;
      return (
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.domain.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query)
      );
    });
  }, [localSearch, courses]);

  return (
    <div className="flex-1 bg-white text-slate-900 w-full">
      
      {/* Hero Content Area */}
      <div className="pt-4 sm:pt-8 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Academy Header */}
        <div className="text-center space-y-1 sm:space-y-2 mb-6" dir="rtl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0062c4] text-xs font-bold mb-1">
            <span>دورات أكاديمية مارين</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#041d37] tracking-tight">
            الدورات والبرامج التدريبية
          </h2>
        </div>

        {/* Search Bar for Searching Courses (شريط البحث في الدورات) */}
        <div className="w-full max-w-xl mx-auto mb-8 sm:mb-12 px-1">
          <div className="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-sm hover:border-slate-300 focus-within:border-[#0062c4] focus-within:ring-4 focus-within:ring-[#0062c4]/15 transition-all duration-200 px-3.5 sm:px-5 py-2 sm:py-2.5">
            {/* Search Icon */}
            <div className="flex items-center justify-center text-slate-400 pl-1.5 sm:pl-2 shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-[#0062c4]" />
            </div>

            {/* Input Element */}
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث عن دورة تدريبية (المالية، التسويق، نظام الشركة...)"
              className="flex-1 bg-transparent px-2 sm:px-3 py-1 text-xs sm:text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden text-right font-medium"
              dir="rtl"
            />

            {/* Clear Button */}
            {localSearch && (
              <button
                onClick={() => handleSearchChange("")}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-1"
                aria-label="مسح البحث"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Suggestion Pills */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 flex-wrap text-xs" dir="rtl">
            <span className="text-slate-400 font-medium ml-1 text-[11px] sm:text-xs">اقتراحات :</span>
            {[
              { label: "الكل", query: "" },
              { label: "المالية الذكية", query: "المالية" },
              { label: "التسويق الاستراتيجي", query: "التسويق" },
              { label: "نظام الشركة", query: "نظام" },
            ].map((tag, idx) => {
              const isActive = (tag.query === "" && !localSearch) || (tag.query !== "" && localSearch.includes(tag.query));
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearchChange(tag.query)}
                  className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#091f3a] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>

          {/* Search Result Counter when searching */}
          {localSearch.trim() && (
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 px-3" dir="rtl">
              <span>
                نتائج البحث عن : <strong className="text-[#041d37]">"{localSearch}"</strong>
              </span>
              <span>
                {filteredPrimaryCourses.length + otherMatchedCourses.length} {filteredPrimaryCourses.length + otherMatchedCourses.length === 1 ? "دورة تدريبية" : "دورات تدريبية"}
              </span>
            </div>
          )}
        </div>

        {/* Empty State when no course matches search */}
        {filteredPrimaryCourses.length === 0 && otherMatchedCourses.length === 0 && (
          <div className="w-full max-w-md mx-auto text-center py-12 px-4 space-y-3" dir="rtl">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              لم يتم العثور على دورات تطابق "{localSearch}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              جرّب البحث بكلمات أخرى مثل "المالية"، "التسويق"، أو "نظام".
            </p>
            <button
              onClick={() => handleSearchChange("")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-[#0062c4] font-bold text-xs sm:text-sm hover:bg-blue-100 transition-colors cursor-pointer"
            >
              عرض جميع الدورات
            </button>
          </div>
        )}

        {/* Featured Course Cards Grid */}
        {filteredPrimaryCourses.length > 0 && (
          <div className={`w-full grid grid-cols-1 ${filteredPrimaryCourses.length === 1 ? "max-w-md" : filteredPrimaryCourses.length === 2 ? "md:grid-cols-2 max-w-5xl" : "md:grid-cols-3 max-w-7xl"} gap-4 sm:gap-6 lg:gap-8 mx-auto`}>
            {filteredPrimaryCourses.map((item, idx) => {
            const courseData = courses[item.courseIndex] || courses[0];

            return (
              <div
                key={idx}
                onClick={() => selectCourse(courseData)}
                className="rounded-[24px] sm:rounded-[28px] bg-white p-2.5 sm:p-3.5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                {/* Inner Dark Card Canvas */}
                <div className="rounded-[18px] sm:rounded-[20px] bg-[#0c111a] relative overflow-hidden min-h-[195px] sm:min-h-0 aspect-[16/10] sm:aspect-[16/9.6] flex justify-between p-3.5 sm:p-5 text-white border border-white/5 select-none">
                  
                  {/* Subtle Background Radial Lighting */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      background: `radial-gradient(circle at 25% 40%, ${item.accentColor} 0%, transparent 60%)`,
                    }}
                  />

                  {/* Left: Instructor Cutout with Halftone Dots & Rim Glow */}
                  <div className="relative w-[44%] sm:w-[48%] h-full flex items-end justify-start overflow-hidden">
                    
                    {/* Halftone Dot Matrix Pattern */}
                    <div
                      className="absolute top-2 left-2 w-20 sm:w-28 h-20 sm:h-28 opacity-40 rounded-full pointer-events-none"
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
                  <div className="relative z-10 w-[56%] sm:w-[52%] flex flex-col justify-between items-end text-right pl-1 sm:pl-2">
                    
                    {/* Top Content: Star + Title + Subtitle */}
                    <div className="w-full flex flex-col items-end pt-0.5 sm:pt-1">
                      
                      {/* Sparkle 4-point Star in accent color */}
                      <div className="mb-0.5 sm:mb-1">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          viewBox="0 0 24 24"
                          fill={item.starColor}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
                        </svg>
                      </div>

                      {/* Course Title */}
                      <h2
                        className="font-black text-lg sm:text-2xl lg:text-[28px] leading-tight tracking-tight text-right drop-shadow-xs"
                        style={{ color: item.accentColor }}
                      >
                        {item.title}
                      </h2>

                      {/* 2-line Subtitle in Crisp White */}
                      <p className="text-slate-100 text-[11px] sm:text-[13px] font-medium leading-relaxed mt-1 sm:mt-2 text-right">
                        {item.subtitleLine1}
                        <br />
                        {item.subtitleLine2}
                      </p>
                    </div>

                    {/* Bottom Action: ابدأ الآن ►►► */}
                    <div className="w-full flex items-center justify-end gap-1.5 pt-1.5 sm:pt-2 border-t border-white/10 group-hover:border-white/20 transition-colors">
                      <span className="text-[11px] sm:text-[13px] font-bold text-white group-hover:underline">
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
        )}

        {/* Additional courses matching query if any */}
        {otherMatchedCourses.length > 0 && (
          <div className="w-full mt-10 max-w-7xl mx-auto space-y-4" dir="rtl">
            <h3 className="text-base sm:text-lg font-bold text-[#041d37]">دورات إضافية مطابقة للبحث :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherMatchedCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCourse(c)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                      {c.domain}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
                    <span>{c.instructor}</span>
                    <span className="font-bold text-[#0062c4] hover:underline">مشاهدة الدورة ←</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matching Dark Capsule Footer with Logo, Social Icons & Contact Details */}
      <LandingFooter />
    </div>
  );
};

