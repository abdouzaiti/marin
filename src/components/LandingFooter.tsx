import React, { useState } from "react";
import { Facebook, Linkedin, Instagram, Mail, Phone, Copy, Check, MapPin } from "lucide-react";

export const LandingFooter: React.FC = () => {
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
    <footer className="w-full bg-white pt-8 sm:pt-10 select-none">
      <div className="w-full max-w-6xl mx-auto rounded-t-[28px] sm:rounded-t-[44px] bg-[#071d37] text-white px-5 sm:px-12 lg:px-20 pt-10 sm:pt-14 pb-8 shadow-2xl border-t border-x border-white/10">
        
        {/* Main Columns: Left (Logo + Socials) & Right (Contact Details) */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 sm:gap-10 md:gap-16">
          
          {/* Left Column: Logo + Social Media icons underneath */}
          <div className="flex flex-col items-start">
            <img
              src="/logo.png"
              alt="MARIN Academy"
              className="h-[80px] sm:h-[120px] md:h-[150px] w-auto max-w-[160px] sm:max-w-[190px] object-contain select-none"
            />

            {/* Social Media Icons row: Facebook, LinkedIn, Instagram */}
            <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-6 md:mt-[33px] pl-1 sm:pl-[20px] md:pl-[37px] text-white/85">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition-transform hover:scale-110 cursor-pointer"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-white transition-transform hover:scale-110 cursor-pointer"
              >
                <Linkedin className="w-5 h-5" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-transform hover:scale-110 cursor-pointer"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Us translated to Arabic */}
          <div className="flex flex-col items-start text-right w-full sm:w-auto" dir="rtl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              تواصل معنا
            </h3>

            <div className="flex flex-col gap-3 text-xs sm:text-sm md:text-base text-slate-200 w-full">
              {/* Email with Mail icon & Copy Trigger */}
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="mailto:marin.academy.dz@gmail.com"
                  className="flex items-center gap-2.5 text-white hover:text-sky-300 transition-colors cursor-pointer text-xs sm:text-sm md:text-base break-all"
                  dir="ltr"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                  <span>marin.academy.dz@gmail.com</span>
                </a>

                {/* Copy Trigger Icon Button (Icon only without text) */}
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  title={copiedEmail ? "تم النسخ!" : "نسخ البريد الإلكتروني"}
                  aria-label="نسخ البريد الإلكتروني"
                  className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    copiedEmail
                      ? "text-emerald-400 bg-emerald-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>

              {/* Phone with Phone icon */}
              <a
                href="tel:+213559391211"
                className="flex items-center gap-2.5 text-white hover:text-sky-300 transition-colors cursor-pointer text-xs sm:text-sm md:text-base"
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
                className="flex items-start gap-2.5 text-slate-200 hover:text-sky-300 transition-colors pt-1 cursor-pointer group text-right"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 mt-0.5 group-hover:text-sky-300 transition-colors" />
                <div className="flex flex-col text-xs sm:text-sm md:text-base leading-relaxed">
                  <span className="font-semibold text-white">حي زغلول، مستغانم</span>
                  <span className="text-[11px] sm:text-xs md:text-sm text-slate-300">Cité Zaghloul, Mostaganem, Algérie</span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Centered horizontal divider line matching screenshot */}
        <div className="w-full max-w-4xl mx-auto border-t border-white/15 mt-8 sm:mt-12 mb-5 sm:mb-6" />

        {/* Centered copyright matching screenshot: © 2026 - MARIN academy */}
        <div className="text-center text-xs sm:text-sm text-white font-normal">
          <span>© 2026 - </span>
          <span className="text-white font-semibold">MARIN</span>
          <span> academy</span>
        </div>

      </div>
    </footer>
  );
};
