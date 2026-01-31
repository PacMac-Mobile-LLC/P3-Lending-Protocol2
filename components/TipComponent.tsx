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
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center animate-fade-in">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-emerald-400 font-bold text-lg">Tip Sent!</h3>
        <p className="text-sm text-slate-400 mt-1">Notification sent to Slack channel.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl max-w-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💸</span> Send a Tip
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSendTip} className="space-y-4">
        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recipient</div>
          <div className="font-bold text-white">{recipientName}</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{recipientAddress}</div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Amount (ETH)</label>
          <input 
            type="number" 
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#667eea] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Message (Optional)</label>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Great job!"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#667eea] outline-none transition-colors"
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
