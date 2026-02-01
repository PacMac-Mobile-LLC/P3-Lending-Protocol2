import React, { useState } from 'react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
}

export const ReferralModal: React.FC<Props> = ({ isOpen, onClose, referralCode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://p3securities.com/join/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(0,229,153,0.1)] relative overflow-hidden">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="p-8 text-center relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="w-16 h-16 bg-[#00e599]/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[#00e599]/50">
             <span className="text-3xl">🚀</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Boost Your Reputation</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Invite friends to P3 Securities. For every Tier 1 verified user you refer, your Reputation Score increases by <strong className="text-[#00e599]">+5 points</strong>.
          </p>

          <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-6 flex items-center justify-between group cursor-pointer" onClick={handleCopy}>
             <div className="text-left">
               <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Your Referral Link</div>
               <div className="text-white font-mono text-sm truncate max-w-[200px]">p3securities.com/join/{referralCode}</div>
             </div>
             <div className="text-zinc-500 group-hover:text-white transition-colors">
                {copied ? (
                  <span className="text-[#00e599] font-bold text-xs flex items-center gap-1">
                    ✓ Copied
                  </span>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                )}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
             <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Referrals</div>
             </div>
             <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-2xl font-bold text-[#00e599]">+0</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Score Boost</div>
             </div>
          </div>

          <div className="flex gap-3">
            <Button className="w-full" onClick={handleCopy}>Copy Link</Button>
            <Button variant="secondary" className="w-full" onClick={() => window.open(`https://twitter.com/intent/tweet?text=I'm building my financial reputation on @P3Securities. Join me and ditch the FICO score: p3securities.com/join/${referralCode}`, '_blank')}>
              Share on X
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};