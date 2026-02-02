import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ChatMessage } from '../types';
import { PersistenceService } from '../services/persistence';

interface UseChatProps {
  userId?: string;
  threadId?: string;
  isAdmin?: boolean;
}

export const useChat = ({ userId, threadId, isAdmin = false }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const allMsgs = await PersistenceService.getChatHistory();
        let filtered = allMsgs;
        if (!isAdmin && threadId) {
          filtered = allMsgs.filter(m => m.threadId === threadId || (!m.threadId && m.type === 'CUSTOMER_SUPPORT'));
        }
        setMessages(filtered.sort((a, b) => a.timestamp - b.timestamp));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    };
    if (userId) loadHistory();
  }, [userId, threadId, isAdmin]);

  useEffect(() => {
    if (!userId) return;
    const channelName = isAdmin ? 'admin_global_chat' : `customer_chat_${threadId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, (payload) => {
        const newMsg = (payload.new.data || {
          id: payload.new.id,
          senderId: payload.new.sender_id,
          message: payload.new.message,
          type: payload.new.type,
          threadId: payload.new.thread_id,
          timestamp: new Date(payload.new.created_at).getTime()
        }) as ChatMessage;

        const isRelevant = isAdmin || newMsg.threadId === threadId;
        if (isRelevant) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp);
          });
        }
      })
      .subscribe((status) => setIsConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [userId, threadId, isAdmin]);

  const sendMessage = async (text: string, targetThreadId?: string, type: 'INTERNAL' | 'CUSTOMER_SUPPORT' = 'CUSTOMER_SUPPORT', senderName?: string, senderRole?: any) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: userId || 'anon',
      senderName: senderName || 'User',
      role: senderRole || 'CUSTOMER',
      message: text,
      timestamp: Date.now(),
      type: type,
      threadId: targetThreadId || threadId
    };
    setMessages(prev => [...prev, msg]);
    await PersistenceService.addChatMessage(msg);
  };

  return { messages, sendMessage, isConnected };
};