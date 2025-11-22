
import React from 'react';

interface AppLogoProps {
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className = "w-32 h-32" }) => {
  // Colores definidos: Primary (Cyan) #00E5FF, Secondary (Silver) #E2E8F0
  const primary = "#00E5FF";
  const secondary = "#E2E8F0";
  const bg = "#0A0F1A";

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      
      {/* Base Geometry: Hexagon Shield */}
      <path d="M50 5 L95 25 V75 L50 95 L5 75 V25 Z" fill={bg} stroke={secondary} strokeWidth="1" />
      
      {/* Inner Circuitry - Data Flow */}
      <path d="M50 20 V 40" stroke={primary} strokeWidth="2" filter="url(#neonGlow)" />
      <circle cx="50" cy="50" r="8" stroke={primary} strokeWidth="2" fill="none" filter="url(#neonGlow)" />
      <circle cx="50" cy="50" r="3" fill={primary} filter="url(#neonGlow)" />
      
      {/* Radiating Lines (Network) */}
      <path d="M50 58 V 80" stroke={secondary} strokeWidth="1" opacity="0.5" />
      <path d="M58 50 H 80" stroke={secondary} strokeWidth="1" opacity="0.5" />
      <path d="M42 50 H 20" stroke={secondary} strokeWidth="1" opacity="0.5" />
      
      {/* Outer Shell Highlights */}
      <path d="M50 5 L95 25" stroke={primary} strokeWidth="2" opacity="0.8" />
      <path d="M5 25 L50 5" stroke={primary} strokeWidth="2" opacity="0.8" />
      <path d="M95 75 L50 95 L5 75" stroke={secondary} strokeWidth="1" opacity="0.5" />

      {/* Status Indicator */}
      <circle cx="85" cy="15" r="2" fill={primary} className="animate-pulse">
        <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
      </circle>

    </svg>
  );
};

export default AppLogo;