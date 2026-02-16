
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { DocumentService } from '../client-services/documentService';

interface Props {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onDeposit: (amount: number) => void;
}

export const ProfileSettings: React.FC<Props> = ({ user, onSave, onDeposit }) => {
  const [formData, setFormData] = useState(user);
  const [isSaving, setIsSaving] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave(formData);
    setIsSaving(false);
  };

  const handleDownloadStatement = () => {
    DocumentService.generateStatement(user);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-8 pb-10">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h2>
        <p className="text-zinc-500 mt-1">Manage your identity, appearance, and personal details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Avatar Section */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 border border-zinc-800/50">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-[#00e599] transition-all relative">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-white">Profile Picture</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xs mb-4">
              Upload a high-resolution image to build trust with lenders.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Upload New
              </Button>
              {formData.avatarUrl && (
                <Button type="button" size="sm" variant="ghost" onClick={() => setFormData({ ...formData, avatarUrl: undefined })}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Documents & Statements Section (NEW) */}
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-zinc-800/50">
          <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-4 mb-6">Documents & Statements</h3>

          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-[#00e599]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-900/20 text-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Monthly Statement (Feb 2025)</h4>
                <p className="text-xs text-zinc-500">PDF • 1.2 MB • Generated Automatically</p>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleDownloadStatement}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download
            </Button>
          </div>

          <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50 opacity-75">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 text-zinc-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div>
                <h4 className="text-zinc-400 font-bold text-sm">Annual Tax Form 1099-INT</h4>
                <p className="text-xs text-zinc-600">Available Jan 31, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Funds Section (For Testing Referrals) */}
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-zinc-800/50">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white">Wallet & Funds</h3>
            <span className="text-sm text-[#00e599] font-mono">Current Balance: ${formData.balance}</span>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Simulate Deposit ($)</label>
            <div className="flex gap-4">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="flex-1 bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
              <Button type="button" variant="primary" onClick={() => onDeposit(depositAmount)}>
                Add Funds
              </Button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              *Adding $100+ will trigger a "Qualified Referral" event if you were invited.
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="glass-panel p-8 rounded-2xl space-y-6 border border-zinc-800/50">
          <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-4 mb-6">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Employment Title</label>
              <input
                type="text"
                value={formData.employmentStatus}
                onChange={e => handleChange('employmentStatus', e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Annual Income ($)</label>
              <input
                type="number"
                value={formData.income}
                onChange={e => handleChange('income', parseInt(e.target.value))}
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Wallet Address (Linked)</label>
              <input
                type="text"
                disabled
                value="0x71C...9A21"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Financial Narrative / Bio</label>
            <textarea
              rows={4}
              value={formData.financialHistory}
              onChange={e => handleChange('financialHistory', e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors text-sm leading-relaxed"
              placeholder="Explain your financial situation and goals..."
            />
            <p className="text-[10px] text-zinc-500 mt-2">
              This narrative is analyzed by our AI to help determine your reputation score context.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => setFormData(user)}>Reset Changes</Button>
          <Button type="submit" isLoading={isSaving} className="min-w-[120px]">Save Profile</Button>
        </div>

      </form>
    </div>
  );
};
