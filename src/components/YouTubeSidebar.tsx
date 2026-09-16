import React from "react";
import { Home, Compass, User } from "lucide-react";

interface YouTubeSidebarProps {
  sidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const YouTubeSidebar: React.FC<YouTubeSidebarProps> = ({
  sidebarOpen,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory
}) => {
  if (!sidebarOpen) {
    return (
      <aside className="hidden md:flex w-18 bg-white border-r border-slate-200 flex-col items-center py-3 gap-6 shrink-0 select-none">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${activeTab === "home" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${activeTab === "explore" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <Compass className="w-5 h-5" />
          <span>استكشاف</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${activeTab === "profile" ? "text-blue-600 bg-blue-50 font-bold" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <User className="w-5 h-5" />
          <span>الملف الشخصي</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-3 space-y-4 shrink-0 overflow-y-auto select-none">
      
      {/* Main navigation */}
      <div className="space-y-1">
        <button
          onClick={() => {
            setActiveTab("home");
            setSelectedCategory("Tout");
          }}
          className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "home" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Home className="w-5 h-5 text-blue-600" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "explore" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Compass className="w-5 h-5 text-slate-700" />
          <span>استكشاف التخصصات</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "profile" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <User className="w-5 h-5 text-blue-600" />
          <span>الملف الشخصي</span>
        </button>
      </div>

      <hr className="border-slate-200 my-2" />

      {/* Subscriptions / Domains */}
      <div className="space-y-1">
        <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          المسارات المهنية
        </h3>
        
        {[
          { name: "المحاسبة والمالية", icon: "📊" },
          { name: "الإدارة والقيادة", icon: "👥" },
          { name: "وكالة السفر والسياحة", icon: "✈️" },
          { name: "التسويق الرقمي", icon: "📈" },
          { name: "تحليل البيانات", icon: "💻" }
        ].map((domain, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveTab("home");
              setSelectedCategory(domain.name);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <span className="text-base">{domain.icon}</span>
            <span className="truncate">{domain.name}</span>
          </button>
        ))}
      </div>

    </aside>
  );
};
