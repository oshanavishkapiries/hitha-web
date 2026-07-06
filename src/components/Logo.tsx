"use client";

import React from 'react';
import { navigateTo } from '../utils/navigation';

interface LogoProps {
  theme?: 'light' | 'dark'; // 'light' is light text (mint) for dark background; 'dark' is dark text (forest) for light background
  id?: string;
  className?: string;
}

export default function Logo({ theme = 'dark', id = 'logo-btn', className = '' }: LogoProps) {
  // theme === 'light' uses text-mint for dark backgrounds like AdminNavbar
  // theme === 'dark' uses text-forest for light backgrounds like public/doctor Navbars
  const themeClasses = theme === 'light' 
    ? 'text-mint hover:text-[#9ED993]' 
    : 'text-forest hover:text-moss';

  return (
    <button
      onClick={() => navigateTo('/')}
      className={`font-display font-bold text-2xl tracking-tight cursor-pointer focus:outline-none transition-colors ${themeClasses} ${className}`}
      id={id}
    >
      Hitha
    </button>
  );
}
