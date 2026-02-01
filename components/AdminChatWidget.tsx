import React, { useState, useEffect, useRef } from 'react';
import { EmployeeProfile, InternalChatMessage, AdminRole } from '../types';
import { PersistenceService } from '../services/persistence';
import { Button } from './Button';

interface Props {
  currentUser: EmployeeProfile;
  isOpen: boolean;
  onClose: () => void;
}

// Simple beep sounds via data URIs to avoid file dependency
const SOUNDS = {
  SEND: 'data:audio/wav;base64,UklGRl9vT1NEXzIAAAAAExAAAAAAZ4AAAAAAAAAAAAAA... (truncated for brevity, using standard beep logic below instead)',
  // Using a short pleasant pop sound
  POP: 'data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAP/7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAInfo...', 
};

export const AdminChatWidget: React.FC<Props> = ({ currentUser, isOpen, onClose }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [messages, setMessages] = useState<InternalChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'CHAT' | 'MEMBERS'>('CHAT');
  const lastMessageIdRef = useRef<string | null>(null);

  // Play a simple system beep context
  const playSound = (type: 'SEND' | 'RECEIVE') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'SEND') {
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.frequency.value = 1200; // Higher pitch for receive
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.error("Audio Context Error", e);
    }
  };

  const triggerNotification = (msg: InternalChatMessage) => {
    if (Notification.permission === 'granted') {
      new Notification(`New Message from ${msg.senderName}`, {
        body: msg.message,
        icon: '/logo.svg'
      });
    }
  };

  useEffect(() => {
    // Request Notification Permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Load data and setup polling
  useEffect(() => {
    if (!isOpen) return;

    // Initial load
    setEmployees(PersistenceService.getEmployees());
    const history = PersistenceService.getChatHistory();
    setMessages(history);
    if (history.length > 0) lastMessageIdRef.current = history[history.length - 1].id;

    // Polling for live updates
    const interval = setInterval(() => {
      const freshHistory = PersistenceService.getChatHistory();
      setMessages(freshHistory);
      
      const latest = freshHistory[freshHistory.length - 1];
      if (latest && latest.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = latest.id;
        
        // Check if it's someone else's message
        if (latest.senderId !== currentUser.id) {
          playSound('RECEIVE');
          
          // Check for @mention
          if (latest.message.includes(`@${currentUser.name}`)) {
            triggerNotification(latest);
          }
        }
      }
      
      setEmployees(PersistenceService.getEmployees()); 
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, currentUser]);

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
    playSound('SEND');
  };

  const insertTag = (name: string) => {
    setNewMessage(prev => `${prev}@${name} `);
    setActiveView('CHAT'); // Switch back to chat to type
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
                    
                    // Highlight logic for tags
                    const parts = msg.message.split(/(@\w+\s?)/g);

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
                           {parts.map((part, i) => (
                             part.startsWith('@') 
                               ? <span key={i} className="text-[#00e599] font-bold bg-[#00e599]/10 px-1 rounded">{part}</span> 
                               : <span key={i}>{part}</span>
                           ))}
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
                       placeholder="Message team... (@ to tag)"
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
                    <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 group hover:border-[#00e599]/50 transition-colors">
                       <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 border border-zinc-700">
                            {emp.name.charAt(0)}
                          </div>
                          {(emp.isActive) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00e599] rounded-full border-2 border-[#0a0a0a]"></div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{emp.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{emp.email}</div>
                       </div>
                       <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] bg-zinc-800 hover:bg-[#00e599] hover:text-black" onClick={() => insertTag(emp.name)}>
                         Tag
                       </Button>
                    </div>
                  ))}
               </div>
            </div>
          )}

       </div>
    </div>
  );
};