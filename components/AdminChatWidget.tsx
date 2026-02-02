
import React, { useState, useEffect, useRef } from 'react';
import { EmployeeProfile } from '../types';
import { Button } from './Button';
import { useChat } from '../hooks/useChat';

export const AdminChatWidget: React.FC<{ 
  currentUser: EmployeeProfile; 
  isOpen: boolean; 
  onClose: () => void;
  onUnreadChange: (hasUnread: boolean) => void;
}> = ({ currentUser, isOpen, onClose, onUnreadChange }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyToThread, setReplyToThread] = useState<string | null>(null);
  const previousMsgCount = useRef(0);

  const { messages, sendMessage, isConnected } = useChat({ userId: currentUser.id, isAdmin: true });

  // Scroll to bottom when opening or new messages
  useEffect(() => { 
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  // Handle Unread Notifications
  useEffect(() => {
    // If we have more messages than before...
    if (messages.length > previousMsgCount.current) {
      // Get the latest message
      const latest = messages[messages.length - 1];
      
      // If widget is CLOSED and message is NOT from me, it's unread
      if (!isOpen && latest.senderId !== currentUser.id) {
        onUnreadChange(true);
      }
    }
    previousMsgCount.current = messages.length;
  }, [messages.length, isOpen, currentUser.id, onUnreadChange]);

  // Clear unread when opened
  useEffect(() => {
    if (isOpen) {
      onUnreadChange(false);
    }
  }, [isOpen, onUnreadChange]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, replyToThread || undefined, replyToThread ? 'CUSTOMER_SUPPORT' : 'INTERNAL', currentUser.name, currentUser.role);
    setNewMessage('');
  };

  // We use CSS transform instead of returning null to keep the hook/subscription alive
  return (
    <div 
      className={`fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-zinc-800 shadow-2xl z-[60] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
       <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
             <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#00e599]' : 'bg-red-500'} animate-pulse`}></div>
             <div><h3 className="font-bold text-white text-sm">Unified Command</h3></div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-white">{msg.senderName}</span></div>
                 <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] cursor-pointer ${isMe ? 'bg-[#00e599]/10 text-white' : 'bg-zinc-800 text-zinc-300'}`} onClick={() => !isMe && msg.threadId && setReplyToThread(msg.threadId)}>
                   {msg.message}
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
       </div>
       <div className="bg-zinc-900 border-t border-zinc-800 p-4">
         {replyToThread && <div className="text-xs text-orange-400 mb-2 flex justify-between"><span>Replying...</span><button onClick={() => setReplyToThread(null)}>Cancel</button></div>}
         <form onSubmit={handleSendMessage} className="flex gap-2"><input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white" /><Button type="submit" size="sm">Send</Button></form>
       </div>
    </div>
  );
};
