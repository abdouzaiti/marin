import React, { useState } from "react";
import { YouTubeNavbar } from "./components/YouTubeNavbar";
import { YouTubeBottomNav } from "./components/YouTubeBottomNav";
import { YouTubeHomeFeed } from "./components/YouTubeHomeFeed";
import { YouTubeWatchPage } from "./components/YouTubeWatchPage";
import { YouTubeStudioModal } from "./components/YouTubeStudioModal";
import { AiSimulationLab } from "./components/AiSimulationLab";
import { CareerAdvisorView } from "./components/CareerAdvisorView";
import { UserProfileView } from "./components/UserProfileView";
import { AuthPage } from "./components/AuthPage";
import { VIDEO_COURSES, VideoCourse } from "./data/videoCourses";
import { UserProfile } from "./types";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>("home"); // "home" | "watch" | "explore" | "simulations" | "career"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tout");
  const [courses, setCourses] = useState<VideoCourse[]>(VIDEO_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | null>(VIDEO_COURSES[0]);
  const [studioOpen, setStudioOpen] = useState<boolean>(false);
  const { isRTL } = useLanguage();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alexandre Dupont",
    email: "alexandre.dupont@marinacademy.pro",
    title: "Apprenant Professionnel",
    xp: 680,
    streak: 6,
    completedModules: ["vc-1-l1"],
    enrolledPath: null,
    activeDomain: "Comptabilité & Finance"
  });

  const completeModule = (id: string) => {
    if (!userProfile.completedModules.includes(id)) {
      setUserProfile((prev) => ({
        ...prev,
        xp: prev.xp + 100,
        completedModules: [...prev.completedModules, id]
      }));
    }
  };

  const handleSelectCourse = (course: VideoCourse) => {
    setSelectedCourse(course);
    setActiveTab("watch");
  };

  const handleCourseGenerated = (newCourse: VideoCourse) => {
    setCourses([newCourse, ...courses]);
    setSelectedCourse(newCourse);
    setActiveTab("watch");
  };

  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  return (
    <div className={`relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${isRTL ? "text-right" : "text-left"}`}>
      
      {/* Floating Dark Pill Top Navbar / Hero Banner */}
      <YouTubeNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      <div className="flex flex-1 w-full pb-14 md:pb-0">
        
        {/* Main Content Area - Full width */}
        <main className="flex-1 flex flex-col w-full">
          {(activeTab === "home" || activeTab === "courses") && (
            <YouTubeHomeFeed
              courses={courses}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              selectCourse={handleSelectCourse}
              openStudio={() => setStudioOpen(true)}
              userProfile={userProfile}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "explore" && (
            <YouTubeHomeFeed
              courses={courses}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              selectCourse={handleSelectCourse}
              openStudio={() => setStudioOpen(true)}
              userProfile={userProfile}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "watch" && selectedCourse && (
            <YouTubeWatchPage
              course={selectedCourse}
              courses={courses}
              selectCourse={handleSelectCourse}
              goHome={() => setActiveTab("home")}
              userProfile={userProfile}
              completeModule={completeModule}
            />
          )}

          {activeTab === "simulations" && (
            <div className="flex-1 overflow-y-auto">
              <AiSimulationLab />
            </div>
          )}

          {activeTab === "career" && (
            <div className="flex-1 overflow-y-auto">
              <CareerAdvisorView userProfile={userProfile} />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto">
              <UserProfileView
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                courses={courses}
                selectCourse={handleSelectCourse}
                setActiveTab={setActiveTab}
              />
            </div>
          )}

          {(activeTab === "login" || activeTab === "register") && (
            <div className="flex-1 overflow-y-auto">
              <AuthPage
                initialMode={activeTab === "register" ? "register" : "login"}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onSuccess={() => setActiveTab("home")}
                onBackToHome={() => setActiveTab("home")}
              />
            </div>
          )}
        </main>

      </div>

      {/* Bottom Navigation Bar for Mobile / Phone screens */}
      <YouTubeBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openStudio={() => setStudioOpen(true)}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Contact Us Modal (تواصل معنا) */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <h2 className="text-xl font-black text-[#041d37]">تواصل معنا</h2>
            </div>

            <div className="space-y-4 text-slate-700 text-sm">
              <p className="text-slate-600 font-medium leading-relaxed">
                يسعدنا الرد على جميع استفساراتكم حول برامجنا ودوراتنا التدريبية المتخصصة.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-end gap-3 font-semibold text-slate-900">
                  <span>contact@marinacademy.pro</span>
                  <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">✉</span>
                </div>
                <div className="flex items-center justify-end gap-3 font-semibold text-slate-900">
                  <span dir="ltr">+33 1 89 71 24 50 / +213 550 12 34 56</span>
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">📞</span>
                </div>
                <div className="flex items-center justify-end gap-3 font-semibold text-slate-900">
                  <span>الجزائر العاصمة & باريس</span>
                  <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">📍</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setContactModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#0062c4] hover:bg-[#0070e0] text-white font-bold transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal (من نحن) */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <button
                onClick={() => setAboutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
              <h2 className="text-xl font-black text-[#041d37]">من نحن — MARIN Academy</h2>
            </div>

            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <p>
                <strong>أكاديمية مارين (MARIN Academy)</strong> هي منصة رائدة متخصصة في تقديم دورات تدريبية احترافية عالية التأثير في مجالات الإدارة والمالية، التسويق الاستراتيجي، وأنظمة نمو الشركات.
              </p>
              <p className="text-slate-600">
                نساعد رواد الأعمال، المدراء التنفيذيين والمهنيين على الانتقال من التسيير العشوائي إلى التحكم الكامل وبناء شركات رابحة ومستدامة بأحدث المعايير الدولية.
              </p>
              
              <div className="pt-4">
                <button
                  onClick={() => setAboutModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#041d37] hover:bg-[#06294d] text-white font-bold transition-colors cursor-pointer"
                >
                  حسناً، فهمت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Studio Modal */}
      <YouTubeStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        onCourseGenerated={handleCourseGenerated}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

