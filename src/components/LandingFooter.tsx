import React, { useState } from "react";
import { Facebook, Linkedin, Instagram, Mail, Phone, Copy, Check, MapPin } from "lucide-react";

export const LandingFooter: React.FC<{ onOpenContact?: () => void; onOpenAbout?: () => void }> = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const email = "marin.academy.dz@gmail.com";
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          setCopiedEmail(true);
          setTimeout(() => setCopiedEmail(false), 2000);
        });
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };
  return (
    <footer className="w-full bg-transparent select-none relative overflow-hidden mt-8 sm:mt-12">
      {/* Big Asymmetric Organic Wave: High on the Right, sloping down towards the Left in #1d8ccc */}
      <div className="w-full overflow-hidden leading-none -mb-1 pointer-events-none">
        <svg
          className="relative block w-full h-20 sm:h-36 md:h-48 lg:h-56 xl:h-64"
          viewBox="0 0 1440 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Layer 1: Background Soft Sky Blue Accent */}
          <path
            d="M0 180 C 300 175, 600 130, 900 70 C 1140 25, 1320 10, 1440 0 L 1440 200 L 0 200 Z"
            fill="#80cef8"
            opacity="0.35"
          />
          {/* Layer 2: Middle Vibrant Sky Blue Accent */}
          <path
            d="M0 165 C 280 168, 560 115, 860 60 C 1100 20, 1300 8, 1440 2 L 1440 200 L 0 200 Z"
            fill="#45abdf"
            opacity="0.55"
          />
          {/* Layer 3: Main Wave Base in #1d8ccc */}
          <path
            d="M0 145 C 260 152, 540 98, 840 48 C 1080 12, 1280 5, 1440 4 L 1440 200 L 0 200 Z"
            fill="#1d8ccc"
          />
        </svg>
      </div>

      {/* Main Full-Width Footer Content in #1d8ccc */}
      <div className="w-full bg-[#1d8ccc] text-white px-5 sm:px-12 lg:px-20 pt-4 sm:pt-8 pb-10 shadow-lg">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Columns: Left (Logo + Socials) & Right (Contact Details) */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 sm:gap-10 md:gap-16">
            
            {/* Left Column: Logo + Social Media icons underneath */}
            <div className="flex flex-col items-start">
              <img
                src="/logo.png"
                alt="MARIN Academy"
                className="h-[80px] sm:h-[120px] md:h-[150px] w-auto max-w-[160px] sm:max-w-[190px] object-contain select-none brightness-105"
              />

              {/* Social Media Icons row: Facebook, LinkedIn, Instagram */}
              <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-6 md:mt-[33px] pl-1 sm:pl-[20px] md:pl-[37px] text-white">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:text-[#041d37] transition-transform hover:scale-110 cursor-pointer"
                >
                  <Facebook className="w-5 h-5" />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="hover:text-[#041d37] transition-transform hover:scale-110 cursor-pointer"
                >
                  <Linkedin className="w-5 h-5" />
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="hover:text-[#041d37] transition-transform hover:scale-110 cursor-pointer"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Column: Contact Us */}
            <div className="flex flex-col items-start text-right w-full sm:w-auto" dir="rtl">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4 tracking-tight">
                تواصل معنا
              </h3>

              <div className="flex flex-col gap-3 text-xs sm:text-sm md:text-base text-white/95 w-full font-medium">
                {/* Email with Mail icon & Copy Trigger */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="mailto:marin.academy.dz@gmail.com"
                    className="flex items-center gap-2.5 text-white hover:text-[#041d37] transition-colors cursor-pointer text-xs sm:text-sm md:text-base font-bold break-all"
                    dir="ltr"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                    <span>marin.academy.dz@gmail.com</span>
                  </a>

                  {/* Copy Trigger Icon Button */}
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    title={copiedEmail ? "تم النسخ!" : "نسخ البريد الإلكتروني"}
                    aria-label="نسخ البريد الإلكتروني"
                    className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
                      copiedEmail
                        ? "text-emerald-900 bg-emerald-300"
                        : "text-white/80 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-900" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>

                {/* Phone with Phone icon */}
                <a
                  href="tel:+213559391211"
                  className="flex items-center gap-2.5 text-white hover:text-[#041d37] transition-colors cursor-pointer text-xs sm:text-sm md:text-base font-bold"
                  dir="ltr"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                  <span>+213 559 39 12 11</span>
                </a>

                {/* Address details */}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Cité+Zaghloul+Mostaganem"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="عرض على خرائط Google"
                  className="flex items-start gap-2.5 text-white/95 hover:text-[#041d37] transition-colors pt-1 cursor-pointer group text-right"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col text-xs sm:text-sm md:text-base leading-relaxed">
                    <span className="font-bold text-white">حي زغلول، مستغانم</span>
                    <span className="text-[11px] sm:text-xs md:text-sm text-blue-100">Cité Zaghloul, Mostaganem, Algérie</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Centered horizontal divider line */}
          <div className="w-full max-w-4xl mx-auto border-t border-white/25 mt-8 sm:mt-12 mb-5 sm:mb-6" />

          {/* Centered copyright: © 2026 - MARIN academy */}
          <div className="text-center text-xs sm:text-sm text-white/90 font-medium">
            <span>© 2026 - </span>
            <span className="text-white font-bold">MARIN</span>
            <span> academy</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
