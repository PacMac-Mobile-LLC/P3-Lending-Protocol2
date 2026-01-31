import React, { useState } from 'react';
import { UserProfile, KYCTier, KYCStatus } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { Button } from './Button';

interface Props {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onVerifyClick: () => void;
  isAnalyzing: boolean;
}

export const UserProfileCard: React.FC<Props> = ({ user, onUpdate, onVerifyClick, isAnalyzing }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const getTierBadgeColor = (tier: KYCTier) => {
    switch(tier) {
      case KYCTier.TIER_3: return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case KYCTier.TIER_2: return 'bg-[#667eea]/10 text-[#667eea] border-[#667eea]/30';
      case KYCTier.TIER_1: return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-600';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-6">Edit Identity</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-[#667eea] outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Annual Income ($)</label>
              <input 
                type="number" 
                value={formData.income}
                onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-[#667eea] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Employment</label>
              <input 
                type="text" 
                value={formData.employmentStatus}
                onChange={e => setFormData({...formData, employmentStatus: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-[#667eea] outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Financial Bio</label>
            <textarea 
              value={formData.financialHistory}
              onChange={e => setFormData({...formData, financialHistory: e.target.value})}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white h-24 focus:border-[#667eea] outline-none resize-none transition-colors"
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
    <div className="group bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden transition-all hover:border-slate-600/50">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
        <div className="flex-1 w-full space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {user.name}
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTierBadgeColor(user.kycTier)}`}>
                  {user.kycTier}
                </span>
              </div>
              <p className="text-slate-400 font-light">{user.employmentStatus}</p>
            </div>
            <div className="flex gap-2">
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
                <span key={badge} className="px-3 py-1 rounded-full bg-slate-900/50 text-slate-300 text-xs border border-slate-700 shadow-sm">
                  {badge}
                </span>
             ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-700/30 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Repayments</div>
               <div className="text-2xl font-bold text-white">{user.successfulRepayments}</div>
             </div>
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-700/30 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Streak</div>
               <div className="text-2xl font-bold text-[#4facfe]">{user.currentStreak} 🔥</div>
             </div>
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-700/30 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Limit</div>
               <div className="text-lg font-medium text-white">${user.kycLimit.toLocaleString()}</div>
             </div>
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-700/30 text-center md:text-left">
               <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Income</div>
               <div className="text-lg font-medium text-white">${user.income.toLocaleString()}</div>
             </div>
          </div>
          
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/30">
            <p className="text-sm text-slate-400 leading-relaxed italic">
              <span className="text-[#667eea] font-medium not-italic mr-2">AI Assessment:</span> 
              "{user.riskAnalysis || user.financialHistory}"
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-slate-900/20 rounded-full border border-slate-700/20 aspect-square">
          <ScoreGauge score={user.reputationScore} />
          {isAnalyzing && <p className="text-[#667eea] text-xs animate-pulse mt-2 font-medium">Updating...</p>}
        </div>
      </div>
    </div>
  );
};
