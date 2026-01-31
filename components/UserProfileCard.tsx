import React, { useState } from 'react';
import { UserProfile, KYCTier } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { Button } from './Button';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onVerifyClick: () => void;
  onAnalyzeRisk: () => void;
  isAnalyzing: boolean;
}

export const UserProfileCard: React.FC<Props> = ({ user, onUpdate, onVerifyClick, onAnalyzeRisk, isAnalyzing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Edit Identity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-black/50 border border-zinc-800 rounded-lg p-3 text-white focus:border-[#00e599] outline-none"
          />
           <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e599]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Left: Avatar & Gauge */}
        <div className="flex flex-col items-center gap-4 min-w-[180px]">
           <div className="w-40 h-40 relative">
              <ScoreGauge score={user.reputationScore} />
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full">
                   <div className="w-8 h-8 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
           </div>
           <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${user.kycTier === KYCTier.TIER_3 ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                {user.kycTier}
              </span>
           </div>
        </div>

        {/* Right: Data Grid */}
        <div className="flex-1 w-full space-y-5">
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{user.name}</h2>
                <p className="text-zinc-500 text-sm font-mono mt-1">{user.employmentStatus} • {user.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs border border-zinc-800">
                Edit Profile
              </Button>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                 <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Repayments</div>
                 <div className="text-xl font-mono text-white">{user.successfulRepayments}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                 <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Streak</div>
                 <div className="text-xl font-mono text-[#00e599]">{user.currentStreak} 🔥</div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                 <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">KYC Limit</div>
                 <div className="text-xl font-mono text-white">${user.kycLimit.toLocaleString()}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                 <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Income</div>
                 <div className="text-xl font-mono text-white">${user.income.toLocaleString()}</div>
              </div>
              
              {/* Balance with Privacy Effect */}
              <div className="bg-black/40 p-3 rounded-lg border border-zinc-800/50 relative overflow-hidden group/privacy cursor-pointer">
                 <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1 flex items-center gap-1">
                   Balance <span className="text-[8px] bg-zinc-800 px-1 rounded text-zinc-500 group-hover/privacy:text-[#00e599] transition-colors">HIDDEN</span>
                 </div>
                 <div className="text-xl font-mono text-white blur-md select-none group-hover/privacy:blur-0 group-hover/privacy:select-auto transition-all duration-300">
                    ${user.balance.toLocaleString()}
                 </div>
              </div>
           </div>

           {/* AI Analysis Text */}
           <div className="pl-4 border-l-2 border-[#00e599]/30">
              <p className="text-xs text-zinc-400 italic">
                "{user.riskAnalysis || user.financialHistory}"
              </p>
           </div>

           {/* Badges */}
           <div className="flex gap-2 flex-wrap">
             {user.badges.map(b => (
               <span key={b} className="px-2 py-1 bg-zinc-800/50 border border-zinc-700 rounded text-[10px] text-zinc-300">
                 {b}
               </span>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
