import React, { useState, useEffect } from 'react';
import { Client } from 'persona';
import { Button } from './Button';
import { KYCTier } from '../types';

interface Props {
  currentTier: KYCTier;
  onClose: () => void;
  onUpgradeComplete: (newTier: KYCTier, limit: number, docData?: any) => void;
}

export const KYCVerificationModal: React.FC<Props> = ({ currentTier, onClose, onUpgradeComplete }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const personaClient = new Client({
      templateId: 'itmpl_T6Hgih6fYgiuuuovvB33inLq33Dg',
      environment: 'sandbox',
      onLoad: () => {
        setIsReady(true);
      },
      onComplete: ({ inquiryId, status, fields }) => {
        console.log(`Completed inquiry ${inquiryId} with status ${status}`);
        
        // In a real app, we would verify this inquiryId on the backend via webhook
        // For this demo/sandbox, we immediately upgrade the user on the client side
        
        // Determine tier based on current (logic preserved from original)
        const nextTier = currentTier === KYCTier.TIER_0 ? KYCTier.TIER_1 : 
                         currentTier === KYCTier.TIER_1 ? KYCTier.TIER_2 : KYCTier.TIER_3;
        
        const newLimit = nextTier === KYCTier.TIER_1 ? 1000 : nextTier === KYCTier.TIER_2 ? 50000 : 1000000;

        onUpgradeComplete(nextTier, newLimit, { inquiryId, status, submittedAt: Date.now() });
        onClose();
      },
      onCancel: ({ inquiryId, sessionToken }) => {
        console.log('Verification cancelled');
      },
      onError: (error) => {
        console.error('Persona Error:', error);
      }
    });

    setClient(personaClient);
  }, [currentTier, onClose, onUpgradeComplete]);

  const handleStartVerification = () => {
    if (client) {
      client.open();
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,229,153,0.05)] overflow-hidden animate-fade-in relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <div className="bg-zinc-900/50 p-6 border-b border-zinc-800 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs text-zinc-500 mt-1">Powered by Persona</p>
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

          <div className="text-center py-6">
            <p className="text-zinc-400 mb-6 text-sm">
                We use Persona to securely verify your identity. Click below to start the verification process proposed by our compliance partner.
            </p>

            <Button 
               onClick={handleStartVerification}
               className="w-full" 
               isLoading={!isReady && !client}
            >
              Start Verification
            </Button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
               <span>Bank-grade security & encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};