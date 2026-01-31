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
         // Fake delay for "scanning" effect
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Identity Verification</h2>
            <p className="text-xs text-gray-400">Compliance per Nebraska & Federal Regulations</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
            <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-wider mb-1">Upgrading to</h3>
            <div className="flex justify-between items-end">
               <span className="text-2xl font-bold text-white">{targetInfo.title}</span>
               <span className="text-emerald-400 font-mono font-bold">{targetInfo.limit} Limit</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">Requires: {targetInfo.req}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                   <input 
                      required
                      type="date" 
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Residential Address</label>
                   <input 
                      required
                      type="text" 
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">SSN / TIN (Last 4 Digits)</label>
                   <input 
                      required
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-24 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none tracking-widest"
                      value={formData.ssn}
                      onChange={e => setFormData({...formData, ssn: e.target.value})}
                    />
                </div>
                
                <p className="text-[10px] text-gray-500 mt-2">
                  Your data is encrypted and used solely for CIP (Customer Identification Program) compliance checks.
                </p>
              </>
            )}

            <Button 
               type="submit" 
               className="w-full mt-4" 
               isLoading={isProcessing}
            >
              {isProcessing ? 'Running OFAC & Identity Checks...' : 'Verify & Upgrade'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
