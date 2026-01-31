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
      case 'MATCHED': return 'bg-green-900 text-green-300';
      case 'ESCROW_LOCKED': return 'bg-orange-900 text-orange-300';
      case 'ACTIVE': return 'bg-indigo-900 text-indigo-300';
      case 'REPAID': return 'bg-emerald-900 text-emerald-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getCharityName = (id?: string) => {
    return charities.find(c => c.id === id)?.name || 'General Fund';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Active Requests Column */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            My Loan Portfolio
          </h3>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {activeRequests.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No active requests.</div>
          ) : (
            activeRequests.map(req => (
              <div key={req.id} className={`border rounded-lg p-4 transition-all ${selectedRequest === req.id ? 'border-indigo-500 bg-indigo-900/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold text-white">${req.amount.toLocaleString()}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status === 'ESCROW_LOCKED' ? 'ESCROW SECURED' : req.status}
                    </span>
                    {req.charityId && (
                      <span className="text-[10px] text-pink-400 flex items-center gap-1 bg-pink-900/20 px-1.5 py-0.5 rounded border border-pink-900/50">
                        ♥ {getCharityName(req.charityId)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-3 space-y-1">
                  <p>Purpose: <span className="text-gray-300">{req.purpose}</span></p>
                  <p>Type: <span className="text-gray-300">{req.type}</span></p>
                  {req.status === 'ESCROW_LOCKED' && (
                     <div className="bg-orange-900/20 text-orange-200 text-xs p-2 rounded border border-orange-900/50 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Funds held in P3 Escrow Vault.
                     </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {req.status === 'PENDING' && (
                     <>
                      <Button 
                        size="sm" 
                        className="flex-1 text-sm py-1" 
                        variant="outline"
                        onClick={() => handleFindMatches(req)}
                        isLoading={isMatching && selectedRequest === req.id}
                      >
                        Find Matches
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-sm py-1" 
                        variant="secondary"
                        onClick={() => onFundRequest(req)}
                      >
                        Simulate Funding
                      </Button>
                     </>
                  )}
                  {req.status === 'ESCROW_LOCKED' && (
                    <Button 
                      size="sm" 
                      className="w-full text-sm py-1 bg-orange-600 hover:bg-orange-500 shadow-orange-500/20" 
                      onClick={() => onReleaseEscrow(req)}
                    >
                      Release Funds to Borrower (Simulate Contract)
                    </Button>
                  )}
                  {req.status === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      className="w-full text-sm py-1 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20" 
                      onClick={() => onRepayLoan(req)}
                    >
                      Repay Loan + Charity Donation
                    </Button>
                  )}
                   {req.status === 'REPAID' && (
                    <div className="w-full flex justify-between items-center text-xs bg-emerald-900/20 py-2 px-3 rounded border border-emerald-900">
                      <span className="text-emerald-400 font-bold">Repaid</span>
                      <span className="text-pink-400 font-medium">Donation Sent ♥</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Matches/Offers Column */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Lender Offers
          </h3>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          {!selectedRequest ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <p>Select a PENDING request to find matches.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches[selectedRequest]?.length > 0 ? (
                matches[selectedRequest].map((match, idx) => {
                  const offer = availableOffers.find(o => o.id === match.offerId);
                  if (!offer) return null;
                  return (
                    <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-50">
                         <div className="text-xs font-bold text-emerald-400 border border-emerald-900 bg-emerald-900/30 px-2 py-0.5 rounded">
                           {match.matchScore}% Match
                         </div>
                      </div>
                      <h4 className="text-white font-bold mb-1">{offer.lenderName}</h4>
                      <div className="flex gap-4 text-sm mb-3">
                        <div className="text-emerald-400 font-mono font-bold">{offer.interestRate}% APR</div>
                        <div className="text-gray-400">Up to ${offer.maxAmount}</div>
                      </div>
                      <p className="text-xs text-gray-400 italic mb-3 border-l-2 border-indigo-500 pl-2">
                        "{match.reasoning}"
                      </p>
                      <Button className="w-full text-sm">Accept & Escrow Funds</Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 mt-10">
                   {isMatching && selectedRequest ? 'AI is analyzing marketplace...' : 'No matching offers found. Try improving your Reputation Score.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
