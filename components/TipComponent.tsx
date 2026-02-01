import React, { useState } from 'react';
import { Button } from './Button';
import { useSlackNotifications } from '../hooks/useSlackNotifications';

interface Props {
  recipientName?: string;
  recipientAddress?: string;
  onClose?: () => void;
}

export const TipComponent: React.FC<Props> = ({ recipientName = 'User', recipientAddress = '0x...', onClose }) => {
  const [amount, setAmount] = useState('0.01');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { notifyTipSent } = useSlackNotifications();

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Send Slack notification
    await notifyTipSent({
      from: 'Current User', // In real app, get from wallet context
      to: recipientName,
      amount: parseFloat(amount),
      message: message
    });

    setSent(true);
    setIsSending(false);
    
    if (onClose) {
      setTimeout(onClose, 2000);
    }
  };

  if (sent) {
    return (
      <div className="bg-[#00e599]/10 border border-[#00e599]/30 rounded-xl p-6 text-center animate-fade-in">
        <div className="w-12 h-12 bg-[#00e599] rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(0,229,153,0.3)]">
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-[#00e599] font-bold text-lg">Tip Sent!</h3>
        <p className="text-sm text-zinc-400 mt-1">Notification sent to Slack channel.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-sm w-full relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💸</span> Send a Tip
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSendTip} className="space-y-4 relative z-10">
        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-bold">Recipient</div>
          <div className="font-bold text-white">{recipientName}</div>
          <div className="text-[10px] text-zinc-500 font-mono truncate">{recipientAddress}</div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Amount (ETH)</label>
          <input 
            type="number" 
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors font-mono"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold">Message (Optional)</label>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Great job!"
            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-[#00e599] outline-none transition-colors"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          isLoading={isSending}
        >
          Send Tip
        </Button>
      </form>
    </div>
  );
};