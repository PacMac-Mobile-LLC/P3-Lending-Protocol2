
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { useChat } from '../hooks/useChat';

export const CustomerChatWidget: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, isConnected } = useChat({
    userId: user.id,
    threadId: user.id,
    isAdmin: false
  });

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, user.id, 'CUSTOMER_SUPPORT', user.name, 'CUSTOMER');
    setNewMessage('');
  };

  // Determine Status
  const lastMessage = messages[messages.length - 1];
  const isWaitingForAgent = lastMessage && lastMessage.senderId === user.id;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto bg-[#0a0a0a] border border-orange-500/30 rounded-2xl w-80 h-96 shadow-2xl mb-4 flex flex-col overflow-hidden animate-fade-in">
           <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">P3 Support</h3>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-orange-200">✕</button>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
                 <span className="text-[10px] text-orange-100 font-medium uppercase tracking-wide">
                    {!isConnected 
                      ? 'Connecting...' 
                      : isWaitingForAgent 
                        ? 'Connecting to agent...' 
                        : 'Agent Active'
                    }
                 </span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a] custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center mt-10 opacity-50">
                   <div className="text-4xl mb-2">👋</div>
                   <p className="text-xs text-zinc-400">How can we help you today?</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                     <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${isMe ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                       {msg.message}
                     </div>
                     <span className="text-[9px] text-zinc-600 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
                );
              })}
              {isWaitingForAgent && isConnected && (
                <div className="flex items-center gap-2 text-xs text-zinc-500 italic mt-2 animate-pulse">
                   <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                   <span>Waiting for agent response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
           </div>
           <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Ask us anything..." className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none" />
              <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 border-none">Send</Button>
           </form>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg transition-all relative">
        {isOpen ? '✕' : '💬'}
        {/* Unread badge logic could go here if we tracked customer unread count, 
            but usually customer opens chat when they want help */}
      </button>
    </div>
  );
};
