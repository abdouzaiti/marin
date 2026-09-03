import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, DoorOpen } from "lucide-react";
import { UserProfile } from "../types";

interface YouTubeNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const YouTubeNavbar: React.FC<YouTubeNavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  setUserProfile
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollEl = document.querySelector(".app-scroll-container");
      const currentScroll = scrollEl ? scrollEl.scrollTop : window.scrollY;
      setIsScrolled(currentScroll > 25);
    };

    const scrollEl = document.querySelector(".app-scroll-container");
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeTab]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[86px] px-4 sm:px-8 flex items-center justify-between pointer-events-auto transition-all duration-300 ${
        isScrolled || activeTab === "login" || activeTab === "register" || activeTab === "watch" || activeTab === "profile"
          ? "bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-transparent shadow-none"
      }`}
    >
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-8">
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
        >
          <img
            src="/logo.png"
            alt="MARIN Academy"
            className="w-[100px] h-[100px] object-contain drop-shadow-md"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = "https://marinacademy.pro/wp-content/uploads/2026/02/LOGO-ORIGINAL-SITE-PNG.png";
            }}
          />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setActiveTab("home")}
            className={`text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "home"
                ? "text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === "explore"
                ? "text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Explorer les Filières
          </button>
        </nav>
      </div>

      {/* Right: Se connecter & S'inscrire */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab("login")}
          className={`px-3.5 sm:px-4 py-2 rounded-none border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "login"
              ? "text-white bg-white/20 border-white/40 shadow-sm"
              : "text-slate-200 hover:text-white border-white/20 hover:border-white/50 bg-slate-950/40 hover:bg-white/10"
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Se connecter</span>
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-none border text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-98 flex items-center gap-2 ${
            activeTab === "register"
              ? "bg-blue-500 border-blue-400 text-white shadow-blue-500/40"
              : "bg-blue-600 hover:bg-blue-500 border-blue-500 hover:border-blue-400 text-white shadow-blue-600/30"
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>S'inscrire</span>
        </button>
      </div>
    </header>
  );
};

