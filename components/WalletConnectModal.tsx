import React, { useState } from 'react';
import { Button } from './Button';
import { connectMetamask, connectCoinbase, connectWalletConnect } from '../services/walletService';
import { WalletState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: WalletState) => void;
}

export const WalletConnectModal: React.FC<Props> = ({ isOpen, onClose, onConnect }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (type: 'METAMASK' | 'WALLETCONNECT' | 'COINBASE') => {
    setLoading(type);
    setError(null);

    try {
      let wallet: WalletState;
      
      switch (type) {
        case 'METAMASK':
          wallet = await connectMetamask();
          break;
        case 'COINBASE':
          wallet = await connectCoinbase();
          break;
        case 'WALLETCONNECT':
          wallet = await connectWalletConnect();
          break;
        default:
          throw new Error('Unknown wallet type');
      }
      
      onConnect(wallet);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(0,229,153,0.1)] overflow-hidden relative">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="p-8 text-center relative z-0">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-zinc-800">
             <svg className="w-8 h-8 text-[#00e599]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Connect Wallet</h2>
          <p className="text-sm text-zinc-400 mb-8">Choose a wallet to connect to the P³ Lending Protocol.</p>

          <div className="space-y-3">
             {/* MetaMask */}
             <button 
               onClick={() => handleConnect('METAMASK')}
               disabled={!!loading}
               className="w-full flex items-center justify-between p-4 rounded-xl bg-black border border-zinc-800 hover:border-[#00e599] hover:bg-zinc-900 transition-all group disabled:opacity-50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white p-1">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full" />
                 </div>
                 <span className="font-semibold text-white group-hover:text-[#00e599] transition-colors">MetaMask</span>
               </div>
               {loading === 'METAMASK' && <div className="w-4 h-4 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>}
             </button>

             {/* Coinbase */}
             <button 
               onClick={() => handleConnect('COINBASE')}
               disabled={!!loading}
               className="w-full flex items-center justify-between p-4 rounded-xl bg-black border border-zinc-800 hover:border-[#0052ff] hover:bg-zinc-900 transition-all group disabled:opacity-50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#0052ff] p-1 flex items-center justify-center">
                   <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white"><path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm-2.8 9.6a6.4 6.4 0 100 12.8 6.4 6.4 0 000-12.8z"></path></svg>
                 </div>
                 <span className="font-semibold text-white group-hover:text-[#0052ff] transition-colors">Coinbase Wallet</span>
               </div>
               {loading === 'COINBASE' && <div className="w-4 h-4 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin"></div>}
             </button>

             {/* WalletConnect */}
             <button 
               onClick={() => handleConnect('WALLETCONNECT')}
               disabled={!!loading}
               className="w-full flex items-center justify-between p-4 rounded-xl bg-black border border-zinc-800 hover:border-[#3b99fc] hover:bg-zinc-900 transition-all group disabled:opacity-50"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#3b99fc] p-1.5 flex items-center justify-center">
                    <svg className="w-full h-full fill-white" viewBox="0 0 24 24"><path d="M5.4 3.7c4.2-3.7 10.7-3.7 14.9 0 .6.5.6 1.4 0 2l-.8.8c-.6.6-1.5.6-2.1 0-2.4-2.1-6.1-2.1-8.5 0-.6.5-1.5.5-2.1 0l-.8-.8c-.5-.6-.5-1.5 0-2zm5.9 14.5c.6-.5 1.5-.5 2.1 0l3.8 3.5c.6.5.6 1.4 0 2-.6.5-1.4.5-2 0l-2.8-2.6-2.8 2.6c-.6.5-1.5.5-2.1 0-.6-.6-.6-1.5 0-2l3.8-3.5zm-11.8-6c.6-.5 1.5-.5 2.1 0 1.2 1.1 2.8 1.7 4.5 1.7s3.3-.6 4.5-1.7c.6-.5 1.5-.5 2.1 0l.8.8c.6.6.6 1.5 0 2.1-2.1 1.9-4.8 2.9-7.5 2.9s-5.3-1-7.5-2.9c-.6-.6-.6-1.5 0-2.1l.9-.8z"/></svg>
                 </div>
                 <span className="font-semibold text-white group-hover:text-[#3b99fc] transition-colors">WalletConnect</span>
               </div>
               {loading === 'WALLETCONNECT' && <div className="w-4 h-4 border-2 border-[#3b99fc] border-t-transparent rounded-full animate-spin"></div>}
             </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};