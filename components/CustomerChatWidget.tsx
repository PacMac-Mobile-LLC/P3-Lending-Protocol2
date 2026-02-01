import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { PersistenceService } from '../services/persistence';
import { Button } from './Button';

interface Props {
  user: UserProfile;
}

export const CustomerChatWidget: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Poll for messages in this user's thread OR broadcasts
  useEffect(() => {
    if (!isOpen) return;

    // Load initial
    const history = PersistenceService.getChatHistory();
    // Filter: Show only messages in my thread OR Broadcasts (no threadId, if any) 
    // And exclude internal messages unless they are in my thread (Support rep reply)
    const myMessages = history.filter(m => 
      (m.threadId === user.id) || 
      (m.type === 'CUSTOMER_SUPPORT' && m.threadId === user.id)
    );
    setMessages(myMessages);
    
    if (myMessages.length > 0) lastMessageIdRef.current = myMessages[myMessages.length - 1].id;

    const interval = setInterval(() => {
      const freshHistory = PersistenceService.getChatHistory();
      const freshMyMessages = freshHistory.filter(m => m.threadId === user.id);
      
      setMessages(freshMyMessages);

      const latest = freshMyMessages[freshMyMessages.length - 1];
      if (latest && latest.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latest.id;
        
        // Play notification sound if it's from a Rep (Admin/Support)
        if (latest.senderId !== user.id) {
           const audio = new Audio('data:audio/wav;base64,UklGRl9vT1NEXzIAAAAAExAAAAAAZ4AAAAAAAAAAAAAA...'); // Simple beep placeholder
           // Simulating the ding sound logic from AdminWidget
           try {
             const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
             const osc = ctx.createOscillator();
             const gain = ctx.createGain();
             osc.connect(gain);
             gain.connect(ctx.destination);
             osc.frequency.value = 1200; 
             gain.gain.setValueAtTime(0.1, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
             osc.start(ctx.currentTime);
             osc.stop(ctx.currentTime + 0.2);
           } catch(e) {}

           if (Notification.permission === 'granted') {
             new Notification('P3 Support', { body: latest.message, icon: '/logo.svg' });
           }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, user.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Request Notification Permission on first send
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      role: 'CUSTOMER',
      message: newMessage,
      timestamp: Date.now(),
      type: 'CUSTOMER_SUPPORT',
      threadId: user.id // Tie message to this user's thread
    };

    PersistenceService.addChatMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-[#0a0a0a] border border-orange-500/30 rounded-2xl w-80 h-96 shadow-2xl mb-4 flex flex-col animate-fade-in overflow-hidden relative">
           {/* Header */}
           <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                 <h3 className="font-bold text-white text-sm">P3 Customer Support</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a] custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-zinc-500 text-xs mt-10">
                  <p>All agents are notified.</p>
                  <p>Typical reply time: &lt; 2 mins.</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                     {!isMe && <span className="text-[10px] text-zinc-500 ml-1 mb-0.5">{msg.senderName} (Rep)</span>}
                     <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words ${isMe ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-300 rounded-tl-none'}`}>
                       {msg.message}
                     </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
           </div>

           {/* Input */}
           <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={e => setNewMessage(e.target.value)}
                   placeholder="How can we help?"
                   className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition-colors"
                 />
                 <Button type="submit" size="sm" className="px-3 bg-orange-500 hover:bg-orange-600 text-white border-none">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                 </Button>
              </div>
           </form>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        )}
      </button>
    </div>
  );
};
