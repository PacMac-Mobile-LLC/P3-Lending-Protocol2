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
      case KYCTier.TIER_3: return 'bg-purple-900 text-purple-200 border-purple-500';
      case KYCTier.TIER_2: return 'bg-yellow-900 text-yellow-200 border-yellow-500';
      case KYCTier.TIER_1: return 'bg-blue-900 text-blue-200 border-blue-500';
      default: return 'bg-gray-700 text-gray-400 border-gray-500';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Update Financial Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Annual Income ($)</label>
              <input 
                type="number" 
                value={formData.income}
                onChange={e => setFormData({...formData, income: Number(e.target.value)})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Employment</label>
              <input 
                type="text" 
                value={formData.employmentStatus}
                onChange={e => setFormData({...formData, employmentStatus: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Financial History / Bio</label>
            <textarea 
              value={formData.financialHistory}
              onChange={e => setFormData({...formData, financialHistory: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="e.g. I have paid off my car loan..."
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit">Save & Analyze</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.93-9h.03l3.39-4.85c.32-.45.02-1.08-.54-1.12l-4.14-.32L9.82 3.86c-.19-.52-.94-.52-1.13 0L6.84 8.71l-4.14.32c-.56.04-.86.67-.54 1.12L5.55 15h.03l-1.05 5.51c-.1.54.47.98.94.73l4.53-2.39 4.53 2.39c.47.25 1.04-.19.94-.73L12.93 11z"/></svg>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {user.name}
                </h2>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getTierBadgeColor(user.kycTier)}`}>
                  {user.kycTier}
                </div>
              </div>
              <p className="text-indigo-400 font-medium">{user.employmentStatus}</p>
            </div>
            <div className="flex gap-2">
               {user.kycTier !== KYCTier.TIER_3 && (
                 <Button variant="primary" size="sm" onClick={onVerifyClick} className="text-xs">
                   Upgrade Tier
                 </Button>
               )}
               <Button variant="outline" onClick={() => setIsEditing(true)} className="text-xs px-2 py-1">Edit Profile</Button>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 flex-wrap mb-4">
             {user.badges.map(badge => (
                <span key={badge} className="px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs border border-gray-600">
                  {badge}
                </span>
             ))}
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
             <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
               <div className="text-xs text-gray-400">Repayments</div>
               <div className="text-xl font-bold text-white">{user.successfulRepayments}</div>
             </div>
             <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
               <div className="text-xs text-gray-400">Current Streak</div>
               <div className="text-xl font-bold text-emerald-400">{user.currentStreak} 🔥</div>
             </div>
             <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
               <div className="text-xs text-gray-400">Borrowing Limit</div>
               <div className="text-sm font-medium text-white">${user.kycLimit.toLocaleString()}</div>
             </div>
             <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
               <div className="text-xs text-gray-400">Income</div>
               <div className="text-sm font-medium text-white">${user.income.toLocaleString()}</div>
             </div>
          </div>
          
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400 leading-relaxed italic">
              AI Insight: "{user.riskAnalysis || user.financialHistory}"
            </p>
          </div>
        </div>

        <div className="w-48 flex-shrink-0 flex flex-col items-center">
          <ScoreGauge score={user.reputationScore} />
          {isAnalyzing && <p className="text-indigo-400 text-xs animate-pulse mt-2">AI Underwriter Active...</p>}
        </div>
      </div>
    </div>
  );
};
