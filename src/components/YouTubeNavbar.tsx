import React, { useState, useEffect } from "react";
import { DoorOpen } from "lucide-react";
import { UserProfile } from "../types";

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ease-out ${
        isScrolled
          ? "bg-white/95 text-[#041d37] shadow-sm border-b border-slate-200/80 backdrop-blur-md"
          : isHome
            ? "bg-transparent text-[#041d37] shadow-none border-b border-transparent"
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
              className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain select-none"
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
                  ? isScrolled
                    ? "bg-blue-50 text-[#0062c4]"
                    : "bg-white text-[#041d37] shadow-sm"
                  : isScrolled
                    ? "text-slate-700 hover:text-[#0062c4] hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/20"
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveTab("academy");
                scrollToTop();
              }}
              className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "academy" || activeTab === "courses" || activeTab === "watch"
                  ? isScrolled
                    ? "bg-[#0062c4] text-white shadow-xs"
                    : "bg-white text-[#041d37] shadow-sm"
                  : isScrolled
                    ? "text-slate-700 hover:text-[#0062c4] hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/20"
              }`}
            >
              الأكاديمية
            </button>
            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className={`transition-colors text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg cursor-pointer ${
                  isScrolled
                    ? "text-slate-700 hover:text-[#0062c4] hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/20"
                }`}
              >
                من نحن
              </button>
            )}
            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className={`transition-colors text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg cursor-pointer ${
                  isScrolled
                    ? "text-slate-700 hover:text-[#0062c4] hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/20"
                }`}
              >
                تواصل معنا
              </button>
            )}
          </nav>
        </div>

        {/* Left Side (in RTL): Action CTA Button & Mobile Links (Hidden on phone screens) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mobile Fast Tab Switching */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => {
                setActiveTab("home");
                scrollToTop();
              }}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-md ${
                activeTab === "home" 
                  ? isScrolled ? "bg-[#0062c4] text-white" : "bg-white text-[#041d37]" 
                  : isScrolled ? "text-slate-700" : "text-white"
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => {
                setActiveTab("academy");
                scrollToTop();
              }}
              className={`text-xs font-bold px-2.5 py-1.5 rounded-md ${
                activeTab === "academy" 
                  ? isScrolled ? "bg-[#0062c4] text-white" : "bg-white text-[#041d37]" 
                  : isScrolled ? "text-slate-700" : "text-white"
              }`}
            >
              الأكاديمية
            </button>
          </div>

          <button
            onClick={() => setActiveTab("register")}
            className={`rounded-full font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 shadow-md active:scale-98 transition-all cursor-pointer ${
              isScrolled
                ? "bg-[#0062c4] hover:bg-[#0051a3] text-white shadow-blue-900/20"
                : "bg-[#041d37] hover:bg-[#072a4f] text-white shadow-black/20"
            }`}
          >
            <span>ابدأ الآن</span>
            <DoorOpen className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </header>
  );
};



