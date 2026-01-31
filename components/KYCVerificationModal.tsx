import React, { useState } from 'react';
import { Button } from './Button';
import { performComplianceCheck } from '../services/geminiService';
import { KYCTier } from '../types';

interface Props {
  currentTier: KYCTier;
  onClose: () => void;
  onUpgradeComplete: (newTier: KYCTier, limit: number) => void;
}

export const KYCVerificationModal: React.FC<Props> = ({ currentTier, onClose, onUpgradeComplete }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    ssn: '',
    docType: 'drivers_license'
  });

  const nextTier = currentTier === KYCTier.TIER_0 ? KYCTier.TIER_1 : 
                   currentTier === KYCTier.TIER_1 ? KYCTier.TIER_2 : KYCTier.TIER_3;

  const getTierInfo = (tier: KYCTier) => {
    switch(tier) {
      case KYCTier.TIER_1: return { title: 'Basic Verification', limit: '$1,000', req: 'Legal Name, DOB, Address' };
      case KYCTier.TIER_2: return { title: 'Verified Identity', limit: '$50,000', req: 'Government ID, Facial Scan' };
      case KYCTier.TIER_3: return { title: 'Enhanced Due Diligence', limit: 'Unlimited', req: 'Source of Funds, Financial Statements' };
      default: return { title: 'Unverified', limit: '$0', req: '' };
    }
  };

  const targetInfo = getTierInfo(nextTier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API delay and AI check
    try {
      const result = await performComplianceCheck({
        name: `${formData.firstName} ${formData.lastName}`,
        dob: formData.dob,
        address: formData.address,
        ssnLast4: formData.ssn.slice(-4),
        docType: nextTier === KYCTier.TIER_2 ? 'Simulated ID Upload' : undefined
      });

      if (result.passed) {
         setTimeout(() => {
            const newLimit = nextTier === KYCTier.TIER_1 ? 1000 : nextTier === KYCTier.TIER_2 ? 50000 : 1000000;
            onUpgradeComplete(nextTier, newLimit);
            setIsProcessing(false);
         }, 2000);
      } else {
        alert(`Verification Failed: ${result.reasoning}`);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-slate-900/50 p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs text-slate-400 mt-1">Compliance per Nebraska & Federal Regulations</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/20 rounded-2xl p-5">
            <h3 className="text-[#667eea] font-bold uppercase text-[10px] tracking-widest mb-2">Upgrading to</h3>
            <div className="flex justify-between items-end">
               <span className="text-2xl font-bold text-white">{targetInfo.title}</span>
               <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-sm">{targetInfo.limit} Limit</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#667eea]"></span>
              Requires: {targetInfo.req}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">First Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#667eea] outline-none transition-colors"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Last Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#667eea] outline-none transition-colors"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Date of Birth</label>
                   <input 
                      required
                      type="date" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#667eea] outline-none transition-colors"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Residential Address</label>
                   <input 
                      required
                      type="text" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#667eea] outline-none transition-colors"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">SSN / TIN (Last 4)</label>
                   <input 
                      required
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-[#667eea] outline-none tracking-[0.5em] text-center"
                      value={formData.ssn}
                      onChange={e => setFormData({...formData, ssn: e.target.value})}
                    />
                </div>
                
                <p className="text-[10px] text-slate-500 mt-4 text-center">
                  Your data is encrypted and used solely for CIP (Customer Identification Program) compliance checks.
                </p>
              </>
            )}

            <Button 
               type="submit" 
               className="w-full mt-6" 
               isLoading={isProcessing}
            >
              {isProcessing ? 'Verifying Identity...' : 'Confirm & Upgrade'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
