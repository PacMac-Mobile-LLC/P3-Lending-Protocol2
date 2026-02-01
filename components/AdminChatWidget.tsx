import React, { useState, useEffect, useRef } from 'react';
import { EmployeeProfile, ChatMessage } from '../types';
import { PersistenceService } from '../services/persistence';
import { Button } from './Button';
import { supabase } from '../supabaseClient';

interface Props {
  currentUser: EmployeeProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminChatWidget: React.FC<Props> = ({ currentUser, isOpen, onClose }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyToThread, setReplyToThread] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = async () => {
      const emps = await PersistenceService.getEmployees();
      setEmployees(emps);
      const msgs = await PersistenceService.getChatHistory();
      setMessages(msgs);
    };
    loadData();

    // SUPABASE REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, (payload) => {
        const newMsg = payload.new.data as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
        
        // Notification logic
        if (newMsg.senderId !== currentUser.id) {
           new Audio('data:audio/wav;base64,UklGRl9vT1NEXzIAAAAAExAAAAAAZ4AAAAAAAAAAAAAA...').play().catch(() => {}); // Short beep
           if (Notification.permission === 'granted' && (newMsg.type === 'CUSTOMER_SUPPORT' || newMsg.message.includes(`@${currentUser.name}`))) {
             new Notification(`New Message: ${newMsg.senderName}`, { body: newMsg.message });
           }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      role: currentUser.role,
      message: newMessage,
      timestamp: Date.now(),
      type: replyToThread ? 'CUSTOMER_SUPPORT' : 'INTERNAL',
      threadId: replyToThread || undefined
    };

    await PersistenceService.addChatMessage(msg);
    // Realtime subscription will add it to the list
    setNewMessage('');
  };

  const handleReplyToCustomer = (threadId: string | undefined, customerName: string) => {
    if (!threadId) return;
    setReplyToThread(threadId);
    setNewMessage(`@${customerName} `);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-zinc-800 shadow-2xl z-[60] flex flex-col animate-fade-in">
       {/* Header */}
       <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 bg-[#00e599] rounded-full animate-pulse shadow-[0_0_5px_#00e599]"></div>
             <div>
               <h3 className="font-bold text-white text-sm">Unified Command</h3>
               <p className="text-[9px] text-zinc-500">Live Stream</p>
             </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
             ✕
          </button>
       </div>

       {/* Chat List */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            const isSupport = msg.type === 'CUSTOMER_SUPPORT';
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{msg.senderName}</span>
                    {msg.role === 'CUSTOMER' && <span className="text-[9px] bg-orange-900 text-orange-400 px-1 rounded">CLIENT</span>}
                 </div>
                 <div 
                   className={`px-3 py-2 rounded-lg text-sm max-w-[90%] cursor-pointer ${isMe ? 'bg-[#00e599]/10 text-white' : isSupport ? 'bg-orange-500/10 text-orange-100' : 'bg-zinc-800 text-zinc-300'}`}
                   onClick={() => isSupport && !isMe && handleReplyToCustomer(msg.threadId, msg.senderName)}
                 >
                   {msg.message}
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
       </div>
       
       {/* Input */}
       <div className="bg-zinc-900 border-t border-zinc-800 p-4">
         {replyToThread && (
           <div className="text-xs text-orange-400 mb-2 flex justify-between">
             <span>Replying to Customer...</span>
             <button onClick={() => setReplyToThread(null)}>Cancel</button>
           </div>
         )}
         <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00e599] outline-none"
            />
            <Button type="submit" size="sm">Send</Button>
         </form>
       </div>
    </div>
  );
};