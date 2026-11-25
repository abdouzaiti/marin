import React, { useState, useEffect } from "react";
import { Home, GraduationCap, Compass, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface YouTubeBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openStudio?: () => void;
  setSelectedCategory: (cat: string) => void;
}

export const YouTubeBottomNav: React.FC<YouTubeBottomNavProps> = ({
  activeTab,
  setActiveTab,
  setSelectedCategory,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isDeveloper } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 h-14 px-2 flex items-center justify-around shadow-lg transition-all duration-300 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <button
        onClick={() => {
          setActiveTab("home");
          setSelectedCategory("Tout");
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "home"
            ? "text-[#1d8ccc] font-bold"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <Home
          className={`w-5 h-5 mb-0.5 ${
            activeTab === "home" ? "text-[#1d8ccc] stroke-[2.5]" : "text-slate-600"
          }`}
        />
        <span>{language === "ar" ? "الرئيسية" : language === "en" ? "Home" : "Accueil"}</span>
      </button>

      <button
        onClick={() => {
          setActiveTab("academy");
          setSelectedCategory("Tout");
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "academy" || activeTab === "courses"
            ? "text-[#1d8ccc] font-bold"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <GraduationCap
          className={`w-5 h-5 mb-0.5 ${
            activeTab === "academy" || activeTab === "courses"
              ? "text-[#1d8ccc] stroke-[2.5]"
              : "text-slate-600"
          }`}
        />
        <span>{language === "ar" ? "الأكاديمية" : language === "en" ? "Academy" : "Académie"}</span>
      </button>

      {isDeveloper ? (
        <button
          onClick={() => setActiveTab("developer")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === "developer"
              ? "text-[#041d37] font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck
            className={`w-5 h-5 mb-0.5 ${
              activeTab === "developer" ? "text-[#041d37] stroke-[2.5]" : "text-slate-600"
            }`}
          />
          <span>{language === "ar" ? "المطور" : "Dev"}</span>
        </button>
      ) : (
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === "explore"
              ? "text-[#1d8ccc] font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Compass
            className={`w-5 h-5 mb-0.5 ${
              activeTab === "explore" ? "text-[#1d8ccc] stroke-[2.5]" : "text-slate-600"
            }`}
          />
          <span>{language === "ar" ? "استكشاف" : language === "en" ? "Explore" : "Explorer"}</span>
        </button>
      )}

      <button
        onClick={() => setActiveTab("profile")}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "profile"
            ? "text-[#1d8ccc] font-bold"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <User
          className={`w-5 h-5 mb-0.5 ${
            activeTab === "profile" ? "text-[#1d8ccc] stroke-[2.5]" : "text-slate-600"
          }`}
        />
        <span>{language === "ar" ? "حسابي" : language === "en" ? "Profile" : "Profil"}</span>
      </button>
    </nav>
  );
};
