
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  noBorder?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', noBorder = false }) => {
  const containerSizes = {
    sm: 'scale-75 p-2',
    md: 'scale-100 p-4',
    lg: 'scale-125 p-6'
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none bg-white rounded-[40px] ${noBorder ? '' : 'border-2 border-[#0F482F]/10 shadow-xl'} ${containerSizes[size]} transition-all duration-500 hover:scale-105 active:scale-95`}>
      {/* Leaves and Dots from the image */}
      <div className="relative h-16 w-32 flex items-center justify-center">
        {/* Bubbles/Dots */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1 -mt-2">
            <div className="w-2.5 h-2.5 bg-[#0F482F] rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-[#0F482F] rounded-full mt-1"></div>
        </div>
        
        {/* Peach Leaf (Small) */}
        <div className="absolute left-8 top-4 -rotate-[25deg]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M2 22C2 22 8 21 16 11C20 6 20 2 20 2C20 2 17 2 12 6C2 14 2 22 2 22Z" fill="#E5AB7E" fillOpacity="0.9" />
          </svg>
        </div>
        
        {/* Forest Green Leaf (Large) */}
        <div className="relative z-10 rotate-[15deg] ml-4">
          <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
            <path d="M4 28C4 28 12 26 22 14C26 8 26 4 26 4C26 4 22 4 16 10C6 20 4 28 4 28Z" fill="#0F482F" />
            <path d="M4 28C10 24 16 18 22 14" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* Vitalis Text Section */}
      <div className="flex flex-col items-center -mt-2 px-4 pb-2">
        <h1 className="flex flex-col items-center font-sans">
          <span className="text-[#0F482F] font-[900] text-5xl tracking-tighter leading-none uppercase">Vita<span className="text-[#E5AB7E]">lis</span></span>
        </h1>
        {/* Swoosh from the image */}
        <div className="w-32 h-3 mt-1 opacity-90">
          <svg viewBox="0 0 100 20" fill="none" className="w-full h-full">
            <path d="M5 10C35 18 65 18 95 10" stroke="#E5AB7E" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Logo;
