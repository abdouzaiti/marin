import React, { useState } from "react";
import { 
  GraduationCap, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  BookOpen, 
  Briefcase,
  PlayCircle,
  Star,
  Layers,
  ChevronLeft,
  Video,
  Building2,
  Handshake,
  Network,
  Globe,
  Share2
} from "lucide-react";
import { motion } from "motion/react";
import { VideoCourse } from "../data/videoCourses";
import { LandingFooter } from "./LandingFooter";
import { useLanguage } from "../context/LanguageContext";

interface MarinHomePageProps {
  onExploreAcademy: () => void;
  onSelectCourse: (course: VideoCourse) => void;
  courses: VideoCourse[];
  onOpenContact?: () => void;
  onOpenAbout?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const MarinHomePage: React.FC<MarinHomePageProps> = ({
  onExploreAcademy,
  onSelectCourse,
  courses,
  onOpenContact,
  onOpenAbout,
  setActiveTab
}) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { t, language } = useLanguage();

  return (
    <div className="flex-1 bg-white text-slate-900 w-full flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden" dir={language === "ar" ? "rtl" : "ltr"}>
      
      {/* 1. HERO SECTION WITH PRO BLUE WAVES BACKGROUND in #1d8ccc */}
      <section className="relative overflow-hidden bg-[#1d8ccc] text-white pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-10">
        
        {/* Subtle CSS Gradient Wave Pattern & Light Refractions - High contrast on #1d8ccc */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 120% 70% at 50% -10%, rgba(255, 255, 255, 0.4), transparent 70%),
              radial-gradient(ellipse 90% 50% at 100% 40%, rgba(255, 255, 255, 0.25), transparent 60%),
              radial-gradient(ellipse 80% 60% at 0% 80%, rgba(255, 255, 255, 0.2), transparent 60%),
              repeating-radial-gradient(circle at 100% 0%, transparent 0, transparent 40px, rgba(255, 255, 255, 0.06) 40px, rgba(255, 255, 255, 0.06) 42px)
            `
          }}
        />

        {/* Decorative Wave Background SVG Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top white/sky glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-white/20 rounded-full blur-3xl" />
          <div className="absolute top-20 left-10 w-[450px] h-[300px] bg-sky-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-10 w-[500px] h-[300px] bg-[#0c6b9e]/30 rounded-full blur-3xl" />

          {/* Organic Background Wave Line Accents */}
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-35"
            viewBox="0 0 1440 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-100 130 C 280 320, 680 40, 1540 220 L 1540 700 L -100 700 Z"
              fill="url(#wave-gradient-1)"
              opacity="0.5"
            />
            <path
              d="M-100 260 C 380 70, 920 340, 1540 210 L 1540 700 L -100 700 Z"
              fill="url(#wave-gradient-2)"
              opacity="0.4"
            />
            <path
              d="M-100 420 C 450 260, 850 510, 1540 360 L 1540 700 L -100 700 Z"
              fill="url(#wave-gradient-3)"
              opacity="0.45"
            />
            <path
              d="M-100 550 C 350 420, 950 620, 1540 480 L 1540 700 L -100 700 Z"
              fill="url(#wave-gradient-4)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-1" x1="0" y1="0" x2="1440" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.4" />
                <stop stopColor="#80cef8" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="wave-gradient-2" x1="0" y1="0" x2="1440" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.3" />
                <stop stopColor="#45abdf" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="wave-gradient-3" x1="0" y1="0" x2="1440" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.25" />
                <stop stopColor="#80cef8" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="wave-gradient-4" x1="0" y1="0" x2="1440" y2="700" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.2" />
                <stop stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* RIGHT COLUMN (RTL/LTR): Compelling Typography & CTAs */}
            <div className={`lg:col-span-6 xl:col-span-7 ${language === "ar" ? "text-right" : "text-left"} space-y-6 sm:space-y-7`}>
              
              {/* Main Headline with Custom Highlight Badge */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.25]">
                  {t("heroTitle")}
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium leading-relaxed pt-2 max-w-xl">
                  {t("heroSubtitle")}
                </p>
              </div>

              {/* Action Buttons (Dual Pill CTAs) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onExploreAcademy}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#041d37] hover:bg-[#072a4f] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#041d37]/30 transition-all transform active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t("browseCourses")}</span>
                </button>

                {onOpenAbout && (
                  <button
                    onClick={onOpenAbout}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base border-2 border-white/50 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <span>{t("aboutUs")}</span>
                  </button>
                )}


              </div>
            </div>

            {/* LEFT COLUMN (RTL): Visual Composite with Floating Glass Stat Badges */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center relative">
              
              <div className="relative w-full max-w-[380px] sm:max-w-[440px] aspect-square flex items-center justify-center">
                
                {/* Background Blue Circle Accent */}
                <div className="absolute w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-white/25 -top-2 right-4 sm:right-8 opacity-90 shadow-xl blur-xs" />
                
                {/* Secondary Blue Gradient Wave Disk behind */}
                <div className="absolute w-72 sm:w-88 h-72 sm:h-88 rounded-full bg-white/15 blur-xl -bottom-4 -left-4 pointer-events-none" />

                {/* Decorative Dot Matrix Patterns */}
                <div className="absolute top-6 left-0 opacity-40 grid grid-cols-4 gap-1.5 pointer-events-none">
                  {[...Array(16)].map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
                </div>
                <div className="absolute bottom-8 right-2 opacity-30 grid grid-cols-5 gap-1.5 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
                </div>

                {/* Main Hero Visual - Direct Transparent Graphic */}
                <div className="relative z-10 w-full flex items-center justify-center">
                  <img
                    src="/original.avif"
                    alt="MARIN Academy"
                    className="w-auto h-auto max-h-[340px] sm:max-h-[440px] max-w-full object-contain drop-shadow-2xl select-none transform transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Floating Stat Badge 1: Top Right (+15,000 طالب مشترك) */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="absolute -top-3 sm:-top-5 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-100/80 flex items-center gap-2.5"
                >
                  <div className="flex -space-x-2 overflow-hidden shrink-0">
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#041d37] flex items-center justify-center text-[10px] text-white font-bold">M</span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#1d8ccc] flex items-center justify-center text-[10px] text-white font-bold">A</span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#38bdf8] flex items-center justify-center text-[10px] text-[#041d37] font-bold">R</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">+15,000</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{t("activeTrainees")}</p>
                  </div>
                </motion.div>

                {/* Floating Stat Badge 2: Top Left (+1,500 فيديوهات مسجلة) */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="absolute top-12 sm:top-16 -left-3 sm:-left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-100/80 flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0062c4] flex items-center justify-center shadow-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">+1,500</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{t("recordedLectures")}</p>
                  </div>
                </motion.div>

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Smooth Curved Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
          <svg
            className="relative block w-full h-10 sm:h-16 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* 2. "تعرف علينا" SECTION (About MARIN & The 3 Core Ecosystem Branches) */}
      <section id="about-section" className="py-14 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#1d8ccc] text-xs font-bold mb-1">
              <span>{t("aboutUs")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#041d37] tracking-tight">
              {t("ecosystemTitle")}
            </h2>
            <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              {t("ecosystemSubtitle")}
            </p>
          </div>

          {/* ===== ARTISTIC ILLUSTRATIVE 3 BRANCHES ECOSYSTEM ===== */}
          <div className="relative pt-2 pb-6">

            {/* Glowing Origin Node at Title Base */}
            <div className="flex justify-center -mb-2 relative z-20">
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#0062c4] via-[#1d8ccc] to-[#38bdf8] shadow-lg shadow-blue-500/30 flex items-center justify-center border-2 border-white">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <div className="absolute -inset-2 rounded-full bg-blue-400/20 blur-md pointer-events-none" />
              </div>
            </div>

            {/* 2. ARTISTIC ORGANIC FLOWING BRANCH LINES (Illustrated Curving SVG Rivers branching directly from title) */}
            <div className="hidden lg:block relative w-full h-28 -my-2 pointer-events-none z-10">
              <svg className="w-full h-full" viewBox="0 0 1000 110" fill="none" preserveAspectRatio="none">
                <defs>
                  {/* Branch 1: Deep Executive Navy & MARIN Blue Gradient */}
                  <linearGradient id="branchNavy" x1="500" y1="0" x2="160" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d8ccc" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#0a2540" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#041d37" stopOpacity="1" />
                  </linearGradient>

                  {/* Branch 2: Signature MARIN Blue Gradient */}
                  <linearGradient id="branchBlue" x1="500" y1="0" x2="500" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#1d8ccc" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0062c4" stopOpacity="1" />
                  </linearGradient>

                  {/* Branch 3: Deep Sapphire Blue Gradient */}
                  <linearGradient id="branchSapphire" x1="500" y1="0" x2="840" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d8ccc" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0f3357" stopOpacity="1" />
                  </linearGradient>

                  {/* Soft Line Glow Filters */}
                  <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ambient Soft Glow River Traces */}
                <path
                  d="M 500,5 C 470,45 240,30 160,105"
                  stroke="url(#branchNavy)"
                  strokeWidth="8"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 500,5 C 500,40 500,70 500,105"
                  stroke="url(#branchBlue)"
                  strokeWidth="8"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
                <path
                  d="M 500,5 C 530,45 760,30 840,105"
                  stroke="url(#branchSapphire)"
                  strokeWidth="8"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />

                {/* Primary Artistic Swirling Curves */}
                <path
                  d="M 500,5 C 470,45 240,30 160,105"
                  stroke="url(#branchNavy)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />
                <path
                  d="M 500,5 C 500,40 500,70 500,105"
                  stroke="url(#branchBlue)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />
                <path
                  d="M 500,5 C 530,45 760,30 840,105"
                  stroke="url(#branchSapphire)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />

                {/* Artistic Floating Stream Particle Accents in Brand Tones */}
                <circle cx="340" cy="38" r="3" fill="#0284c7" />
                <circle cx="230" cy="62" r="4" fill="#38bdf8" />
                
                <circle cx="500" cy="55" r="3.5" fill="#1d8ccc" />
                
                <circle cx="660" cy="38" r="3" fill="#0284c7" />
                <circle cx="770" cy="62" r="4" fill="#38bdf8" />

                {/* Terminal Branch Anchors with glowing nodes */}
                <circle cx="160" cy="105" r="6" fill="#041d37" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="500" cy="105" r="6" fill="#1d8ccc" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="840" cy="105" r="6" fill="#0f3357" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Mobile Vertical Artistic Stem */}
            <div className="lg:hidden flex justify-center py-4">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#1d8ccc] via-[#0284c7] to-[#041d37] shadow-md" />
            </div>

            {/* 3. ARTISTIC SCULPTED BRANCH ISLANDS (Brand-Aligned Theme) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 pt-2 relative z-20">
              
              {/* ===== BRANCH 1: أكبر نادي أعمال في الغرب الجزائري ===== */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative"
              >
                {/* Ambient Soft Brand Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-blue-500/15 via-[#041d37]/10 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-slate-50/60 rounded-[36px] p-7 sm:p-8 shadow-[0_12px_35px_rgba(4,29,55,0.06)] border-2 border-slate-200/80 group-hover:border-[#1d8ccc]/60 group-hover:shadow-[0_20px_45px_rgba(4,29,55,0.12)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  <div className={`space-y-4 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-[#041d37] leading-snug group-hover:text-[#1d8ccc] transition-colors">
                        {t("clubTitle")}
                      </h3>
                      <p className="text-xs font-bold text-[#1d8ccc] tracking-wide">
                        MARIN Business Club Network
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {t("clubDesc")}
                    </p>

                    {/* Key Highlights with Brand Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("clubItem1")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("clubItem2")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("clubItem3")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#041d37] font-black">
                    <span className="bg-slate-100 text-[#041d37] px-3.5 py-1 rounded-full border border-slate-200/60">
                      MARIN Business Club
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#041d37] text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 group-hover:bg-[#1d8ccc] transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* ===== BRANCH 2: الأكاديمية الرقمية والتدريب التطبيقي (E-Academy) ===== */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative"
              >
                {/* Ambient Soft Brand Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-blue-400/25 via-sky-300/15 to-transparent blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-blue-50/40 rounded-[36px] p-7 sm:p-8 shadow-[0_12px_35px_rgba(29,140,204,0.08)] border-2 border-blue-200/90 group-hover:border-[#1d8ccc] group-hover:shadow-[0_20px_45px_rgba(29,140,204,0.18)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  <div className={`space-y-4 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-[#041d37] leading-snug group-hover:text-[#1d8ccc] transition-colors">
                        {t("academyBranchTitle")}
                      </h3>
                      <p className="text-xs font-bold text-[#1d8ccc] tracking-wide">
                        E-Academy & Practical Training
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {t("academyBranchDesc")}
                    </p>

                    {/* Key Highlights with Brand Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-blue-100/70">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("academyItem1")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("academyItem2")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("academyItem3")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-blue-100/80 flex items-center justify-between text-xs text-[#1d8ccc] font-black">
                    <span className="bg-blue-50 text-[#1d8ccc] px-3.5 py-1 rounded-full border border-blue-200/50">
                      MARIN E-Academy
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#1d8ccc] text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 group-hover:bg-[#0062c4] transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </motion.div>

              {/* ===== BRANCH 3: شبكة العلاقات وفرص الأعمال ===== */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="group relative"
              >
                {/* Ambient Soft Brand Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-sky-400/15 via-[#0f3357]/10 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-slate-50/60 rounded-[36px] p-7 sm:p-8 shadow-[0_12px_35px_rgba(4,29,55,0.06)] border-2 border-slate-200/80 group-hover:border-[#1d8ccc]/60 group-hover:shadow-[0_20px_45px_rgba(4,29,55,0.12)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  <div className={`space-y-4 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-[#041d37] leading-snug group-hover:text-[#1d8ccc] transition-colors">
                        {t("networkBranchTitle")}
                      </h3>
                      <p className="text-xs font-bold text-[#1d8ccc] tracking-wide">
                        Networking & Business Relationships
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {t("networkBranchDesc")}
                    </p>

                    {/* Key Highlights with Brand Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("networkItem1")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("networkItem2")}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>{t("networkItem3")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#041d37] font-black">
                    <span className="bg-slate-100 text-[#041d37] px-3.5 py-1 rounded-full border border-slate-200/60">
                      MARIN Networking Hub
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#041d37] text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 group-hover:bg-[#1d8ccc] transition-all">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. "من نحن" (ABOUT US) SECTION WITH CURVED BLUE BACKGROUND */}
      <section className="relative w-full overflow-hidden my-4 sm:my-8" id="about-section">
        
        {/* Top Curved Edge (Dipping concave arc inspired by reference image) */}
        <div className="w-full overflow-hidden leading-none pointer-events-none -mb-[1px]">
          <svg
            className="w-full h-10 sm:h-16 lg:h-20 block text-[#eef6fc]"
            viewBox="0 0 1440 90"
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0,0 Q720,90 1440,0 L1440,90 L0,90 Z" />
          </svg>
        </div>

        {/* Central Content Canvas with Soft Blue Background */}
        <div className="bg-[#eef6fc] w-full py-8 sm:py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">

            {/* Section Heading */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#041d37] tracking-tight">
                {t("aboutTitle")}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed pt-1">
                {t("aboutSubtitle")}
              </p>
            </div>

            {/* Core Pillars: Vision, Mission, Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Pillar 1: Vision */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-blue-100 ${language === "ar" ? "text-right" : "text-left"} relative overflow-hidden group`}
              >
                <div className={`absolute top-0 ${language === "ar" ? "right-0" : "left-0"} w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                <div className="space-y-3 relative z-10">
                  <h3 className="text-lg sm:text-xl font-black text-[#041d37]">
                    {t("visionTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {t("visionDesc")}
                  </p>
                </div>
              </motion.div>

              {/* Pillar 2: Mission */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-blue-100 ${language === "ar" ? "text-right" : "text-left"} relative overflow-hidden group`}
              >
                <div className={`absolute top-0 ${language === "ar" ? "right-0" : "left-0"} w-24 h-24 bg-sky-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                <div className="space-y-3 relative z-10">
                  <h3 className="text-lg sm:text-xl font-black text-[#041d37]">
                    {t("missionTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {t("missionDesc")}
                  </p>
                </div>
              </motion.div>

              {/* Pillar 3: Values */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 border border-blue-100 ${language === "ar" ? "text-right" : "text-left"} relative overflow-hidden group`}
              >
                <div className={`absolute top-0 ${language === "ar" ? "right-0" : "left-0"} w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform`} />
                <div className="space-y-3 relative z-10">
                  <h3 className="text-lg sm:text-xl font-black text-[#041d37]">
                    {t("valuesTitle")}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {t("valuesDesc")}
                  </p>
                </div>
              </motion.div>

            </div>

          </div>
        </div>

        {/* Bottom Curved Edge (Bowing convex arc extending into the white section below) */}
        <div className="w-full overflow-hidden leading-none pointer-events-none -mt-[1px]">
          <svg
            className="w-full h-10 sm:h-16 lg:h-20 block text-[#eef6fc]"
            viewBox="0 0 1440 90"
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L1440,0 L1440,0 Q720,90 0,0 Z" />
          </svg>
        </div>

      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#041d37] via-[#092b4c] to-[#041d37] rounded-3xl p-6 sm:p-12 text-white text-center space-y-5 shadow-2xl relative overflow-hidden border border-blue-400/20">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#1d8ccc]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t("ctaTitle")}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-blue-100/90 font-normal leading-relaxed">
              {t("ctaDesc")}
            </p>
            <div className="pt-2">
              <button
                onClick={onExploreAcademy}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1d8ccc] to-[#0284c7] hover:from-[#177bb5] hover:to-[#0270a8] text-white font-bold text-sm shadow-xl shadow-blue-950/40 hover:shadow-blue-500/30 transition-all cursor-pointer transform active:scale-98"
              >
                <span>{t("ctaButton")}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer with Dark Capsule Palette */}
      <LandingFooter 
        onOpenContact={onOpenContact} 
        onOpenAbout={onOpenAbout} 
      />
    </div>
  );
};

