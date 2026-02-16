
import React, { useState, useEffect } from 'react';
import { LoanOffer, LoanRequest, MatchResult, UserProfile } from '../types';
import { Button } from './Button';
import { matchBorrowers, suggestLoanTerms } from '../client-services/geminiService';

interface Props {
  user: UserProfile;
  myOffers: LoanOffer[];
  communityRequests: LoanRequest[];
  onCreateOffer: (offer: LoanOffer) => void;
  onFundRequest: (request: LoanRequest) => void;
}

interface Notification {
  id: string;
  offerId: string;
  requestId: string;
  borrowerName: string;
  score: number;
}

export const LenderDashboard: React.FC<Props> = ({ user, myOffers, communityRequests, onCreateOffer, onFundRequest }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Notification System State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  // Form State
  const [maxAmount, setMaxAmount] = useState(1000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [minScore, setMinScore] = useState(50);
  const [terms, setTerms] = useState('12 Months');
  const [isConsultingAI, setIsConsultingAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const activeOffers = myOffers.filter(o => o.status === 'ACTIVE');

  // Auto-scan logic (same as before)
  useEffect(() => {
    const scanForOpportunities = async () => {
      if (hasScanned || activeOffers.length === 0 || communityRequests.length === 0) return;
      const newNotifications: Notification[] = [];
      const primaryOffer = activeOffers[0];
      try {
        const results = await matchBorrowers(primaryOffer, communityRequests);
        const highMatches = results.filter(r => r.matchScore >= 80);
        highMatches.forEach(match => {
          const req = communityRequests.find(r => r.id === match.requestId);
          if (req) {
            newNotifications.push({
              id: `notif_${Date.now()}_${match.requestId}`,
              offerId: primaryOffer.id,
              requestId: match.requestId,
              borrowerName: req.borrowerName,
              score: match.matchScore
            });
          }
        });
        if (newNotifications.length > 0) setNotifications(newNotifications);
      } catch (e) {
        console.error("Auto-scan failed", e);
      } finally {
        setHasScanned(true);
      }
    };
    scanForOpportunities();
  }, [activeOffers, communityRequests, hasScanned]);

  const handleAIAdvice = async () => {
    setIsConsultingAI(true);
    setAiAdvice(null);
    try {
      const suggestion = await suggestLoanTerms(minScore);
      setInterestRate(suggestion.interestRate);
      setMaxAmount(suggestion.maxAmount);
      setAiAdvice(suggestion.reasoning);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConsultingAI(false);
    }
  };

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
    setHasScanned(false);
    setAiAdvice(null);
  };

  const handleFindBorrowers = async (offer: LoanOffer) => {
    setSelectedOfferId(offer.id);
    setIsMatching(true);
    setMatches([]);
    const results = await matchBorrowers(offer, communityRequests);
    setMatches(results);
    setIsMatching(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* NOTIFICATIONS AREA */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-[#00e599]/10 border border-[#00e599]/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,229,153,0.1)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#00e599] flex items-center justify-center text-black shadow-lg">
                  <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#00e599] uppercase tracking-wider">High Match Opportunity</div>
                  <div className="text-white font-bold text-sm">{notif.borrowerName} • {notif.score}% Match</div>
                </div>
              </div>
              <div className="flex gap-2 relative z-10">
                <button onClick={() => { const offer = myOffers.find(o => o.id === notif.offerId); if (offer) handleFindBorrowers(offer); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }} className="text-xs bg-black/50 hover:bg-black text-white px-3 py-1.5 rounded-lg border border-[#00e599]/30 transition-colors">View</button>
                <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-zinc-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COL: Create & Manage Offers */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e599]/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-white">Lending Desk</h3>
              {!isCreating && <Button size="sm" onClick={() => setIsCreating(true)} variant="secondary">+ New Offer</Button>}
            </div>

            {isCreating ? (
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in relative z-10">
                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Target Min Score</label>
                    <span className={`text-xs font-bold ${minScore >= 80 ? 'text-[#00e599]' : minScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{minScore}</span>
                  </div>
                  <input type="range" min="30" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full accent-[#00e599] h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />

                  <Button type="button" size="sm" variant="outline" onClick={handleAIAdvice} isLoading={isConsultingAI} className="w-full text-xs py-2 border-dashed border-zinc-600 hover:border-[#00e599]">
                    <span className="mr-1">✨</span> Ask AI for Fair Rates
                  </Button>

                  {aiAdvice && <div className="text-[10px] text-[#00e599] italic p-2 bg-[#00e599]/10 rounded border border-[#00e599]/20">{aiAdvice}</div>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Max Amount ($)</label>
                    <input type="number" value={maxAmount} onChange={(e) => setMaxAmount(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#00e599] outline-none font-mono" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">APR (%)</label>
                    <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#00e599] outline-none font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Terms</label>
                  <select value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white focus:border-[#00e599] outline-none text-sm">
                    <option value="Immediate">Immediate Repayment</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="12 Months">12 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => { setIsCreating(false); setAiAdvice(null); }}>Cancel</Button>
                  <Button type="submit" className="flex-1">Post Offer</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar">
                {activeOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto flex items-center justify-center mb-3 text-2xl">📝</div>
                    <p className="text-sm text-zinc-500">No active offers.</p>
                  </div>
                ) : (
                  activeOffers.map(offer => (
                    <div key={offer.id} onClick={() => handleFindBorrowers(offer)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedOfferId === offer.id ? 'bg-zinc-800 border-[#00e599] ring-1 ring-[#00e599]/50' : 'bg-black border-zinc-800 hover:border-zinc-600'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#00e599] font-bold text-[10px] uppercase tracking-wider bg-[#00e599]/10 px-2 py-0.5 rounded">Active</span>
                        <span className="text-xs text-zinc-500">{offer.terms}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xl font-mono text-white font-bold">{offer.interestRate}% <span className="text-xs text-zinc-500 font-sans font-normal">APR</span></div>
                          <div className="text-[10px] text-zinc-400 mt-1">Max ${offer.maxAmount} • Score {offer.minReputationScore}+</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">→</div>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

            <div className="p-6 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex justify-between items-center z-10">
              <h3 className="font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                AI Qualified Borrowers
              </h3>
              {isMatching && <span className="text-xs text-[#00e599] animate-pulse flex items-center gap-2"><div className="w-3 h-3 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin"></div> Scanning network...</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar z-10">
              {!selectedOfferId ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-black border border-zinc-800 flex items-center justify-center transform rotate-12 opacity-50">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <p className="font-medium text-sm">Select an offer to find qualified borrowers.</p>
                </div>
              ) : matches.length === 0 && !isMatching ? (
                <div className="text-center py-20 text-zinc-500">No matching borrowers found for this offer criteria.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((match, idx) => {
                    const req = communityRequests.find(r => r.id === match.requestId);
                    if (!req) return null;
                    return (
                      <div key={idx} className="bg-black border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all group flex flex-col h-full shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-bold text-lg">{req.borrowerName}</h4>
                            <div className="text-xs text-zinc-500">Reputation: <span className={`font-mono font-bold ${req.reputationScoreSnapshot >= 80 ? 'text-[#00e599]' : 'text-amber-500'}`}>{req.reputationScoreSnapshot}</span></div>
                          </div>
                          <div className="bg-[#00e599] text-black text-[10px] font-bold px-2 py-1 rounded shadow-[0_0_10px_rgba(0,229,153,0.3)]">
                            {match.matchScore}% Match
                          </div>
                        </div>
                        <div className="bg-zinc-900/50 rounded-lg p-3 mb-4 border border-zinc-800 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Requesting</span>
                            <span className="text-white font-mono font-bold">${req.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Purpose</span>
                            <span className="text-white text-right truncate max-w-[120px]">{req.purpose}</span>
                          </div>
                        </div>
                        <div className="mb-4 text-xs text-zinc-400 italic border-l-2 border-[#00e599]/30 pl-3 leading-relaxed flex-1">
                          "{match.reasoning}"
                        </div>
                        <Button className="w-full mt-auto" onClick={() => onFundRequest(req)}>Fund Loan</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
