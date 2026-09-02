import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";

interface YouTubeNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
}

export const YouTubeNavbar: React.FC<YouTubeNavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check both window scroll and internal scrollable containers
      const scrollEl = document.querySelector(".app-scroll-container");
      const currentScroll = scrollEl ? scrollEl.scrollTop : window.scrollY;
      setIsScrolled(currentScroll > 25);
    };

    const scrollEl = document.querySelector(".app-scroll-container");
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
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
        isScrolled
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

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("profile")}
          className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white/20 text-white border border-white/20"
              : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
          }`}
        >
          <span>Mon Compte</span>
        </button>

        {/* User Avatar */}
        <div
          onClick={() => setActiveTab("profile")}
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-extrabold text-xs ring-2 ring-white/20 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Voir mon profil"
        >
          {userProfile.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
