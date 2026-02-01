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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,229,153,0.05)] overflow-hidden animate-fade-in relative">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs text-zinc-500 mt-1">Compliance per Nebraska & Federal Regulations</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-8 relative z-10">
          <div className="mb-8 bg-gradient-to-br from-[#00e599]/10 to-emerald-900/10 border border-[#00e599]/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#00e599]/10 blur-2xl rounded-full"></div>
            
            <h3 className="text-[#00e599] font-bold uppercase text-[10px] tracking-widest mb-2">Upgrading to</h3>
            <div className="flex justify-between items-end">
               <span className="text-2xl font-bold text-white">{targetInfo.title}</span>
               <span className="text-[#00e599] font-mono font-bold bg-[#00e599]/10 border border-[#00e599]/20 px-2 py-0.5 rounded text-sm">{targetInfo.limit} Limit</span>
            </div>
            <p className="text-xs text-zinc-400 mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] shadow-[0_0_5px_#00e599]"></span>
              Requires: {targetInfo.req}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">First Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-[#00e599] outline-none transition-colors"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Last Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-[#00e599] outline-none transition-colors"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Date of Birth</label>
                   <input 
                      required
                      type="date" 
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-[#00e599] outline-none transition-colors"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Residential Address</label>
                   <input 
                      required
                      type="text" 
                      className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-[#00e599] outline-none transition-colors"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">SSN / TIN (Last 4)</label>
                   <input 
                      required
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-32 bg-black border border-zinc-800 rounded-xl p-3 text-white text-sm focus:border-[#00e599] outline-none tracking-[0.5em] text-center"
                      value={formData.ssn}
                      onChange={e => setFormData({...formData, ssn: e.target.value})}
                    />
                </div>
                
                <p className="text-[10px] text-zinc-600 mt-4 text-center max-w-xs mx-auto">
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