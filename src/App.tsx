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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home"); // "home" | "watch" | "explore" | "simulations" | "career"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tout");
  const [courses, setCourses] = useState<VideoCourse[]>(VIDEO_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | null>(VIDEO_COURSES[0]);
  const [studioOpen, setStudioOpen] = useState<boolean>(false);

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

  return (
    <div className="relative min-h-screen h-screen bg-slate-950 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Absolute Transparent Floating Top Navbar */}
      <YouTubeNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      <div className="flex flex-1 overflow-hidden h-full w-full pb-14 md:pb-0">
        
        {/* Main Content Area - Full width */}
        <main className="flex-1 flex flex-col overflow-hidden w-full h-full">
          {activeTab === "home" && (
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

      {/* AI Studio Modal */}
      <YouTubeStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        onCourseGenerated={handleCourseGenerated}
      />

    </div>
  );
}
