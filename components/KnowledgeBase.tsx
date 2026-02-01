import React, { useState } from 'react';
import { Footer } from './Footer';
import { LegalDocType } from './LegalModal';
import { Logo } from './Logo';

declare global {
  interface Window {
    Tawk_API?: any;
  }
}

interface Props {
  onBack: () => void;
  onOpenLegal: (type: LegalDocType) => void;
}

interface Article {
  id: string;
  category: string;
  title: string;
  content: React.ReactNode;
}

export const KnowledgeBase: React.FC<Props> = ({ onBack, onOpenLegal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ['All', 'Getting Started', 'For Borrowers', 'For Lenders', 'Safety & Security'];

  const articles: Article[] = [
    {
      id: '1',
      category: 'Getting Started',
      title: 'What is Social Underwriting?',
      content: (
        <div className="space-y-4">
          <p>Traditional banks rely on FICO scores, which often look at your past 7 years of history without context. P3 Securities uses <strong>Social Underwriting</strong>.</p>
          <p>This means we analyze:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Current Behavior:</strong> Your repayment streak on our platform.</li>
            <li><strong>Community Trust:</strong> Endorsements and badges earned from mentors.</li>
            <li><strong>On-Chain History:</strong> Wallet age and transaction consistency.</li>
          </ul>
          <p>This allows us to lend to people with "thin files" or those rebuilding their credit.</p>
        </div>
      )
    },
    {
      id: '2',
      category: 'Getting Started',
      title: 'Connecting Your Wallet',
      content: (
        <div className="space-y-4">
          <p>To use P3, you need a Web3 wallet. We currently support <strong>MetaMask</strong> and <strong>Coinbase Wallet</strong>.</p>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <h4 className="font-bold text-white mb-2">Troubleshooting Connections</h4>
            <p className="text-sm">If your wallet won't connect:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm">
              <li>Ensure you are on a supported network (Ethereum Mainnet or Sepolia Testnet).</li>
              <li>Refresh the page and try again.</li>
              <li>Disable other wallet extensions that might conflict.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: '3',
      category: 'For Borrowers',
      title: 'How to Request a Loan',
      content: (
        <div className="space-y-4">
          <p>Navigate to your Dashboard and look for the "New Request" card.</p>
          <p><strong>Steps:</strong></p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Enter the amount (must be within your KYC Limit).</li>
            <li>Choose "Personal" for standard loans or "Microloan" for small, credit-building amounts.</li>
            <li>Describe the purpose clearly. Lenders are more likely to fund requests with clear goals (e.g., "Buying server equipment").</li>
          </ol>
        </div>
      )
    },
    {
      id: '4',
      category: 'For Borrowers',
      title: 'The "Fresh Start" Protocol',
      content: (
        <div className="space-y-4">
          <p>The <strong>Fresh Start</strong> protocol is for users with 0 Reputation Score or a negative history.</p>
          <p>By selecting "Fresh Start" on a Microloan request, your loan is backed by the P3 Charity Guarantee Fund. This effectively insures the lender against default.</p>
          <p><strong>Benefit:</strong> You get approved instantly as if you had an 80+ score. Repaying this loan starts your "Redemption Arc".</p>
        </div>
      )
    },
    {
      id: '5',
      category: 'For Lenders',
      title: 'Understanding Match Scores',
      content: (
        <div className="space-y-4">
          <p>Our AI analyzes borrower requests against your offer criteria. The Match Score (0-100%) indicates fit.</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div className="p-3 bg-[#00e599]/10 border border-[#00e599] rounded">
               <div className="font-bold text-[#00e599]">90-100%</div>
               <div className="text-xs">Perfect Match. Borrower meets all criteria and has a high repayment streak.</div>
             </div>
             <div className="p-3 bg-amber-500/10 border border-amber-500 rounded">
               <div className="font-bold text-amber-500">70-89%</div>
               <div className="text-xs">Good Match. Minor deviations (e.g., slightly lower score but verified income).</div>
             </div>
          </div>
        </div>
      )
    },
    {
      id: '6',
      category: 'Safety & Security',
      title: 'Avoiding Scams',
      content: (
        <div className="space-y-4">
          <p className="text-red-400 font-bold">WARNING: P3 Support will NEVER ask for your Private Key or Seed Phrase.</p>
          <p>All communication should happen within the P3 Dashboard or our official Discord. Do not trust DMs from people claiming to be "Loan Officers".</p>
        </div>
      )
    }
  ];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
            <Logo showText={false} />
            <div className="h-6 w-px bg-zinc-800"></div>
            <span className="font-bold text-white tracking-tight">Docs & Help Center</span>
          </div>
          <button onClick={onBack} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">
            ← Back to App
          </button>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00e599]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
           <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">How can we help?</h1>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Search guides, articles, and tutorials..."
               className="w-full bg-black border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-[#00e599] outline-none shadow-2xl transition-all"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
             <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-3">Categories</h3>
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => { setSelectedCategory(cat); setSelectedArticle(null); }}
               className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Article Grid / Detail */}
        <div className="lg:col-span-3">
           {selectedArticle ? (
             <div className="animate-fade-in">
               <button 
                 onClick={() => setSelectedArticle(null)}
                 className="text-xs text-[#00e599] font-bold mb-4 hover:underline flex items-center gap-1"
               >
                 ← Back to Search
               </button>
               <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{selectedArticle.category}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-8">{selectedArticle.title}</h2>
                  <div className="prose prose-invert prose-p:text-zinc-300 prose-headings:text-white max-w-none">
                    {selectedArticle.content}
                  </div>
               </div>
               
               <div className="mt-8 bg-black border border-zinc-800 rounded-xl p-6 flex justify-between items-center">
                 <div>
                   <h4 className="text-white font-bold">Was this helpful?</h4>
                   <p className="text-xs text-zinc-500">If you still need assistance, our team is online.</p>
                 </div>
                 <button 
                   onClick={() => window.Tawk_API?.maximize()} // Open Tawk.to
                   className="bg-[#00e599] hover:bg-[#00cc88] text-black font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                 >
                   Chat with Support
                 </button>
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {filteredArticles.length > 0 ? (
                 filteredArticles.map(art => (
                   <div 
                     key={art.id} 
                     onClick={() => setSelectedArticle(art)}
                     className="bg-black border border-zinc-800 p-6 rounded-xl hover:border-[#00e599] transition-all cursor-pointer group h-full"
                   >
                     <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2 group-hover:text-[#00e599] transition-colors">{art.category}</div>
                     <h3 className="text-lg font-bold text-white mb-2">{art.title}</h3>
                     <p className="text-sm text-zinc-500">Click to read guide →</p>
                   </div>
                 ))
               ) : (
                 <div className="col-span-2 text-center py-20">
                   <p className="text-zinc-500">No articles found matching "{searchTerm}".</p>
                   <button onClick={() => setSearchTerm('')} className="text-[#00e599] text-sm mt-2 hover:underline">Clear Search</button>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      <Footer onOpenLegal={onOpenLegal} />
    </div>
  );
};