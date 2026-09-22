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
  Play,
  Building2,
  Handshake,
  Network,
  Globe,
  Compass,
  Share2
} from "lucide-react";
import { motion } from "motion/react";
import { VideoCourse } from "../data/videoCourses";
import { LandingFooter } from "./LandingFooter";

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

  return (
    <div className="flex-1 bg-white text-slate-900 w-full flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden" dir="rtl">
      
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
            
            {/* RIGHT COLUMN (RTL): Compelling Typography & CTAs */}
            <div className="lg:col-span-6 xl:col-span-7 text-right space-y-6 sm:space-y-7">
              
              {/* Main Headline with Custom Highlight Badge */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.25]">
                  تعلّم الريادة والأعمال <br className="hidden sm:inline" />
                  <span className="inline-block text-white mt-1 sm:mt-2">
                    بالتطبيق العملي
                  </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/95 font-medium leading-relaxed pt-2 max-w-xl">
                  نُقدم <span className="relative font-bold text-white underline decoration-white/60 decoration-2 underline-offset-4">دورات تدريبية</span> متخصصة في مجالات الإدارة والمالية الذكية والتسويق، بأسلوب تدريبي يركز على التطبيق العملي وبناء ونمو الشركات.
                </p>
              </div>

              {/* Action Buttons (Dual Pill CTAs) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onExploreAcademy}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#041d37] hover:bg-[#072a4f] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#041d37]/30 transition-all transform active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>استعراض الدورات</span>
                </button>

                {onOpenAbout && (
                  <button
                    onClick={onOpenAbout}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base border-2 border-white/50 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <span>من نحن</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (setActiveTab) setActiveTab("register");
                  }}
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-white hover:text-white font-bold text-xs sm:text-sm hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span>انضم إلينا ←</span>
                </button>
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
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#1d8ccc] flex items-center justify-center text-[10px] text-white font-bold">A</span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold">M</span>
                    <span className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold">S</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-900 leading-tight">+15,000</p>
                    <p className="text-[10px] text-slate-500 font-semibold">متدرب نشط</p>
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
                    <p className="text-[10px] text-slate-500 font-semibold">محاضرة مسجلة</p>
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
      <section className="py-14 sm:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#041d37] tracking-tight">
              ركائز منظومة <span className="text-[#1d8ccc]">MARIN</span>
            </h2>
            <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              منظومة متكاملة لرواد الأعمال وأصحاب المشاريع تجمع بين التدريب التطبيقي، نادي الأعمال، وشبكة العلاقات الاستثمارية في الجزائر
            </p>
          </div>

          {/* ===== ARTISTIC ILLUSTRATIVE 3 BRANCHES ECOSYSTEM ===== */}
          <div className="relative pt-6 pb-10">

            {/* 1. ARTISTIC CENTRAL LOGO HUB (Sculpted Floating Island) */}
            <div className="flex flex-col items-center justify-center relative z-20">
              
              {/* Radial Aura Behind Center */}
              <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-blue-400/20 via-sky-300/25 to-emerald-300/20 blur-2xl pointer-events-none -z-10" />

              <motion.div 
                initial={{ scale: 0.85, opacity: 0, y: -10 }}
                whileInView={{ scale: 1, opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative group cursor-default"
              >
                {/* Organic Sculpted Outer Glow Frame */}
                <div className="relative bg-gradient-to-b from-white via-white/95 to-slate-50/90 backdrop-blur-xl p-7 sm:p-9 rounded-[42px] sm:rounded-[50px] shadow-[0_20px_50px_rgba(29,140,204,0.15)] border-2 border-white flex flex-col items-center justify-center max-w-xs sm:max-w-sm text-center transform transition-transform duration-500 hover:scale-105">
                  
                  {/* Subtle Organic Inner Accent Rings */}
                  <div className="absolute inset-2 rounded-[36px] sm:rounded-[44px] border border-blue-100/60 pointer-events-none" />

                  {/* Logo Display with enhanced sizing */}
                  <img
                    src="/logo.png"
                    alt="MARIN Logo"
                    className="h-24 sm:h-32 w-auto object-contain drop-shadow-lg select-none transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Decorative glowing bottom droplet node */}
                  <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-b from-[#1d8ccc] to-blue-700 shadow-lg border-2 border-white flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 2. ARTISTIC ORGANIC FLOWING BRANCH LINES (Illustrated Curving SVG Rivers) */}
            <div className="hidden lg:block relative w-full h-36 -my-4 pointer-events-none z-10">
              <svg className="w-full h-full" viewBox="0 0 1000 140" fill="none" preserveAspectRatio="none">
                <defs>
                  {/* Branch 1: Emerald Gradient */}
                  <linearGradient id="branchEmerald" x1="500" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d8ccc" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                  </linearGradient>

                  {/* Branch 2: Center Blue Gradient */}
                  <linearGradient id="branchBlue" x1="500" y1="0" x2="500" y2="140" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d8ccc" stopOpacity="1" />
                    <stop offset="60%" stopColor="#0284c7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                  </linearGradient>

                  {/* Branch 3: Amber / Sunset Gradient */}
                  <linearGradient id="branchAmber" x1="500" y1="0" x2="840" y2="140" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1d8ccc" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
                  </linearGradient>

                  {/* Soft Line Glow Filters */}
                  <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Ambient Soft Glow River Traces */}
                <path
                  d="M 500,10 C 470,65 240,40 160,135"
                  stroke="url(#branchEmerald)"
                  strokeWidth="8"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
                <path
                  d="M 500,10 C 500,50 500,90 500,135"
                  stroke="url(#branchBlue)"
                  strokeWidth="8"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
                <path
                  d="M 500,10 C 530,65 760,40 840,135"
                  stroke="url(#branchAmber)"
                  strokeWidth="8"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />

                {/* Primary Artistic Swirling Curves */}
                <path
                  d="M 500,10 C 470,65 240,40 160,135"
                  stroke="url(#branchEmerald)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />
                <path
                  d="M 500,10 C 500,50 500,90 500,135"
                  stroke="url(#branchBlue)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />
                <path
                  d="M 500,10 C 530,65 760,40 840,135"
                  stroke="url(#branchAmber)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowLine)"
                />

                {/* Artistic Floating Stream Particle Accents */}
                <circle cx="340" cy="48" r="3" fill="#10b981" />
                <circle cx="230" cy="78" r="4.5" fill="#34d399" />
                
                <circle cx="500" cy="70" r="3.5" fill="#38bdf8" />
                
                <circle cx="660" cy="48" r="3" fill="#f59e0b" />
                <circle cx="770" cy="78" r="4.5" fill="#fbbf24" />

                {/* Terminal Branch Anchors with glowing nodes */}
                <circle cx="160" cy="135" r="7" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="500" cy="135" r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <circle cx="840" cy="135" r="7" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Mobile Vertical Artistic Stem */}
            <div className="lg:hidden flex justify-center py-6">
              <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#1d8ccc] via-emerald-400 to-amber-400 shadow-md" />
            </div>

            {/* 3. ARTISTIC SCULPTED BRANCH ISLANDS (Art-inspired Floating Forms) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 pt-2 relative z-20">
              
              {/* ===== BRANCH 1: أكبر نادي أعمال في الغرب الجزائري ===== */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative"
              >
                {/* Organic Ambient Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-emerald-400/20 via-teal-300/10 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-emerald-50/30 rounded-[36px] p-7 sm:p-8 shadow-[0_15px_40px_rgba(16,185,129,0.08)] border-2 border-emerald-100/80 group-hover:border-emerald-300 group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  <div className="space-y-4 text-right">
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                        أكبر نادي أعمال في الغرب الجزائري
                      </h3>
                      <p className="text-xs font-bold text-emerald-600/90 tracking-wide">
                        The Biggest Business Club in West Algeria
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      ملتقى نخبوي يجمع قادة الشركات والمستثمرين ورواد الأعمال في الغرب الجزائري لتبادل الفرص الاستثمارية والخبرات القيادية وصناعة التحالفات.
                    </p>

                    {/* Key Highlights with Organic Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-emerald-100/60">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                        <span>لقاءات دورية وندوات أعمال استراتيجية</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                        <span>حاضنة شراكات وتكتلات تجارية رائدة</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                        <span>بيئة احترافية لدعم توسع وتطوير الشركات</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-emerald-100/70 flex items-center justify-between text-xs text-emerald-700 font-black">
                    <span className="bg-emerald-50 px-3 py-1 rounded-full">MARIN Business Club</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 transition-transform">
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
                {/* Organic Ambient Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-blue-400/25 via-sky-300/15 to-transparent blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-blue-50/40 rounded-[36px] p-7 sm:p-8 shadow-[0_15px_40px_rgba(29,140,204,0.12)] border-2 border-blue-200 group-hover:border-[#1d8ccc] group-hover:shadow-[0_20px_50px_rgba(29,140,204,0.22)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  {/* Crown Ribbon at Top */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-[#1d8ccc] to-sky-500 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    المنصة التعليمية الرسمية
                  </div>

                  <div className="space-y-4 text-right pt-2">
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-[#1d8ccc] transition-colors">
                        الأكاديمية الرقمية والتدريب التطبيقي
                      </h3>
                      <p className="text-xs font-bold text-blue-600/90 tracking-wide">
                        E-Academy & Practical Training
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      منصة تدريبية متخصصة تقدم دورات مكثفة قائمة على دراسات حالة حقيقية ونماذج تشغيلية جاهزة للتنفيذ الفوري في الإدارة، التسويق، والمالية.
                    </p>

                    {/* Key Highlights with Organic Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-blue-100/70">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>دروس تفاعلية ومسجلة بجودة عالية</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>نماذج وملفات عمل قابلة للتحميل والتطبيق</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#1d8ccc] shrink-0 shadow-xs" />
                        <span>شهادات إتمام ومتابعة عملية من الخبراء</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-blue-100/80 flex items-center justify-between text-xs text-[#1d8ccc] font-black">
                    <span className="bg-blue-50 px-3 py-1 rounded-full">MARIN E-Academy</span>
                    <div className="w-8 h-8 rounded-full bg-[#1d8ccc] text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 transition-transform">
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
                {/* Organic Ambient Glow Behind Card */}
                <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-b from-amber-400/20 via-orange-300/10 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Sculpted Asymmetric Organic Card Container */}
                <div className="relative bg-gradient-to-b from-white via-white to-amber-50/30 rounded-[36px] p-7 sm:p-8 shadow-[0_15px_40px_rgba(245,158,11,0.08)] border-2 border-amber-100/80 group-hover:border-amber-300 group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] transition-all duration-500 flex flex-col justify-between h-full transform group-hover:-translate-y-2">
                  
                  <div className="space-y-4 text-right">
                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                        شبكة العلاقات وفرص الأعمال
                      </h3>
                      <p className="text-xs font-bold text-amber-600/90 tracking-wide">
                        Networking & Business Relationships
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      جسر استراتيجي لتشبيك العلاقات بين أصحاب المشاريع، المستثمرين، والمؤسسات لتسريع الصفقات وفتح آفاق تجارية وشراكات نوعية.
                    </p>

                    {/* Key Highlights with Organic Bullets */}
                    <div className="space-y-2.5 pt-3 border-t border-amber-100/60">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-xs" />
                        <span>جلسات تشبيك مغلقة (B2B Networking)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-xs" />
                        <span>ربط مباشر بين المشاريع الواعدة والمستثمرين</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-xs" />
                        <span>فرص حصرية للتعاقد والتمويل والتوسع الإقليمي</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Artistic Footer */}
                  <div className="mt-8 pt-4 border-t border-amber-100/70 flex items-center justify-between text-xs text-amber-700 font-black">
                    <span className="bg-amber-50 px-3 py-1 rounded-full">MARIN Networking Hub</span>
                    <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md transform group-hover:-translate-x-1.5 transition-transform">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>

          </div>

          {/* Interactive Platform Video / Feature Presentation Showcase */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#091f3a] to-[#041d37] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-100">
            {/* Background Light Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Geometric Dot Matrix Corner */}
            <div className="absolute top-6 left-6 opacity-30 grid grid-cols-6 gap-1 pointer-events-none hidden sm:grid">
              {[...Array(24)].map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-300" />
              ))}
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5 text-right">
                <h3 className="text-xl sm:text-3xl font-black leading-snug">
                  منصة شاملة تجمع بين النظريات المتقدمة والتطبيق الميداني للشركات
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  لا نكتفي بالشرح الأكاديمي المجرد؛ بل نقدم نماذج مالية حقيقية، واستراتيجيات تسويق موجهة، وهيكلة تنظيمية قابلة للتحميل والتطبيق الفوري في مشروعك أو شركتك.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-lg font-black text-blue-400">100%</p>
                    <p className="text-xs text-slate-300">نماذج وملفات عمل قابلة للتنزيل</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-lg font-black text-rose-400">مباشر ومسجل</p>
                    <p className="text-xs text-slate-300">وصول دائم لجميع التحديثات</p>
                  </div>
                </div>
              </div>

              {/* Video Player Card Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  onClick={() => {
                    const first = courses[0];
                    if (first) onSelectCourse(first);
                  }}
                  className="group relative w-full aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl cursor-pointer flex items-center justify-center"
                >
                  <img
                    src="/instructor.jpg"
                    alt="MARIN Platform Video"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Play Button */}
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                  <span className="absolute bottom-3 text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    شاهد العرض التعريفي
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#091f3a] via-[#041d37] to-[#091f3a] rounded-3xl p-6 sm:p-12 text-white text-center space-y-5 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black">
              ابدأ رحلتك التدريبية وطوّر أعمالك اليوم
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal">
              انضم إلى آلاف المتعلمين واستفد من أحدث الدورات الاستراتيجية في أكاديمية مارين.
            </p>
            <div className="pt-2">
              <button
                onClick={onExploreAcademy}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-sm shadow-xl hover:shadow-rose-500/30 transition-all cursor-pointer transform active:scale-98"
              >
                <span>دخول الأكاديمية والبدء الآن</span>
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

