import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800">
        <span className="font-sans font-bold text-2xl text-white tracking-tighter">
          P
        </span>
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00e599] text-[10px] font-bold text-black">
          3
        </span>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center h-full">
          <span className="font-sans text-lg font-semibold tracking-tight text-white">
            Lending
          </span>
        </div>
      )}
    </div>
  );
};