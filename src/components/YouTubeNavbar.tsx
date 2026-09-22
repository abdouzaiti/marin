import React, { useState, useEffect } from "react";
import { DoorOpen } from "lucide-react";
import { UserProfile } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface YouTubeNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
}

export const YouTubeNavbar: React.FC<YouTubeNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenContact,
  onOpenAbout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isHome = activeTab === "home";
  const isTransparentHeader = isHome && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ease-out ${
        isTransparentHeader
          ? "bg-transparent text-white shadow-none border-b border-transparent"
          : "bg-white/95 text-[#041d37] shadow-sm border-b border-slate-200/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Right Side (in RTL): Logo + Navigation Menu Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab("home");
              scrollToTop();
            }}
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 active:scale-98"
          >
            <img
              src="/logo.png"
              alt="MARIN Academy"
              className={`h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain select-none transition-all duration-200 ${
                isTransparentHeader ? "brightness-0 invert" : ""
              }`}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab("home");
                scrollToTop();
              }}
              className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === "home"
                  ? isTransparentHeader
                    ? "bg-white text-[#041d37] shadow-sm"
                    : "bg-blue-50 text-[#1d8ccc]"
                  : isTransparentHeader
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : "text-slate-700 hover:text-[#1d8ccc] hover:bg-slate-100"
              }`}
            >
              {t("home")}
            </button>
            <button
              onClick={() => {
                setActiveTab("academy");
                scrollToTop();
              }}
              className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "academy" || activeTab === "courses" || activeTab === "watch"
                  ? isTransparentHeader
                    ? "bg-white text-[#041d37] shadow-sm"
                    : "bg-[#1d8ccc] text-white shadow-xs"
                  : isTransparentHeader
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : "text-slate-700 hover:text-[#1d8ccc] hover:bg-slate-100"
              }`}
            >
              {language === "fr" ? "Académie" : language === "en" ? "Academy" : "الأكاديمية"}
            </button>
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className={`transition-colors text-xs sm:text-sm font-bold px-3 py-2 rounded-lg cursor-pointer ${
                  isTransparentHeader
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : "text-slate-700 hover:text-[#1d8ccc] hover:bg-slate-100"
                }`}
              >
                {language === "fr" ? "À propos" : language === "en" ? "About Us" : "من نحن"}
              </button>
            )}
            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className={`transition-colors text-xs sm:text-sm font-bold px-3 py-2 rounded-lg cursor-pointer ${
                  isTransparentHeader
                    ? "text-white/90 hover:text-white hover:bg-white/20"
                    : "text-slate-700 hover:text-[#1d8ccc] hover:bg-slate-100"
                }`}
              >
                {language === "fr" ? "Contact" : language === "en" ? "Contact Us" : "تواصل معنا"}
              </button>
            )}
          </nav>
        </div>

        {/* Left Side: Language Switcher & Action CTA Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher (Visible on mobile & desktop) */}
          <div className={`flex items-center gap-0.5 sm:gap-1 rounded-full p-1 border text-[11px] sm:text-xs font-bold ${
            isTransparentHeader
              ? "bg-white/10 border-white/20 text-white"
              : "bg-slate-100 border-slate-200 text-slate-700"
          }`}>
            <button
              onClick={() => setLanguage("ar")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                language === "ar" ? "bg-[#1d8ccc] text-white shadow-xs" : "hover:opacity-75"
              }`}
            >
              AR
            </button>
            <button
              onClick={() => setLanguage("fr")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                language === "fr" ? "bg-[#1d8ccc] text-white shadow-xs" : "hover:opacity-75"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all cursor-pointer ${
                language === "en" ? "bg-[#1d8ccc] text-white shadow-xs" : "hover:opacity-75"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setActiveTab("register")}
            className={`hidden sm:flex rounded-full font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 items-center gap-1.5 sm:gap-2 shadow-md active:scale-98 transition-all cursor-pointer ${
              isTransparentHeader
                ? "bg-[#041d37] hover:bg-[#072a4f] text-white shadow-black/20"
                : "bg-[#1d8ccc] hover:bg-[#0062c4] text-white shadow-blue-900/20"
            }`}
          >
            <span>{language === "fr" ? "Commencer" : language === "en" ? "Get Started" : "ابدأ الآن"}</span>
            <DoorOpen className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </header>
  );
};



