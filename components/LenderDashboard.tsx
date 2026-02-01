import React, { useState } from 'react';
import { LoanOffer, LoanRequest, MatchResult, UserProfile } from '../types';
import { Button } from './Button';
import { matchBorrowers } from '../services/geminiService';

interface Props {
  user: UserProfile;
  myOffers: LoanOffer[];
  communityRequests: LoanRequest[];
  onCreateOffer: (offer: LoanOffer) => void;
}

export const LenderDashboard: React.FC<Props> = ({ user, myOffers, communityRequests, onCreateOffer }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Form State
  const [maxAmount, setMaxAmount] = useState(1000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [minScore, setMinScore] = useState(50);
  const [terms, setTerms] = useState('12 Months');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: LoanOffer = {
      id: Date.now().toString(),
      lenderId: user.id,
      lenderName: user.name,
      maxAmount: maxAmount,
      interestRate: interestRate,
      minReputationScore: minScore,
      terms: terms,
      status: 'ACTIVE'
    };
    onCreateOffer(newOffer);
    setIsCreating(false);
  };

  const handleFindBorrowers = async (offer: LoanOffer) => {
    setSelectedOfferId(offer.id);
    setIsMatching(true);
    setMatches([]); // Clear previous
    const results = await matchBorrowers(offer, communityRequests);
    setMatches(results);
    setIsMatching(false);
  };

  const activeOffers = myOffers.filter(o => o.status === 'ACTIVE');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
      
      {/* LEFT COL: Create & Manage Offers */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Create Offer Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Lending Desk</h3>
            {!isCreating && (
              <Button size="sm" onClick={() => setIsCreating(true)} variant="secondary">
                + New Offer
              </Button>
            )}
          </div>

          {isCreating ? (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Max Amount ($)</label>
                <input 
                  type="number" 
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">APR (%)</label>
                   <input 
                    type="number" 
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none"
                  />
                </div>
                <div>
                   <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Min Score</label>
                   <input 
                    type="number" 
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Terms</label>
                <select 
                   value={terms}
                   onChange={(e) => setTerms(e.target.value)}
                   className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none"
                >
                  <option value="Immediate">Immediate Repayment</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Post Offer</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {activeOffers.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No active offers. Create one to start lending.</p>
              ) : (
                activeOffers.map(offer => (
                  <div 
                    key={offer.id}
                    onClick={() => handleFindBorrowers(offer)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedOfferId === offer.id ? 'bg-zinc-800 border-[#00e599] ring-1 ring-[#00e599]/50' : 'bg-black border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[#00e599] font-bold text-sm">Active Offer</span>
                       <span className="text-xs text-zinc-500">{offer.terms}</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                         <div className="text-2xl font-mono text-white font-bold">{offer.interestRate}% <span className="text-sm text-zinc-500 font-sans font-normal">APR</span></div>
                         <div className="text-xs text-zinc-400 mt-1">Up to ${offer.maxAmount} • Min Score {offer.minReputationScore}</div>
                       </div>
                       <Button size="sm" variant="outline" className="h-8 text-xs">Matches</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COL: AI Matches */}
      <div className="lg:col-span-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-[600px] flex flex-col">
           <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-3">
               <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
               AI Qualified Borrowers
             </h3>
             {isMatching && <span className="text-xs text-[#00e599] animate-pulse">Scanning network...</span>}
           </div>

           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             {!selectedOfferId ? (
               <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                 <div className="w-16 h-16 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center">
                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </div>
                 <p className="font-medium">Select an offer on the left to find qualified borrowers.</p>
               </div>
             ) : matches.length === 0 && !isMatching ? (
               <div className="text-center py-20 text-zinc-500">
                  No matching borrowers found for this offer criteria.
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {matches.map((match, idx) => {
                   const req = communityRequests.find(r => r.id === match.requestId);
                   if (!req) return null;
                   
                   return (
                     <div key={idx} className="bg-black border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <h4 className="text-white font-bold text-lg">{req.borrowerName}</h4>
                             <div className="text-xs text-zinc-500">Score: <span className="text-[#00e599] font-mono">{req.reputationScoreSnapshot}</span></div>
                           </div>
                           <div className="bg-[#00e599] text-black text-[10px] font-bold px-2 py-1 rounded">
                             {match.matchScore}% Match
                           </div>
                        </div>

                        <div className="bg-zinc-900/50 rounded-lg p-3 mb-4 border border-zinc-800">
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-zinc-400">Request</span>
                             <span className="text-white font-mono">${req.amount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-zinc-400">Purpose</span>
                             <span className="text-white text-right truncate max-w-[120px]">{req.purpose}</span>
                          </div>
                        </div>

                        <div className="mb-4 text-xs text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                           "{match.reasoning}"
                        </div>

                        <Button className="w-full">Fund Loan</Button>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};