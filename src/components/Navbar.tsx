import React from "react";
import { GraduationCap, Award, Flame, User, Sparkles, BookOpen, Briefcase, Bot } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, userProfile }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("dashboard")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-indigo-600 transition-colors">
            B
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900">BOTSCHAFT</span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-600 block font-semibold">
              Professional AI Training
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Tableau de bord
          </button>
          
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "catalog" || activeTab === "generator"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Catalogue & IA
          </button>

          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "simulation"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            Lab de Simulation
          </button>

          <button
            onClick={() => setActiveTab("career")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "career"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-600" />
            Conseil Carrière IA
          </button>
        </nav>

        {/* User Stats & Profile */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-800 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{userProfile.streak} Jours</span>
          </div>

          {/* XP */}
          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full text-indigo-700 text-xs font-bold">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>{userProfile.xp} XP</span>
          </div>

          {/* Avatar / Profile */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-3 py-1.5 rounded-full">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {userProfile.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-800 hidden lg:inline">
              {userProfile.name}
            </span>
          </div>
        </div>

      </div>

      {/* Mobile Sub-nav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-4 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 ${activeTab === "dashboard" ? "text-indigo-600 font-bold" : ""}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Accueil</span>
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex flex-col items-center gap-1 ${activeTab === "catalog" ? "text-indigo-600 font-bold" : ""}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Formations</span>
        </button>
        <button
          onClick={() => setActiveTab("simulation")}
          className={`flex flex-col items-center gap-1 ${activeTab === "simulation" ? "text-indigo-600 font-bold" : ""}`}
        >
          <Bot className="w-4 h-4" />
          <span>Simulations</span>
        </button>
        <button
          onClick={() => setActiveTab("career")}
          className={`flex flex-col items-center gap-1 ${activeTab === "career" ? "text-indigo-600 font-bold" : ""}`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Carrière</span>
        </button>
      </div>
    </header>
  );
};
