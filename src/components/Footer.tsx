"use client";

import React from 'react';
import { navigateTo } from '../utils/navigation';
import { Heart, HelpCircle, Mail, Phone, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#081611] text-sprout/80 border-t border-hairline/10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-hairline/10">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5">
              <Logo theme="light" id="footer-logo" />
            </div>
            <p className="text-xs text-sprout/60 leading-relaxed max-w-sm font-medium">
              Sri Lanka's local, privacy-first telehealth directory. Fully compliant with SLMC guidelines, offering a safe and anonymous mental health sanctuary.
            </p>
          </div>

          {/* Directory Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sanctuary Nav</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigateTo('/')}
                  className="group flex items-center text-xs text-sprout/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-mint opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  <span>Public Sanctuary</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/search')}
                  className="group flex items-center text-xs text-sprout/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-mint opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  <span>Specialist Directory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    // Try to trigger blog open event
                    window.dispatchEvent(new CustomEvent('hitha-open-blogs'));
                  }}
                  className="group flex items-center text-xs text-sprout/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-mint opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  <span>Read Blogs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Portal Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Access Portals</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigateTo('/doctor/login')}
                  className="group flex items-center text-xs text-sprout/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-mint opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  <span>Clinician Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/admin/login')}
                  className="group flex items-center text-xs text-sprout/70 hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-2 text-mint opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  <span>Administrative Control</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Support Contact</h4>
            <ul className="space-y-2.5 text-xs text-sprout/60">
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-mint" />
                <a href="mailto:support@hitha.lk" className="hover:text-white transition-colors">support@hitha.lk</a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-mint" />
                <span className="font-mono">+94 (11) 234-5678</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <HelpCircle className="w-4 h-4 text-mint" />
                <span>Trilingual Help Desk</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-sprout/45 font-medium">
          <div className="flex items-center space-x-2">
            <span>© 2026 Hitha Sri Lanka. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-1.5 text-sprout/30">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-clay animate-pulse fill-clay" />
            <span>in Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
