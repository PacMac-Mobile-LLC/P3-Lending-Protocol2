import React from 'react';
import { LegalDocType } from './LegalModal';

interface Props {
  onOpenLegal: (type: LegalDocType) => void;
}

export const Footer: React.FC<Props> = ({ onOpenLegal }) => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-black/80 backdrop-blur-md pt-12 pb-8 px-6 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
                  <span className="font-bold text-white text-lg">P</span>
                  <span className="text-[#00e599] text-[10px] font-bold absolute -mt-3 -mr-3">3</span>
                </div>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Protocol Compliance</span>
             </div>
             <p className="text-[10px] text-zinc-500 leading-relaxed max-w-md">
               P3 Securities is a decentralized technology platform, not a bank or depository institution. 
               Loans are originated directly between peers via smart contracts. 
               <strong>Loans are not FDIC insured.</strong> Crypto assets are highly volatile. 
               Participation involves significant risk, including potential loss of principal.
             </p>
             <div className="flex gap-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Equal_Housing_Lender_logo.svg/1200px-Equal_Housing_Lender_logo.svg.png" alt="EHL" className="h-8 opacity-20 grayscale hover:grayscale-0 transition-all" />
             </div>
          </div>

          <div>
             <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
             <ul className="space-y-3 text-[11px] text-zinc-500 font-medium">
                <li><button onClick={() => onOpenLegal('TERMS')} className="hover:text-[#00e599] transition-colors">Terms of Service</button></li>
                <li><button onClick={() => onOpenLegal('PRIVACY')} className="hover:text-[#00e599] transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onOpenLegal('ESIGN')} className="hover:text-[#00e599] transition-colors">E-Sign Consent</button></li>
                <li><button onClick={() => onOpenLegal('DISCLOSURES')} className="hover:text-[#00e599] transition-colors">State Disclosures</button></li>
             </ul>
          </div>

          <div>
             <h4 className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
             <ul className="space-y-3 text-[11px] text-zinc-500 font-medium">
                <li><button onClick={() => onOpenLegal('ECOA')} className="hover:text-[#00e599] transition-colors">Fair Lending (ECOA)</button></li>
                <li><button onClick={() => onOpenLegal('SECURITY')} className="hover:text-[#00e599] transition-colors">Responsible Security</button></li>
                <li><button onClick={() => onOpenLegal('SUPPORT')} className="hover:text-[#00e599] transition-colors">Support & Safety</button></li>
                <li><a href="#" className="hover:text-[#00e599] transition-colors">NMLS Consumer Access</a></li>
             </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600">
           <span>© 2024 P3 Securities. All rights reserved.</span>
           <div className="flex gap-4">
             <span>NMLS ID: 123456 (Pending)</span>
             <span>v2.4.0-beta</span>
           </div>
        </div>
      </div>
    </footer>
  );
};