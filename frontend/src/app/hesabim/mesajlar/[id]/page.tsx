/**
 * Chat Page
 * Individual conversation view with real-time messages
 */
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { Package, CheckCheck, Check } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationDetails {
  id: number;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
  };
  listing?: {
    id: number;
    title: string;
    image: string | null;
  };
}

export default function ChatPage() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { joinConversation, leaveConversation, onNewMessage, onMessagesRead, isConnected } = useSocket();
  const router = useRouter();
  const params = useParams();
  const conversationId = parseInt(params.id as string);
  
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (isAuthenticated && conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [authLoading, isAuthenticated, conversationId, router]);

  // Join conversation room for real-time updates
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [isConnected, conversationId, joinConversation, leaveConversation]);

  // Handle real-time new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((data) => {
      if (data.conversationId === conversationId && data.message.senderId !== user?.id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    });

    return unsubscribe;
  }, [onNewMessage, conversationId, user?.id]);

  // Handle read receipts
  useEffect(() => {
    const unsubscribe = onMessagesRead((data) => {
      if (data.conversationId === conversationId && data.readerId !== user?.id) {
        // Mark all my messages as read
        setMessages(prev => prev.map(msg => 
          msg.senderId === user?.id ? { ...msg, isRead: true } : msg
        ));
        setAllRead(true);
      }
    });

    return unsubscribe;
  }, [onMessagesRead, conversationId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await api.get(`/conversations/${conversationId}`);
      if (response.data.success) {
        setConversation(response.data.data.conversation);
      }
    } catch (err) {
      console.error(err);
      router.push('/hesabim/mesajlar');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      if (response.data.success) {
        const msgs = response.data.data.messages || [];
        setMessages(msgs);
        // Check if all sent messages are read
        const myMessages = msgs.filter((m: Message) => m.senderId === user?.id);
        setAllRead(myMessages.length > 0 && myMessages.every((m: Message) => m.isRead));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content: newMessage.trim()
      });
      if (response.data.success) {
        const sentMessage = response.data.data.message;
        setMessages(prev => [...prev, {
          ...sentMessage,
          senderName: `${user?.firstName} ${user?.lastName}`,
          createdAt: sentMessage.createdAt || new Date().toISOString()
        }]);
        setNewMessage('');
        setAllRead(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Get last sent message for read indicator
  const lastSentMessage = [...messages].reverse().find(m => m.senderId === user?.id);

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Link href="/hesabim/mesajlar">
              <Button variant="outline" size="sm">← Geri</Button>
            </Link>
            
            {conversation && (
              <div className="flex-1 flex items-center gap-3">
                {conversation.listing && (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {conversation.listing.image ? (
                      <img
                        src={conversation.listing.image}
                        alt={conversation.listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-5 h-5" /></div>
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="font-semibold text-gray-900">
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </h1>
                  {conversation.listing && (
                    <Link href={`/ilan/${conversation.listing.id}`}>
                      <p className="text-sm text-[#355872] truncate hover:underline">
                        {conversation.listing.title}
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <Card className="flex-1 flex flex-col min-h-[400px] max-h-[60vh]">
            <CardContent className="flex-1 overflow-y-auto py-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Henüz mesaj yok. Bir mesaj göndererek konuşmayı başlatın.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isOwn = msg.senderId === user?.id;
                    const isLastSent = lastSentMessage?.id === msg.id;
                    return (
                      <div key={msg.id}>
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              isOwn
                                ? 'bg-[#355872] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                              <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                                {msg.createdAt ? formatDateTime(msg.createdAt) : 'Şimdi'}
                              </p>
                              {/* Read indicator for own messages */}
                              {isOwn && isLastSent && (
                                <span className={`text-xs ${msg.isRead || allRead ? 'text-blue-200' : 'text-blue-300'}`}>
                                  {msg.isRead || allRead ? <><CheckCheck className="w-3.5 h-3.5 inline" /> Görüldü</> : <Check className="w-3.5 h-3.5 inline" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7AACCE] focus:border-[#355872] outline-none"
                  disabled={sending}
                />
                <Button type="submit" isLoading={sending} disabled={!newMessage.trim()}>
                  Gönder
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
