import React, { useState } from 'react';
import { UserProfile, KYCTier, KYCStatus } from '../types';
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

  const getTierBadgeColor = (tier: KYCTier) => {
    switch(tier) {
      case KYCTier.TIER_3: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case KYCTier.TIER_2: return 'bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30';
      case KYCTier.TIER_1: return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  const isRedemptionArc = user.currentStreak > 0 && user.reputationScore < 60;

  if (isEditing) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-sm">
        <h3 className="text-xl font-semibold text-white mb-6">Edit Identity</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#00e599] outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Annual Income ($)</label>
              <input 
                type="number" 
                value={formData.income}
                onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Employment</label>
              <input 
                type="text" 
                value={formData.employmentStatus}
                onChange={e => setFormData({...formData, employmentStatus: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Financial Bio</label>
            <textarea 
              value={formData.financialHistory}
              onChange={e => setFormData({...formData, financialHistory: e.target.value})}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white h-24 focus:border-[#00e599] outline-none resize-none transition-colors"
              placeholder="Explain any past hardships here."
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
        <div className="flex-1 w-full space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {user.name}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getTierBadgeColor(user.kycTier)}`}>
                  {user.kycTier}
                </span>
                {isRedemptionArc && (
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-900 bg-emerald-900/30 text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                     Redemption Arc
                   </span>
                )}
              </div>
              <p className="text-zinc-400">{user.employmentStatus}</p>
            </div>
            <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={onAnalyzeRisk} 
                 className="text-xs"
               >
                 Risk Profile
               </Button>
               {user.kycTier !== KYCTier.TIER_3 && (
                 <Button variant="outline" size="sm" onClick={onVerifyClick} className="text-xs">
                   Upgrade KYC
                 </Button>
               )}
               <Button variant="ghost" onClick={() => setIsEditing(true)} className="text-xs">Edit</Button>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
             {user.badges.map(badge => (
                <span key={badge} className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                  {badge}
                </span>
             ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">Repayments</div>
               <div className="text-2xl font-bold text-white">{user.successfulRepayments}</div>
             </div>
             <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">Streak</div>
               <div className="text-2xl font-bold text-[#00e599]">{user.currentStreak} 🔥</div>
             </div>
             <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">Limit</div>
               <div className="text-lg font-medium text-white">${user.kycLimit.toLocaleString()}</div>
             </div>
             <div className="bg-black p-4 rounded-xl border border-zinc-800 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">Income</div>
               <div className="text-lg font-medium text-white">${user.income.toLocaleString()}</div>
             </div>
          </div>
          
          <div className="p-4 rounded-xl border border-dashed border-zinc-800">
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="text-zinc-300 font-semibold mr-2">AI Analysis:</span> 
              "{user.riskAnalysis || user.financialHistory}"
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center justify-center p-6 bg-black rounded-full border border-zinc-800 aspect-square">
          <ScoreGauge score={user.reputationScore} />
          {isAnalyzing && <p className="text-[#00e599] text-xs animate-pulse mt-2 font-medium">Updating...</p>}
        </div>
      </div>
    </div>
  );
};