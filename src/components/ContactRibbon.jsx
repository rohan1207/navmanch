'use client';

import React from 'react';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const ContactRibbon = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-newsRed via-red-600 to-newsRed shadow-lg border-t border-red-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2 md:py-2.5">
          {/* Centered Contact Info */}
          <div className="flex items-center gap-3 md:gap-5 flex-wrap justify-center">
            {/* Ads & News Contact Label */}
            <div className="flex items-center gap-2 bg-red-800/80 px-2.5 py-1 rounded border border-red-700/30">
              <span className="text-cleanWhite text-sm md:text-base font-semibold uppercase tracking-wide whitespace-nowrap">
                <span className="hidden md:inline">जाहिरात आणि बातम्या संपर्क</span>
                <span className="md:hidden">संपर्क</span>
              </span>
            </div>

            {/* Phone Number */}
            <a
              href="tel:+919158578008"
              className="flex items-center gap-1.5 text-cleanWhite hover:text-yellow-200 transition-colors duration-200 group"
            >
              <FaPhone className="text-sm md:text-base group-hover:scale-105 transition-transform duration-200" />
              <span className="text-sm md:text-base font-medium whitespace-nowrap">
                <span className="hidden sm:inline">मो. नं.: </span>
                <span className="font-semibold">९१५८५७८००८</span>
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:navmanch25@gmail.com"
              className="flex items-center gap-1.5 text-cleanWhite hover:text-yellow-200 transition-colors duration-200 group"
            >
              <FaEnvelope className="text-sm md:text-base group-hover:scale-105 transition-transform duration-200" />
              <span className="text-sm md:text-base font-medium whitespace-nowrap truncate max-w-[180px] md:max-w-none">
                <span className="hidden sm:inline">ईमेल: </span>
                <span className="font-semibold">navmanch25@gmail.com</span>
              </span>
            </a>

            {/* WhatsApp Link - Robust for all platforms (wa.me works on iOS, Android, Desktop) */}
            <a
              href="https://wa.me/919158578008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500/90 hover:bg-green-500 text-cleanWhite px-2.5 py-1 rounded-full text-sm md:text-base font-medium transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
            >
              <FaWhatsapp className="text-sm md:text-base" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactRibbon;

