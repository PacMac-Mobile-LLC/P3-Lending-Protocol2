import React from 'react';
import { LoanRequest, UserProfile } from '../types';
import { Button } from './Button';

interface Props {
  user: UserProfile;
  communityRequests: LoanRequest[];
  onSponsor: (request: LoanRequest) => void;
}

export const MentorshipDashboard: React.FC<Props> = ({ user, communityRequests, onSponsor }) => {
  const activeMentorships = user.mentorshipsCount || 0;
  
  // Filter for microloans from newcomers (simulated by low rep or specific type)
  const opportunities = communityRequests.filter(
    req => req.type === 'Microloan (Credit Builder)' && req.status === 'PENDING'
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Mentor Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#667eea] to-[#764ba2] p-8 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Microloan Mentorship</h2>
            <p className="text-blue-100 max-w-xl text-sm md:text-base leading-relaxed">
              Use your high reputation to sponsor newcomers. You provide the liquidity for credit-builder loans, 
              earn yields, and unlock exclusive "Community Builder" badges.
            </p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center">
               <div className="text-3xl font-bold text-white">{activeMentorships}</div>
               <div className="text-[10px] uppercase tracking-wider text-blue-200">Sponsored</div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
               <div className="text-3xl font-bold text-emerald-300">{(activeMentorships * 5)}%</div>
               <div className="text-[10px] uppercase tracking-wider text-blue-200">Yield APY</div>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-purple-900 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Opportunities List */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sponsorship Opportunities
          </h3>
          
          <div className="space-y-4">
            {opportunities.length === 0 ? (
               <div className="bg-slate-800/40 rounded-2xl p-10 text-center border border-slate-700/50 border-dashed">
                 <p className="text-slate-500">No new microloan requests available at the moment.</p>
               </div>
            ) : (
              opportunities.map(req => (
                <div key={req.id} className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-[#667eea]/40 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-300">
                        {req.borrowerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{req.borrowerName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                           <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">Tier {req.borrowerId.includes('new') ? '0' : '1'}</span>
                           <span>• Score: {req.reputationScoreSnapshot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-bold text-white">${req.amount}</div>
                       <div className="text-[10px] uppercase text-slate-500 tracking-wider">Microloan</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/40 rounded-xl p-3 mb-4 text-sm text-slate-300 italic border border-slate-800">
                    "{req.purpose}"
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                     <div className="text-xs text-slate-400">
                        Smart contract secures funds. You earn <span className="text-emerald-400 font-bold">5% interest</span> upon repayment.
                     </div>
                     <Button 
                       size="sm" 
                       className="bg-[#667eea] hover:bg-[#5a6fd6] shadow-lg shadow-[#667eea]/20"
                       onClick={() => onSponsor(req)}
                     >
                       Sponsor Loan
                     </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mentor Stats & Info */}
        <div className="space-y-6">
           <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50">
              <h3 className="font-bold text-white mb-4">Mentor Benefits</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-300">
                   <span className="text-emerald-400 text-lg">✓</span>
                   <div>
                     <strong className="block text-white">Trust Builder</strong>
                     Helping others boosts your own Reputation Score.
                   </div>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                   <span className="text-emerald-400 text-lg">✓</span>
                   <div>
                     <strong className="block text-white">Yield Farming</strong>
                     Earn competitive APY on small, diversified loans.
                   </div>
                </li>
                <li className="flex gap-3 text-sm text-slate-300">
                   <span className="text-emerald-400 text-lg">✓</span>
                   <div>
                     <strong className="block text-white">Unlock Governance</strong>
                     Top mentors get voting rights in the P³ DAO.
                   </div>
                </li>
              </ul>
           </div>

           <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-3xl p-6 border border-pink-500/20">
              <h4 className="text-pink-300 font-bold mb-2 text-sm uppercase tracking-wider">Community Goal</h4>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-white">$12,450</span>
                 <span className="text-xs text-pink-200/70">of $20k goal</span>
              </div>
              <div className="w-full bg-slate-900/50 h-2 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 w-[62%]"></div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Total microloans sponsored by the community this month.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
