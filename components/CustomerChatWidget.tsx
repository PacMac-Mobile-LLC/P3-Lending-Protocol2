import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { PersistenceService } from '../services/persistence';
import { Button } from './Button';
import { supabase } from '../supabaseClient';

interface Props {
  user: UserProfile;
}

export const CustomerChatWidget: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load history
    const loadHistory = async () => {
      const allMsgs = await PersistenceService.getChatHistory();
      // Filter: My Thread OR General Broadcasts
      setMessages(allMsgs.filter(m => m.threadId === user.id || (!m.threadId && m.type === 'CUSTOMER_SUPPORT')));
    };
    loadHistory();

    // Subscribe to Realtime
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, (payload) => {
        const newMsg = payload.new.data as ChatMessage;
        // Only show if it belongs to me
        if (newMsg.threadId === user.id) {
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.senderId !== user.id) {
             // Play sound if support replies
             new Audio('data:audio/wav;base64,UklGRl9vT1NEXzIAAAAAExAAAAAAZ4AAAAAAAAAAAAAA...').play().catch(() => {});
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user.id]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (Notification.permission === 'default') await Notification.requestPermission();

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      role: 'CUSTOMER',
      message: newMessage,
      timestamp: Date.now(),
      type: 'CUSTOMER_SUPPORT',
      threadId: user.id
    };

    await PersistenceService.addChatMessage(msg);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto bg-[#0a0a0a] border border-orange-500/30 rounded-2xl w-80 h-96 shadow-2xl mb-4 flex flex-col animate-fade-in overflow-hidden">
           <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">P3 Support</h3>
              <button onClick={() => setIsOpen(false)} className="text-white">✕</button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a] custom-scrollbar">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                     <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${isMe ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                       {msg.message}
                     </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
           </div>
           <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Ask us anything..."
                className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
              />
              <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 border-none">Send</Button>
           </form>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg transition-all"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};