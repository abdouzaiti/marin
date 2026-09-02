import React from "react";
import { Home, Compass, FolderKanban, User } from "lucide-react";

interface YouTubeBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openStudio?: () => void;
  setSelectedCategory: (cat: string) => void;
}

export const YouTubeBottomNav: React.FC<YouTubeBottomNavProps> = ({
  activeTab,
  setActiveTab,
  setSelectedCategory
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 h-14 px-2 flex items-center justify-around shadow-lg">
      <button
        onClick={() => {
          setActiveTab("home");
          setSelectedCategory("Tout");
        }}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "home" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${activeTab === "home" ? "text-blue-600 stroke-[2.5]" : "text-slate-600"}`} />
        <span>Accueil</span>
      </button>

      <button
        onClick={() => setActiveTab("explore")}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "explore" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <Compass className={`w-5 h-5 mb-0.5 ${activeTab === "explore" ? "text-blue-600 stroke-[2.5]" : "text-slate-600"}`} />
        <span>Explorer</span>
      </button>

      <button
        onClick={() => {
          setActiveTab("home");
          setSelectedCategory("Comptabilité & Finance");
        }}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <FolderKanban className="w-5 h-5 mb-0.5 text-slate-600" />
        <span>Filières</span>
      </button>

      <button
        onClick={() => setActiveTab("profile")}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
          activeTab === "profile" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <User className={`w-5 h-5 mb-0.5 ${activeTab === "profile" ? "text-blue-600 stroke-[2.5]" : "text-slate-600"}`} />
        <span>Profil</span>
      </button>
    </nav>
  );
};
