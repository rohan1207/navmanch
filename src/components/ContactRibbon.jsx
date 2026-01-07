'use client';

import React from 'react';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const ContactRibbon = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-newsRed via-red-600 to-newsRed shadow-lg border-t border-red-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2 md:py-2.5">
          {/* Desktop: Centered Contact Info */}
          <div className="hidden md:flex items-center gap-4 flex-nowrap justify-center">
            {/* Ads & News Contact Label */}
            <div className="flex items-center gap-2 bg-red-800/80 px-2.5 py-1 rounded border border-red-700/30">
              <span className="text-cleanWhite text-lg font-semibold uppercase tracking-wide whitespace-nowrap">
                जाहिरात आणि बातम्या संपर्क
              </span>
            </div>

            {/* Phone Number */}
            <a
              href="tel:+919158578008"
              className="flex items-center gap-1.5 text-cleanWhite hover:text-yellow-200 transition-colors duration-200 group"
            >
              <FaPhone 
                className="text-lg transition-transform duration-200" 
                style={{ transform: 'scaleX(-1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scaleX(-1) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scaleX(-1)';
                }}
              />
              <span className="text-lg font-medium whitespace-nowrap">
                <span>मो. नं.: </span>
                <span className="font-semibold">९१५८५७८००८</span>
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:navmanch25@gmail.com"
              className="flex items-center gap-1.5 text-cleanWhite hover:text-yellow-200 transition-colors duration-200 group"
            >
              <FaEnvelope className="text-lg group-hover:scale-105 transition-transform duration-200" />
              <span className="text-lg font-medium whitespace-nowrap">
                <span>ईमेल: </span>
                <span className="font-semibold">navmanch25@gmail.com</span>
              </span>
            </a>

            {/* WhatsApp Link */}
            <a
              href="https://wa.me/919158578008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500/90 hover:bg-green-500 text-cleanWhite px-2.5 py-1 rounded-full text-lg font-medium transition-all duration-200 shadow-sm hover:shadow cursor-pointer whitespace-nowrap"
            >
              <FaWhatsapp className="text-lg" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile: Scrolling Marquee */}
          <div className="md:hidden w-full overflow-hidden relative">
            <div className="flex items-center animate-scroll">
              {/* Duplicate content for seamless loop */}
              <div className="flex items-center gap-3 flex-shrink-0 px-4">
                <div className="flex items-center gap-1.5 bg-red-800/80 px-2 py-0.5 rounded border border-red-700/30">
                  <span className="text-cleanWhite text-sm font-semibold uppercase tracking-wide whitespace-nowrap">
                    संपर्क
                  </span>
                </div>
                <a
                  href="tel:+919158578008"
                  className="flex items-center gap-1 text-cleanWhite hover:text-yellow-200 transition-colors duration-200"
                >
                  <FaPhone 
                    className="text-sm transition-transform duration-200" 
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    <span>मो. नं.: </span>
                    <span className="font-semibold">९१५८५७८००८</span>
                  </span>
                </a>
                <a
                  href="mailto:navmanch25@gmail.com"
                  className="flex items-center gap-1 text-cleanWhite hover:text-yellow-200 transition-colors duration-200"
                >
                  <FaEnvelope className="text-sm" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    <span>ईमेल: </span>
                    <span className="font-semibold">navmanch25@gmail.com</span>
                  </span>
                </a>
                <a
                  href="https://wa.me/919158578008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-500/90 hover:bg-green-500 text-cleanWhite px-2 py-0.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <FaWhatsapp className="text-sm" />
                  <span>WhatsApp</span>
                </a>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex items-center gap-3 flex-shrink-0 px-4">
                <div className="flex items-center gap-1.5 bg-red-800/80 px-2 py-0.5 rounded border border-red-700/30">
                  <span className="text-cleanWhite text-sm font-semibold uppercase tracking-wide whitespace-nowrap">
                    संपर्क
                  </span>
                </div>
                <a
                  href="tel:+919158578008"
                  className="flex items-center gap-1 text-cleanWhite hover:text-yellow-200 transition-colors duration-200"
                >
                  <FaPhone 
                    className="text-sm transition-transform duration-200" 
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    <span>मो. नं.: </span>
                    <span className="font-semibold">९१५८५७८००८</span>
                  </span>
                </a>
                <a
                  href="mailto:navmanch25@gmail.com"
                  className="flex items-center gap-1 text-cleanWhite hover:text-yellow-200 transition-colors duration-200"
                >
                  <FaEnvelope className="text-sm" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    <span>ईमेल: </span>
                    <span className="font-semibold">navmanch25@gmail.com</span>
                  </span>
                </a>
                <a
                  href="https://wa.me/919158578008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-green-500/90 hover:bg-green-500 text-cleanWhite px-2 py-0.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap"
                >
                  <FaWhatsapp className="text-sm" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactRibbon;

