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
  
  // Filter for microloans from newcomers
  const opportunities = communityRequests.filter(
    req => req.type === 'Microloan (Credit Builder)' && req.status === 'PENDING'
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Mentor Hero Section */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Microloan Mentorship</h2>
            <p className="text-zinc-400 max-w-xl text-sm md:text-base leading-relaxed">
              Use your high reputation to sponsor newcomers. Provide liquidity for credit-builder loans, 
              earn yields, and unlock "Community Builder" badges.
            </p>
          </div>
          <div className="flex items-center gap-6 bg-black p-4 rounded-xl border border-zinc-800">
            <div className="text-center">
               <div className="text-3xl font-bold text-white">{activeMentorships}</div>
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Sponsored</div>
            </div>
            <div className="w-px h-10 bg-zinc-800"></div>
            <div className="text-center">
               <div className="text-3xl font-bold text-[#00e599]">{(activeMentorships * 5)}%</div>
               <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Yield APY</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Opportunities List */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
            Sponsorship Opportunities
          </h3>
          
          <div className="space-y-4">
            {opportunities.length === 0 ? (
               <div className="bg-zinc-900 rounded-2xl p-10 text-center border border-dashed border-zinc-800">
                 <p className="text-zinc-500">No new microloan requests available at the moment.</p>
               </div>
            ) : (
              opportunities.map(req => (
                <div key={req.id} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-zinc-600 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-400">
                        {req.borrowerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{req.borrowerName}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                           <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">Tier {req.borrowerId.includes('new') ? '0' : '1'}</span>
                           <span>• Score: {req.reputationScoreSnapshot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-bold text-white tracking-tight">${req.amount}</div>
                       <div className="text-[10px] uppercase text-zinc-500 tracking-wider font-semibold">Microloan</div>
                    </div>
                  </div>
                  
                  <div className="bg-black rounded-lg p-3 mb-4 text-sm text-zinc-400 border border-zinc-800">
                    "{req.purpose}"
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                     <div className="text-xs text-zinc-500">
                        Smart contract secures funds. Earn <span className="text-[#00e599] font-bold">5% interest</span>.
                     </div>
                     <Button 
                       size="sm" 
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
           <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="font-bold text-white mb-4">Mentor Benefits</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-zinc-400">
                   <span className="text-[#00e599] text-lg">✓</span>
                   <div>
                     <strong className="block text-zinc-200">Trust Builder</strong>
                     Helping others boosts your own Reputation Score.
                   </div>
                </li>
                <li className="flex gap-3 text-sm text-zinc-400">
                   <span className="text-[#00e599] text-lg">✓</span>
                   <div>
                     <strong className="block text-zinc-200">Yield Farming</strong>
                     Earn competitive APY on small, diversified loans.
                   </div>
                </li>
              </ul>
           </div>

           <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h4 className="text-zinc-500 font-bold mb-2 text-xs uppercase tracking-wider">Community Goal</h4>
              <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-white">$12,450</span>
                 <span className="text-xs text-zinc-500">of $20k goal</span>
              </div>
              <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-[#00e599] w-[62%]"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};