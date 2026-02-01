import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Button } from './Button';
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
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const current = events[index];

  return (
    <div 
      className={`fixed top-24 right-6 z-40 transition-all duration-500 ease-in-out transform ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
    >
      <div className="bg-[#050505]/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-4 w-72">
        <div className="w-10 h-10 rounded-full bg-[#00e599]/20 flex items-center justify-center text-lg">
          {current.icon}
        </div>
        <div>
          <div className="text-[#00e599] font-bold text-xs uppercase tracking-wider mb-0.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse"></span>
            Live Protocol
          </div>
          <div className="text-white font-bold text-sm">{current.title}</div>
          <div className="text-zinc-500 text-xs">{current.sub}</div>
        </div>
      </div>
    </div>
  );
};

// --- Waitlist Modal Component ---
const WaitlistModal = ({ isOpen, onClose, onLaunchApp }: { isOpen: boolean; onClose: () => void; onLaunchApp: () => void }) => {
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('SUCCESS');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <button onClick={onClose} className="absolute -top-12 right-0 text-zinc-500 hover:text-white transition-colors">
          Close ✕
        </button>

        {step === 'FORM' ? (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 bg-[#00e599]/10 rounded-xl flex items-center justify-center mb-6 border border-[#00e599]/20">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Join the Revolution</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Secure your spot in the P3 Protocol. We are onboarding users in batches based on Reputation Score.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Satoshi Nakamoto"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="satoshi@gmx.com"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
                />
              </div>
              
              <Button type="submit" className="w-full py-4 text-base" isLoading={isSubmitting}>
                Get Early Access
              </Button>
              <p className="text-[10px] text-zinc-600 text-center mt-4">
                By joining, you agree to our Terms of Service. No spam, just decentralized finance.
              </p>
            </form>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center animate-fade-in">
             <div className="relative inline-block mb-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center relative z-10 border border-zinc-800">
                  <span className="font-bold text-white text-3xl">P</span>
                </div>
                <div className="absolute -top-2 -right-2 bg-[#00e599] text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-20 shadow-lg">
                  3
                </div>
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-2">You're on the list, <span className="text-[#00e599]">{name.split(' ')[0]}</span>.</h2>
             <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
               Your spot is secured. We are rewriting the rules of lending by replacing FICO scores with social reputation.
             </p>

             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Waitlist Position</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tighter">#4,291</div>
             </div>

             <p className="text-zinc-500 text-xs mb-4">
               While you wait, you can check out the live beta environment.
             </p>

             <Button onClick={onLaunchApp} className="w-full py-3 bg-[#00e599] text-black hover:bg-[#00cc88]">
               View Live Status
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const LandingPage: React.FC<Props> = ({ onLaunch, onDevAdminLogin, onOpenDocs, onOpenLegal }) => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative font-sans selection:bg-[#00e599] selection:text-black flex flex-col">
      <LiveToasts />
      <WaitlistModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} onLaunchApp={onLaunch} />

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 pointer-events-none fixed"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#00e599]/5 rounded-full blur-[120px] pointer-events-none fixed"></div>
      
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <Logo />
        <div className="flex items-center gap-4">
          <button onClick={() => setShowWaitlist(true)} className="hidden md:block bg-[#00e599] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00cc88] transition-colors shadow-[0_0_15px_rgba(0,229,153,0.3)]">
            Join Waitlist
          </button>
          <button onClick={onLaunch} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
            Member Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-40 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[#00e599] text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse"></span>
            Early Access Beta
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95]">
            Credit based on<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#00e599] to-emerald-700">Character</span>, not History.
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            P3 is the first decentralized lending protocol powered by AI reputation scoring and social underwriting. Stop relying on FICO. Start building trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" onClick={() => setShowWaitlist(true)} className="h-14 px-10 text-lg shadow-[0_0_30px_rgba(0,229,153,0.3)] hover:scale-105 transition-transform">
              Get Early Access
            </Button>
            <Button size="lg" variant="secondary" onClick={onOpenDocs} className="h-14 px-10 text-lg border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900">
              Read Manifesto
            </Button>
          </div>

          <p className="text-xs text-zinc-600 font-mono">
            Limited spots available for Q1 2025.
          </p>
        </div>
      </section>

      {/* Stats Ticker */}
      <div className="border-y border-zinc-900 bg-black/50 backdrop-blur-sm overflow-hidden py-4">
        <div className="flex gap-16 justify-center items-center text-zinc-500 font-mono text-xs uppercase tracking-widest animate-ticker whitespace-nowrap">
           <span>Total Liquidity: $2.4M</span>
           <span>•</span>
           <span>Repayment Rate: 98.2%</span>
           <span>•</span>
           <span>Verified Users: 15,204</span>
           <span>•</span>
           <span>Avg Approval: 4.8s</span>
           <span>•</span>
           <span>Waitlist: 4,291</span>
           <span>•</span>
           <span>Total Liquidity: $2.4M</span>
           <span>•</span>
           <span>Repayment Rate: 98.2%</span>
        </div>
      </div>

      {/* Borrower Section */}
      <section className="py-32 px-6 border-b border-zinc-900 bg-black relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="space-y-8">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl border border-blue-500/20">💸</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Need Capital?<br/>Build your score.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Traditional banks reject you for having a "thin file". We look at the whole picture. 
                Start small with our <strong>Fresh Start</strong> program and unlock larger amounts as you prove your reliability.
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> No FICO Score Required</li>
                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Instant "Fresh Start" Approval</li>
                <li className="flex items-center gap-3"><span className="text-blue-500">✓</span> Funds sent directly to Wallet</li>
              </ul>
              <Button onClick={() => setShowWaitlist(true)} variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">Start Borrowing</Button>
           </div>
           
           <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="flex justify-between items-center mb-8">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Loan Request</div>
                    <div className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">PENDING</div>
                 </div>
                 <div className="space-y-4">
                    <div className="h-24 bg-black rounded-xl border border-zinc-800 flex items-center justify-center">
                       <span className="text-3xl font-bold text-white">$500.00</span>
                    </div>
                    <div className="space-y-2">
                       <div className="h-2 w-full bg-zinc-800 rounded"></div>
                       <div className="h-2 w-3/4 bg-zinc-800 rounded"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Lender Section */}
      <section className="py-32 px-6 bg-zinc-900/20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
           <div className="relative order-last md:order-first">
              <div className="absolute inset-0 bg-[#00e599]/10 blur-[100px] rounded-full"></div>
              <div className="relative bg-black border border-zinc-800 rounded-3xl p-8 -rotate-3 hover:rotate-0 transition-transform duration-500">
                 <div className="flex justify-between items-center mb-8">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Portfolio</div>
                    <div className="text-[#00e599] text-xs font-bold">+12.4% APY</div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">👤</div>
                          <div className="h-2 w-20 bg-zinc-800 rounded"></div>
                       </div>
                       <div className="text-[#00e599] font-mono text-xs">+$24.50</div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">👤</div>
                          <div className="h-2 w-16 bg-zinc-800 rounded"></div>
                       </div>
                       <div className="text-[#00e599] font-mono text-xs">+$18.20</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="w-12 h-12 bg-[#00e599]/10 rounded-xl flex items-center justify-center text-2xl border border-[#00e599]/20">📈</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Grow Wealth.<br/>Make an Impact.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Earn competitive yields while helping real people break the debt cycle. 
                Our AI does the heavy lifting, vetting borrowers and assigning risk scores so you can lend with confidence.
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3"><span className="text-[#00e599]">✓</span> Earn 5-15% APY on Crypto</li>
                <li className="flex items-center gap-3"><span className="text-[#00e599]">✓</span> Automated AI Matchmaking</li>
                <li className="flex items-center gap-3"><span className="text-[#00e599]">✓</span> Direct Peer-to-Peer Contracts</li>
              </ul>
              <Button onClick={() => setShowWaitlist(true)} variant="secondary" className="border-[#00e599]/30 text-[#00e599] hover:bg-[#00e599]/10">Become a Lender</Button>
           </div>
        </div>
      </section>

      <Footer onOpenLegal={onOpenLegal} />
    </div>
  );
};