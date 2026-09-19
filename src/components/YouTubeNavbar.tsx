import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const bannerRef = useRef<HTMLDivElement>(null);
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  // Monitor scroll to detect when the big banner hides out of the viewport
  useEffect(() => {
    const checkScrollPosition = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        // When bottom of banner is at or above top edge of window, it is hidden
        setIsScrolledPast(rect.bottom <= 20);
      }
    };

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    document.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition();

    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
      document.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* 1. Main Big Hero Banner Header Section (Targeted element) */}
      <header className="w-full px-3 sm:px-6 pt-3 sm:pt-5 pb-2 bg-transparent select-none z-40">
        <div
          ref={bannerRef}
          className="relative w-[1050px] max-w-full h-[90px] mx-auto rounded-[26px] bg-[#091f3a] text-white px-5 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xl border border-white/10"
        >
          {/* Left Side: Action CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            <button
              onClick={() => setActiveTab("register")}
              className="rounded-full bg-[#0062c4] hover:bg-[#0070e0] text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 flex items-center gap-2 shadow-md shadow-blue-900/30 hover:shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>ابدأ الآن</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Center: Brand Logo in Hero Section (Jumps to topbar when hidden with 360° turn) */}
          <div
            onClick={() => setActiveTab("home")}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer transition-transform hover:opacity-90 active:scale-98 z-10"
          >
            {!isScrolledPast && (
              <motion.img
                layoutId="marin-academy-jumping-logo"
                src="/logo.png"
                alt="MARIN Academy"
                className="h-[75px] w-auto max-w-[170px] object-contain select-none"
                animate={{ rotate: 0, scale: 1 }}
                whileHover={{ rotate: 360, transition: { duration: 0.65, ease: "easeInOut" } }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  mass: 0.85,
                  rotate: {
                    duration: 0.7,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
              />
            )}
          </div>

          {/* Right Side spacer */}
          <div className="flex items-center gap-4 sm:gap-7 z-10" />
        </div>
      </header>

      {/* 2. Classic Topbar that appears directly when the big section hides */}
      <AnimatePresence>
        {isScrolledPast && (
          <motion.div
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#091f3a]/95 backdrop-blur-md shadow-2xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between"
          >
            {/* Left: Quick Action Button */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              <button
                onClick={() => setActiveTab("register")}
                className="rounded-full bg-[#0062c4] hover:bg-[#0070e0] text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 flex items-center gap-1.5 sm:gap-2 shadow-md shadow-blue-900/40 hover:shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>ابدأ الآن</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Center: The Logo that smoothly jumped into the classic topbar! */}
            <div
              onClick={() => {
                setActiveTab("home");
                scrollToTop();
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity z-10"
            >
              <motion.img
                layoutId="marin-academy-jumping-logo"
                src="/logo.png"
                alt="MARIN Academy"
                className="h-10 sm:h-12 w-auto max-w-[160px] sm:max-w-[200px] object-contain select-none"
                animate={{ rotate: 360, scale: 1 }}
                whileHover={{ rotate: 720, transition: { duration: 0.65, ease: "easeInOut" } }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  mass: 0.85,
                  rotate: {
                    duration: 0.7,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
              />
            </div>

            {/* Right: Quick Links / Contact Modal trigger */}
            <div className="flex items-center gap-2 sm:gap-3 z-10">
              {onOpenContact && (
                <button
                  onClick={onOpenContact}
                  className="text-slate-200 hover:text-white transition-colors text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 cursor-pointer"
                >
                  تواصل معنا
                </button>
              )}
              {onOpenAbout && (
                <button
                  onClick={onOpenAbout}
                  className="text-slate-200 hover:text-white transition-colors text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 cursor-pointer hidden sm:block"
                >
                  من نحن
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};



