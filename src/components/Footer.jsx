'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-cleanWhite border-t-2 border-subtleGray mt-12 pb-20 md:pb-24">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <img 
                src="/logo1.png" 
                alt="NAV MANCH" 
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-slateBody text-sm mb-4 leading-relaxed">
              महाराष्ट्रातील अग्रगण्य मराठी वृत्तपत्र. सत्य, निष्पक्ष आणि वस्तुनिष्ठ बातम्या.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-deepCharcoal">
                <span className="font-semibold">PRGI Reg No:</span> MHMAR/25/A4153
              </p>
              <p className="text-deepCharcoal">
                <span className="font-semibold">मुख्य संपादक:</span> शिवानी सुरवसे पाटील
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-deepCharcoal">द्रुत लिंक</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slateBody hover:text-newsRed transition-colors">
                  मुखपृष्ठ
                </Link>
              </li>
              <li>
                <Link href="/epaper2" className="text-slateBody hover:text-newsRed transition-colors">
                  ई-पेपर
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-slateBody hover:text-newsRed transition-colors">
                  गॅलरी
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-slateBody hover:text-newsRed transition-colors">
                  लेख
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-slateBody hover:text-newsRed transition-colors">
                  कार्यक्रम
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-deepCharcoal">संपर्क</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-newsRed flex-shrink-0" />
                <span className="text-slateBody leading-relaxed">
                  स.नं २ अवनी ए विंग तिसरा फ्लोर ३०२,<br />
                  न्याती चौक, डी.पी.एस विद्यालय जवळ,<br />
                  मोहम्मदवाडी, पुणे सिटी,<br />
                  पुणे (महाराष्ट्र) - ४११०६०
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-newsRed flex-shrink-0" />
                <a 
                  href="tel:+919158578008" 
                  className="text-slateBody hover:text-newsRed transition-colors"
                >
                  मो. नं. ९१५८५७८००८
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-newsRed flex-shrink-0" />
                <a 
                  href="mailto:navmanch25@gmail.com" 
                  className="text-slateBody hover:text-newsRed transition-colors"
                >
                  navmanch25@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-deepCharcoal">सोशल मीडिया</h3>
            <div className="flex gap-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slateBody hover:text-newsRed transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slateBody hover:text-newsRed transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slateBody hover:text-newsRed transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slateBody hover:text-newsRed transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slateBody hover:text-newsRed transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 pt-6 border-t border-subtleGray">
          <div className="bg-subtleGray/50 rounded-lg p-6">
            <h4 className="text-sm font-bold text-deepCharcoal mb-3">सूचना:</h4>
            <p className="text-xs text-slateBody leading-relaxed">
              या पोर्टलवर प्रकाशित होणाऱ्या सर्व बातम्या, लेख, विश्लेषण, मतलेख आणि इतर सामग्री ही संबंधित लेखक, संवाददाता किंवा योगदानकर्त्यांची वैयक्तिक मते, विचार आणि निष्कर्ष दर्शविते. जरी आवश्यकतेनुसार संपादकीय दुरुस्त्या केल्या जाऊ शकतात, तरी या पोर्टलचे संपादक, व्यवस्थापन किंवा संस्था या सामग्रीशी संपूर्णपणे सहमत असतीलच असे नाही.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t-2 border-subtleGray">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slateBody">
            <p className="text-center md:text-left">
              कॉपीराइट ©️ २०२५ <span className="font-bold text-newsRed">NAV MANCH</span>. सर्व हक्क सुरक्षित.
            </p>
            <p className="text-xs text-metaGray">
              Designed and developed by TheSocialKollab
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

