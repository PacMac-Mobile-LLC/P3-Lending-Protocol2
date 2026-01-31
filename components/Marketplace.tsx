import React, { useState } from 'react';
import { LoanRequest, LoanOffer, MatchResult, Charity } from '../types';
import { Button } from './Button';
import { matchLoanOffers } from '../services/geminiService';

interface Props {
  activeRequests: LoanRequest[];
  availableOffers: LoanOffer[];
  charities: Charity[];
  onRequestMatch: (request: LoanRequest) => Promise<void>;
  onFundRequest: (request: LoanRequest) => void;
  onReleaseEscrow: (request: LoanRequest) => void;
  onRepayLoan: (request: LoanRequest) => void;
  isMatching: boolean;
}

export const Marketplace: React.FC<Props> = ({ 
  activeRequests, 
  availableOffers, 
  charities,
  onRequestMatch, 
  onFundRequest,
  onReleaseEscrow,
  onRepayLoan,
  isMatching 
}) => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, MatchResult[]>>({});

  const handleFindMatches = async (req: LoanRequest) => {
    setSelectedRequest(req.id);
    await onRequestMatch(req);
    const results = await matchLoanOffers(req, availableOffers);
    setMatches(prev => ({ ...prev, [req.id]: results }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'MATCHED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ESCROW_LOCKED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ACTIVE': return 'bg-[#667eea]/10 text-[#667eea] border-[#667eea]/20';
      case 'REPAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-700';
    }
  };

  const getCharityName = (id?: string) => {
    return charities.find(c => c.id === id)?.name || 'General Fund';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      {/* Active Requests Column */}
      <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/50 flex flex-col h-[650px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/20">
          <h3 className="font-semibold text-white flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"></span>
            My Loan Portfolio
          </h3>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 flex-1 custom-scrollbar">
          {activeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
              <span className="text-4xl opacity-20">📂</span>
              <p>No active requests found.</p>
            </div>
          ) : (
            activeRequests.map(req => (
              <div 
                key={req.id} 
                className={`
                  relative rounded-2xl p-5 border transition-all duration-300
                  ${selectedRequest === req.id 
                    ? 'bg-[#667eea]/5 border-[#667eea]/50 shadow-[0_0_20px_rgba(102,126,234,0.1)]' 
                    : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'}
                `}
              >
                {req.isCharityGuaranteed && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-pink-400/50 flex items-center gap-1 z-10">
                    <span>🛡️</span> Charity Guaranteed
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 mt-2">
                  <div>
                    <span className="text-3xl font-bold text-white tracking-tight">
                      ${req.amount.toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{req.purpose}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusColor(req.status)}`}>
                      {req.status === 'ESCROW_LOCKED' ? 'ESCROW' : req.status}
                    </span>
                    {req.charityId && (
                      <span className="text-[10px] text-pink-300 flex items-center gap-1.5 px-2 py-0.5">
                        <span className="text-pink-500">♥</span> {getCharityName(req.charityId)}
                      </span>
                    )}
                  </div>
                </div>
                
                {req.status === 'ESCROW_LOCKED' && (
                  <div className="mb-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-3">
                    <div className="mt-0.5 text-amber-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Funds are currently held in the P³ Escrow Vault awaiting contract fulfillment.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-2">
                  {req.status === 'PENDING' && (
                     <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleFindMatches(req)}
                        isLoading={isMatching && selectedRequest === req.id}
                      >
                        Find Matches
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="flex-1"
                        onClick={() => onFundRequest(req)}
                      >
                        Simulate Fund
                      </Button>
                     </>
                  )}
                  {req.status === 'ESCROW_LOCKED' && (
                    <Button 
                      size="sm" 
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 border-none" 
                      onClick={() => onReleaseEscrow(req)}
                    >
                      Release Escrow
                    </Button>
                  )}
                  {req.status === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none" 
                      onClick={() => onRepayLoan(req)}
                    >
                      Repay + Donate
                    </Button>
                  )}
                   {req.status === 'REPAID' && (
                    <div className="w-full flex justify-center items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                      <span>✓ Repayment Complete</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Matches/Offers Column */}
      <div className="bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/50 flex flex-col h-[650px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/20">
          <h3 className="font-semibold text-white flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4facfe]"></span>
            Marketplace Matches
          </h3>
        </div>
        <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
          {!selectedRequest ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                 <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <p className="font-light">Select a pending request to view AI matches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches[selectedRequest]?.length > 0 ? (
                matches[selectedRequest].map((match, idx) => {
                  const offer = availableOffers.find(o => o.id === match.offerId);
                  if (!offer) return null;
                  return (
                    <div key={idx} className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:border-[#667eea]/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-bold">{offer.lenderName}</h4>
                        <div className="text-xs font-bold text-[#4facfe] border border-[#4facfe]/30 bg-[#4facfe]/10 px-2 py-1 rounded-full">
                           {match.matchScore}% Match
                         </div>
                      </div>
                      
                      <div className="flex gap-6 text-sm mb-4">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">APR</p>
                          <p className="text-white font-mono">{offer.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Max</p>
                          <p className="text-white font-mono">${offer.maxAmount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Term</p>
                          <p className="text-slate-300">{offer.terms}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4 pl-3 border-l-2 border-[#667eea]/50">
                        <p className="text-xs text-slate-400 italic">
                          "{match.reasoning}"
                        </p>
                      </div>
                      
                      <Button size="sm" className="w-full">Accept Offer</Button>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
                   {isMatching && selectedRequest ? (
                     <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin"></div>
                       <span>AI Analysis in progress...</span>
                     </div>
                   ) : 'No matching offers found.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
