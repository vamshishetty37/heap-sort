import React, { useState } from 'react';
// @ts-ignore
import logoUrl from '../logo.svg';

interface CollegeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'sidebar';
  variant?: 'light' | 'dark';
  className?: string;
}

export default function CollegeLogo({ 
  size = 'md', 
  variant = 'light', 
  className = '' 
}: CollegeLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Responsive sizing configurations
  const widthClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    sidebar: 'w-32 h-32',
  };

  const containerClasses = widthClasses[size] || widthClasses.md;

  // We can apply standard css filter to make the SVG white on dark backgrounds (like the sidebar)
  // to perfectly integrate the dark-blue logo with the dark blue ERP design!
  // This is a premium filter trick to turn the blue logo white or maintain dynamic styling.
  const filterStyle = variant === 'dark' 
    ? { filter: 'brightness(0) invert(1)' } 
    : {};

  if (hasError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center text-center ${className}`}
        id="logo-fallback-container"
      >
        <span className="font-sans font-black tracking-widest text-sm uppercase text-white bg-blue-600 px-3 py-1.5 rounded shadow border border-blue-400/20">
          IMPACT COLLEGE
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-block select-none overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 group p-1 ${className}`}
      id={`college-logo-${size}`}
    >
      <img
        src={logoUrl}
        alt="Impact College of Engineering"
        onError={() => setHasError(true)}
        className={`${containerClasses} object-contain transition-transform duration-300 pointer-events-none`}
        style={filterStyle}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
