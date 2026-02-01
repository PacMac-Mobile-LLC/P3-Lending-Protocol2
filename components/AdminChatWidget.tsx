import React, { useState, useEffect, useRef } from 'react';
import { EmployeeProfile, InternalChatMessage, AdminRole } from '../types';
import { PersistenceService } from '../services/persistence';
import { Button } from './Button';

interface Props {
  currentUser: EmployeeProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminChatWidget: React.FC<Props> = ({ currentUser, isOpen, onClose }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [messages, setMessages] = useState<InternalChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'CHAT' | 'MEMBERS'>('CHAT');

  // Load data and setup polling
  useEffect(() => {
    if (!isOpen) return;

    // Initial load
    setEmployees(PersistenceService.getEmployees());
    setMessages(PersistenceService.getChatHistory());

    // Simple polling to simulate real-time for the demo
    const interval = setInterval(() => {
      setMessages(PersistenceService.getChatHistory());
      // Re-fetch employees in case someone new joined
      setEmployees(PersistenceService.getEmployees()); 
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeView === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: InternalChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      role: currentUser.role,
      message: newMessage,
      timestamp: Date.now()
    };

    PersistenceService.addChatMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // SIMULATION: If user types "status" or "help", bot replies
    if (newMessage.toLowerCase().includes('status')) {
      setTimeout(() => {
        const reply: InternalChatMessage = {
          id: `msg_${Date.now() + 1}`,
          senderId: 'emp_super_admin',
          senderName: 'System Root',
          role: 'ADMIN',
          message: `[@${currentUser.name}] All systems operational. P3 Mainnet latency: 12ms.`,
          timestamp: Date.now()
        };
        PersistenceService.addChatMessage(reply);
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-zinc-800 shadow-2xl z-[60] flex flex-col animate-fade-in">
       {/* Header */}
       <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 bg-[#00e599] rounded-full animate-pulse shadow-[0_0_5px_#00e599]"></div>
             <h3 className="font-bold text-white">Team Channel</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveView(activeView === 'CHAT' ? 'MEMBERS' : 'CHAT')}
              className={`p-2 rounded hover:bg-zinc-800 transition-colors ${activeView === 'MEMBERS' ? 'text-[#00e599]' : 'text-zinc-500'}`}
              title="Team Members"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </button>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded hover:bg-zinc-800">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-hidden relative">
          
          {/* View: Chat Stream */}
          {activeView === 'CHAT' && (
            <div className="h-full flex flex-col">
               <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const showHeader = idx === 0 || messages[idx-1].senderId !== msg.senderId || (msg.timestamp - messages[idx-1].timestamp > 60000);

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                         {showHeader && (
                           <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs font-bold text-white">{msg.senderName}</span>
                              <span className={`text-[9px] px-1 rounded uppercase font-bold ${msg.role === 'ADMIN' ? 'bg-red-900/40 text-red-400' : 'bg-blue-900/40 text-blue-400'}`}>{msg.role.replace('_', ' ')}</span>
                              <span className="text-[10px] text-zinc-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                         )}
                         <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] break-words ${isMe ? 'bg-[#00e599]/10 border border-[#00e599]/30 text-white rounded-tr-none' : 'bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-tl-none'}`}>
                           {msg.message}
                         </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
               </div>
               
               {/* Input Area */}
               <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900 border-t border-zinc-800">
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newMessage}
                       onChange={e => setNewMessage(e.target.value)}
                       placeholder="Message team..."
                       className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00e599] outline-none transition-colors"
                     />
                     <Button type="submit" size="sm" className="px-3">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                     </Button>
                  </div>
               </form>
            </div>
          )}

          {/* View: Members List */}
          {activeView === 'MEMBERS' && (
            <div className="h-full overflow-y-auto p-4 custom-scrollbar">
               <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Active Employees</h4>
               <div className="space-y-3">
                  {employees.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                       <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">
                            {emp.name.charAt(0)}
                          </div>
                          {/* Simulate online status - Root & Current user always online */}
                          {(emp.isActive) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00e599] rounded-full border-2 border-[#0a0a0a]"></div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{emp.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{emp.email}</div>
                       </div>
                       <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${emp.role === 'ADMIN' ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-500'}`}>
                         {emp.role === 'RISK_OFFICER' ? 'RISK' : emp.role}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

       </div>
    </div>
  );
};