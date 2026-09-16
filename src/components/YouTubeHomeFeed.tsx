import React from "react";
import { VideoCourse } from "../data/videoCourses";
import { UserProfile } from "../types";
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
  selectCourse,
}) => {
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
      </div>

      {/* Matching Dark Capsule Footer with Logo, Social Icons & Contact Details */}
      <LandingFooter />
    </div>
  );
};

