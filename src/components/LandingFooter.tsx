import React, { useState } from "react";
import { Facebook, Linkedin, Instagram, Mail, Phone, Copy, Check } from "lucide-react";

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
    <footer className="w-full bg-white pt-10 select-none">
      <div className="w-full max-w-6xl mx-auto rounded-t-[36px] sm:rounded-t-[44px] bg-[#071d37] text-white px-8 sm:px-14 lg:px-20 pt-14 pb-8 shadow-2xl border-t border-x border-white/10">
        
        {/* Main Columns: Left (Logo + Socials) & Right (Contact Details) */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-16">
          
          {/* Left Column: Logo + Social Media icons underneath */}
          <div className="flex flex-col items-start">
            <img
              src="/logo.png"
              alt="MARIN Academy"
              className="h-[150px] w-[190px] object-contain select-none"
            />

            {/* Social Media Icons row: Facebook, LinkedIn, Instagram */}
            <div className="flex items-center gap-5 mt-[33px] pl-[37px] text-white/85">
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
          <div className="flex flex-col items-start text-right" dir="rtl">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
              تواصل معنا
            </h3>

            <div className="flex flex-col gap-3 text-sm sm:text-base text-slate-200">
              {/* Email with Mail icon & Copy Trigger */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="mailto:marin.academy.dz@gmail.com"
                  className="flex items-center gap-3 text-white hover:text-sky-300 transition-colors cursor-pointer"
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
                className="flex items-center gap-3 text-white hover:text-sky-300 transition-colors cursor-pointer"
                dir="ltr"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                <span>+213 559 39 12 11</span>
              </a>

              {/* Address details in Arabic */}
              <div className="flex flex-col pt-1 text-slate-200 text-sm sm:text-base leading-relaxed text-right">
                <span>ترقية بروطازير، عين سمارة 25054،</span>
                <span>قسنطينة، الجزائر</span>
              </div>
            </div>
          </div>

        </div>

        {/* Centered horizontal divider line matching screenshot */}
        <div className="w-full max-w-4xl mx-auto border-t border-white/15 mt-12 mb-6" />

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
