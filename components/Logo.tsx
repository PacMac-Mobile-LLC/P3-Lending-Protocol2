import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-end leading-none select-none">
        {/* Primary P */}
        <span className="font-sans font-bold text-4xl text-white tracking-tighter">
          P
        </span>
        {/* Subscript 3 - Gradient */}
        <span className="font-sans font-bold text-2xl -mb-1 ml-0.5 text-transparent bg-clip-text bg-gradient-to-br from-[#667eea] to-[#764ba2]">
          3
        </span>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center h-full">
          <span className="font-sans text-xl font-light tracking-wide text-white">
            Lending
          </span>
        </div>
      )}
    </div>
  );
};
