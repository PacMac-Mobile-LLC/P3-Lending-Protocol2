import React, { useState, useEffect } from 'react';
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

// --- Dynamic Toast Component ---
const LiveToasts = () => {
  const events = [
    { icon: '⚡', title: 'Smart Contract Executed', sub: 'Instant Funding Released' },
    { icon: '🛡️', title: 'Fresh Start Approved', sub: 'Charity Backed Guarantee' },
    { icon: '📈', title: 'Reputation Increased', sub: 'User reached 85 Score' },
    { icon: '💸', title: 'Loan Repaid', sub: 'Lender earned 8% APY' }
  ];

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % events.length);
        setVisible(true);
      }, 500); // Wait for fade out before switching
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const current = events[index];

  return (
    <div 
      className={`absolute -top-12 -right-4 md:-right-10 transition-all duration-500 ease-in-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="bg-[#050505] border border-zinc-800 p-4 rounded-xl shadow-2xl flex items-center gap-4 w-72">
        <div className="w-10 h-10 rounded-full bg-[#00e599]/20 flex items-center justify-center text-lg">
          {current.icon}
        </div>
        <div>
          <div className="text-[#00e599] font-bold text-xs uppercase tracking-wider mb-0.5">Live Activity</div>
          <div className="text-white font-bold text-sm">{current.title}</div>
          <div className="text-zinc-500 text-xs">{current.sub}</div>
        </div>
      </div>
    </div>
  );
};

const AnimatedParagraph = () => {
  const text = "The first decentralized lending protocol powered by AI. We replace archaic FICO scores with Social Underwriting—unlocking capital based on your character, not just your history.";
  const words = text.split(' ');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const candidates = words.map((word, index) => {
      const isKeyTerm = word.includes('Social') || word.includes('Underwriting');
      return isKeyTerm ? null : index;
    }).filter((index): index is number => index !== null);

    const cycleHighlight = () => {
      const randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
      setActiveIndex(randomIndex);
      setTimeout(() => setActiveIndex(null), 1200); 
    };

    cycleHighlight();
    const interval = setInterval(cycleHighlight, 2500);
    return () => clearInterval(interval);
  }, []); 

  return (
    <p className="text-xl leading-relaxed max-w-lg text-zinc-300">
      {words.map((word, i) => {
        const isKeyTerm = word.includes('Social') || word.includes('Underwriting');
        if (isKeyTerm) return <strong key={i} className="text-white font-bold">{word} </strong>;
        const isActive = i === activeIndex;
        return (
          <span
            key={i}
            className={`inline-block px-1 rounded transition-all duration-700 ease-in-out ${
              isActive 
                ? "bg-[#00e599]/20 text-white shadow-[0_0_15px_rgba(0,229,153,0.4)] scale-105" 
                : "bg-transparent"
            }`}
          >
            {word}{' '}
          </span>
        );
      })}
    </p>
  );
};

export const LandingPage: React.FC<Props> = ({ onLaunch, onDevAdminLogin, onOpenDocs, onOpenLegal }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <Button onClick={onLaunch} className="shadow-[0_0_20px_rgba(0,229,153,0.4)]">
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Text */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[#00e599] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse"></span>
              The Reputation Revolution
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e599] to-emerald-600">Reputation</span> <br/>
              Is Your Currency.
            </h1>
            
            <AnimatedParagraph />

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" onClick={() => scrollToSection('borrowers')} className="text-lg px-10">
                Start Borrowing
              </Button>
              <Button size="lg" variant="secondary" onClick={() => scrollToSection('lenders')} className="text-lg px-10">
                Start Lending
              </Button>
            </div>
            <p className="text-xs text-zinc-600 pt-2">
              *Loans are not FDIC insured. Crypto assets are volatile.
            </p>
          </div>

          {/* AI Visual */}
          <div className="relative animate-fade-in mt-10 lg:mt-0" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00e599]/20 to-transparent rounded-full blur-3xl"></div>
            
            <LiveToasts />

            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-white">Trust Analysis</h3>
                   <p className="text-zinc-500 text-sm">Real-time Reputation Engine</p>
                 </div>
                 <div className="text-right">
                   <div className="text-[#00e599] font-mono text-xl font-bold">APPROVED</div>
                   <div className="text-xs text-zinc-500">Instant Verification</div>
                 </div>
              </div>
              
              <div className="flex justify-center mb-8 relative">
                <div className="w-48 h-48">
                   <ScoreGauge score={85} />
                </div>
                {/* Connecting Lines (Decorative) */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -z-10"></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-zinc-800 -z-10"></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-lg">🤝</div>
                    <div className="text-[10px] uppercase text-zinc-500 font-bold mt-1">Social</div>
                    <div className="text-white font-bold text-xs">Vouched</div>
                 </div>
                 <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-lg">⛓️</div>
                    <div className="text-[10px] uppercase text-zinc-500 font-bold mt-1">On-Chain</div>
                    <div className="text-white font-bold text-xs">3 yrs</div>
                 </div>
                 <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="text-lg">🔥</div>
                    <div className="text-[10px] uppercase text-zinc-500 font-bold mt-1">Streak</div>
                    <div className="text-[#00e599] font-bold text-xs">12 Mo</div>
                 </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#00e599]/5 border border-[#00e599]/20">
                 <p className="text-xs text-[#00e599] italic text-center">
                   "User demonstrates strong social capital and consistent micro-repayments. Recommended for credit limit increase."
                 </p>
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

      {/* Borrower Section */}
      <section id="borrowers" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col md:flex-row">
             <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                  For Borrowers
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">Need Capital? <br/>Build Credit.</h2>
                <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                  Stop getting rejected by banks for having a "thin file". We look at the whole picture. 
                  Start small with our <strong>Fresh Start</strong> program and unlock larger amounts as you prove your reliability.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span>No FICO Score Required</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span>Instant "Fresh Start" Approval (Charity Backed)</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span>Funds sent directly to your Wallet</span>
                  </li>
                </ul>
                <Button onClick={onLaunch} className="w-fit px-8 py-3">Start Borrowing Now</Button>
             </div>
             <div className="flex-1 bg-gradient-to-br from-zinc-900 to-black relative min-h-[400px]">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                {/* Abstract Visual for Borrowing */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="relative w-64 h-80 bg-black border border-zinc-800 rounded-2xl p-6 shadow-2xl rotate-3">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-2 w-12 bg-zinc-800 rounded"></div>
                        <div className="h-2 w-4 bg-zinc-800 rounded"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-20 w-full bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                           <span className="text-2xl font-bold text-white">$500</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded"></div>
                        <div className="h-2 w-3/4 bg-zinc-800 rounded"></div>
                        <div className="mt-8 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                           <span className="text-blue-400 font-bold text-sm">Funded Instantly</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Lender Section */}
      <section id="lenders" className="py-24 px-6 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black border border-zinc-800 rounded-3xl overflow-hidden flex flex-col md:flex-row-reverse">
             <div className="p-10 md:p-16 flex-1 flex flex-col justify-center">
                <div className="inline-block px-3 py-1 rounded bg-[#00e599]/10 text-[#00e599] text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                  For Lenders
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">Grow Wealth.<br/>Make an Impact.</h2>
                <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
                  Earn competitive yields while helping real people break the debt cycle. 
                  Our AI does the heavy lifting, vetting borrowers and assigning risk scores so you can lend with confidence.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#00e599]/20 text-[#00e599] flex items-center justify-center text-sm">✓</span>
                    <span>Earn 5-15% APY on Crypto Assets</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#00e599]/20 text-[#00e599] flex items-center justify-center text-sm">✓</span>
                    <span>Automated AI Matchmaking</span>
                  </li>
                  <li className="flex items-center gap-3 text-zinc-300">
                    <span className="w-6 h-6 rounded-full bg-[#00e599]/20 text-[#00e599] flex items-center justify-center text-sm">✓</span>
                    <span>Direct Peer-to-Peer Smart Contracts</span>
                  </li>
                </ul>
                <Button onClick={onLaunch} variant="secondary" className="w-fit px-8 py-3 border-[#00e599]/50 hover:border-[#00e599] text-white">Become a Lender</Button>
             </div>
             <div className="flex-1 bg-gradient-to-bl from-zinc-900 to-black relative min-h-[400px]">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                {/* Abstract Visual for Lending */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="relative w-64 h-80 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl -rotate-3">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-8 rounded-full bg-[#00e599] flex items-center justify-center text-black font-bold">P3</div>
                        <div className="text-[#00e599] font-mono text-xs">+12% APY</div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-black rounded-lg border border-zinc-800 flex justify-between items-center">
                           <div className="h-2 w-16 bg-zinc-800 rounded"></div>
                           <div className="text-[#00e599] text-xs font-bold">+$24.50</div>
                        </div>
                        <div className="p-3 bg-black rounded-lg border border-zinc-800 flex justify-between items-center">
                           <div className="h-2 w-20 bg-zinc-800 rounded"></div>
                           <div className="text-[#00e599] text-xs font-bold">+$12.00</div>
                        </div>
                        <div className="p-3 bg-black rounded-lg border border-zinc-800 flex justify-between items-center">
                           <div className="h-2 w-12 bg-zinc-800 rounded"></div>
                           <div className="text-[#00e599] text-xs font-bold">+$8.40</div>
                        </div>
                      </div>
                      <div className="mt-8 text-center text-zinc-500 text-xs">
                        Portfolio Performance
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Footer onOpenLegal={onOpenLegal} />
    </div>
  );
};