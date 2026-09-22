import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
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
  selectCourse,
}) => {
  const { language, isRTL } = useLanguage();

  // The featured courses matching the curriculum
  const primaryCourses = useMemo(() => [
    {
      courseIndex: 0,
      title: language === "ar" ? "المالية الذكية" : language === "fr" ? "Finance Intelligente" : "Smart Finance",
      accentColor: "#22c55e",
      accentGlow: "rgba(34, 197, 94, 0.45)",
      rimBorder: "border-emerald-400",
      dotBg: "radial-gradient(#22c55e 2px, transparent 2px)",
      starColor: "#22c55e",
      tag: "smart-finance",
    },
    {
      courseIndex: 1,
      title: language === "ar" ? "التسويق الاستراتيجي" : language === "fr" ? "Marketing Stratégique" : "Strategic Marketing",
      accentColor: "#ef4444",
      accentGlow: "rgba(239, 68, 68, 0.45)",
      rimBorder: "border-red-500",
      dotBg: "radial-gradient(#ef4444 2px, transparent 2px)",
      starColor: "#ef4444",
      tag: "strategic-marketing",
    },
  ], [language]);

  return (
    <div className="flex-1 bg-white text-slate-900 w-full">
      
      {/* Hero Content Area */}
      <div className="pt-8 sm:pt-12 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center">

        {/* Featured Course Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 max-w-5xl gap-4 sm:gap-6 lg:gap-8 mx-auto">
          {primaryCourses.map((item, idx) => {
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

                  {/* Content column */}
                  <div className={`relative z-10 w-[56%] sm:w-[52%] flex flex-col justify-center ${isRTL ? "items-end text-right pl-1 sm:pl-2" : "items-start text-left pr-1 sm:pr-2"}`}>
                    
                    {/* Top Content: Star + Title */}
                    <div className={`w-full flex flex-col ${isRTL ? "items-end" : "items-start"} pt-0.5 sm:pt-1`}>
                      
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
                        className={`font-black text-lg sm:text-2xl lg:text-[28px] leading-tight tracking-tight ${isRTL ? "text-right" : "text-left"} drop-shadow-xs`}
                        style={{ color: item.accentColor }}
                      >
                        {item.title}
                      </h2>
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

