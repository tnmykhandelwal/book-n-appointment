import React from 'react';

function Logo({ size = 40 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* 1. Outer Tech Circles (Symbolizing networks, digital connectivity, and booking data) */}
      <circle cx="50" cy="50" r="42" stroke="#3b82f6" strokeWidth="4" strokeDasharray="6 6" opacity="0.6" />
      <circle cx="50" cy="50" r="35" stroke="#2563eb" strokeWidth="2" opacity="0.4" />
      
      {/* 2. Digital Nodes / Tech Pixels (Connecting the medical cross to the grid) */}
      <circle cx="50" cy="12" r="3" fill="#60a5fa" />
      <circle cx="50" cy="88" r="3" fill="#60a5fa" />
      <circle cx="12" cy="50" r="3" fill="#60a5fa" />
      <circle cx="88" cy="50" r="3" fill="#60a5fa" />
      
      {/* 3. The Medical Cross (Styled with smooth rounded corners to feel accessible and clean) */}
      <path 
        d="M40 25C40 22.2386 42.2386 20 45 20H55C57.7614 20 60 22.2386 60 25V40H75C77.7614 40 80 42.2386 80 45V55C80 57.7614 77.7614 60 75 60H60V75C60 57.7614 57.7614 80 55 80H45C42.2386 80 40 77.7614 40 75V60H25C22.2386 60 20 57.7614 20 55V45C20 42.2386 22.2386 40 25 40H40V25Z" 
        fill="url(#logoGradient)" 
      />

      {/* 4. Digital Heartbeat / Pulsing EKG Line cutting across the center */}
      <path 
        d="M25 50H38L43 35L49 65L55 45L59 53L63 50H75" 
        stroke="#ffffff" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Vibrant Blue (Tech) */}
          <stop offset="100%" stopColor="#10b981" /> {/* Deep Emerald Green (Health) */}
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;