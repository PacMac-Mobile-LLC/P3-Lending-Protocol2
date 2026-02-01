import React from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
import { ScoreGauge } from './ScoreGauge';
import { Footer } from './Footer';
import { LegalDocType } from './LegalModal';

interface Props {
  onLaunch: () => void;
  onDevAdminLogin: () => void;
  onOpenDocs: () => void;
  onOpenLegal: (type: LegalDocType) => void;
}

export const LandingPage: React.FC<Props> = ({ onLaunch, onDevAdminLogin, onOpenDocs, onOpenLegal }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative font-sans selection:bg-[#00e599] selection:text-black flex flex-col">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#00e599]/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <Logo />
        <div className="flex items-center gap-6">
          <button onClick={() => scrollToSection('borrowers')} className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">For Borrowers</button>
          <button onClick={() => scrollToSection('lenders')} className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">For Lenders</button>
          <button onClick={onOpenDocs} className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">Docs & Support</button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onDevAdminLogin}
              className="text-xs font-mono text-zinc-500 hover:text-[#00e599] transition-colors border border-zinc-800 rounded px-2 py-1"
            >
              Dev: Admin Login
            </button>
            <Button onClick={onLaunch} className="shadow-[0_0_20px_rgba(0,229,153,0.4)]">
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#00e599] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
              The Reputation Revolution
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] to-emerald-600">Reputation</span> <br/>
              Is Your Currency.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-lg">
              The first decentralized lending protocol powered by AI. We replace archaic FICO scores with 
              <strong className="text-white"> Social Underwriting</strong>—unlocking capital based on your character, not just your history.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" onClick={onLaunch} className="text-lg px-10">
                Start Borrowing
              </Button>
              <Button size="lg" variant="secondary" onClick={onLaunch} className="text-lg px-10">
                Become a Lender
              </Button>
            </div>
            <p className="text-xs text-zinc-600 pt-2">
              *Loans are not FDIC insured. Crypto assets are volatile.
            </p>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00e599]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white">AI Analysis</h3>
                   <p className="text-zinc-500 text-sm">Real-time Risk Engine</p>
                 </div>
                 <div className="text-right">
                   <div className="text-[#00e599] font-mono text-xl font-bold">APPROVED</div>
                   <div className="text-xs text-zinc-500">Tier 2 Verified</div>
                 </div>
              </div>
              
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48">
                   <ScoreGauge score={85} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-zinc-800">
                   <span className="text-zinc-400 text-sm">Repayment Streak</span>
                   <span className="text-white font-mono font-bold">12 Months 🔥</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-zinc-800">
                   <span className="text-zinc-400 text-sm">Community Trust</span>
                   <span className="text-[#00e599] font-mono font-bold">High (Top 5%)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#00e599]/10 border border-[#00e599]/20">
                   <p className="text-xs text-[#00e599] italic">
                     "User demonstrates strong social capital and consistent micro-repayments. Recommended for credit limit increase."
                   </p>
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -bottom-10 -left-10 bg-black border border-zinc-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                 🛡️
               </div>
               <div>
                 <div className="text-xs text-zinc-500 font-bold uppercase">Fresh Start</div>
                 <div className="text-sm font-bold text-white">Charity Backed</div>
               </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -top-5 -right-5 bg-black border border-zinc-800 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
               <div className="w-10 h-10 rounded-full bg-[#00e599]/20 flex items-center justify-center text-[#00e599]">
                 💸
               </div>
               <div>
                 <div className="text-xs text-zinc-500 font-bold uppercase">Instant Funding</div>
                 <div className="text-sm font-bold text-white">Smart Contract Executed</div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-900 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-900">
          <div className="p-8 text-center">
             <div className="text-3xl font-bold text-white font-mono">$2.4M</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Total Liquidity</div>
          </div>
          <div className="p-8 text-center">
             <div className="text-3xl font-bold text-[#00e599] font-mono">98.2%</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Repayment Rate</div>
          </div>
          <div className="p-8 text-center">
             <div className="text-3xl font-bold text-white font-mono">15k+</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Verified Users</div>
          </div>
          <div className="p-8 text-center">
             <div className="text-3xl font-bold text-white font-mono">4.8s</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Avg. Approval Time</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Banking for the Rest of Us.</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Traditional banks rely on outdated metrics. P³ Securities uses blockchain transparency and AI to build a fairer financial system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div id="borrowers" className="p-8 rounded-3xl bg-black border border-zinc-800 hover:border-[#00e599] transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-[#00e599] transition-colors relative z-10">
                {/* Fair Lending Icon */}
                <svg className="w-7 h-7 text-white group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Fair Lending (ECOA)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                Our "Blind AI" algorithms are audited to remove bias. We don't care about your zip code or background—only your actions.
              </p>
            </div>
            <div id="lenders" className="p-8 rounded-3xl bg-black border border-zinc-800 hover:border-[#00e599] transition-colors group relative overflow-hidden">
               <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-[#00e599] transition-colors relative z-10">
                {/* Impact Yield Icon */}
                <svg className="w-7 h-7 text-white group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Impact Yield</h3>
              <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                Lenders earn competitive APY while sponsoring "Fresh Start" microloans. It's profit with a purpose.
              </p>
            </div>
            <div id="compliance" className="p-8 rounded-3xl bg-black border border-zinc-800 hover:border-[#00e599] transition-colors group relative overflow-hidden">
               <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-[#00e599] transition-colors relative z-10">
                {/* Secure Icon */}
                <svg className="w-7 h-7 text-white group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Secure & Compliant</h3>
              <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                Built on audited smart contracts. We are pursuing full NMLS licensing and adhere to BSA/AML regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenLegal={onOpenLegal} />
    </div>
  );
};