/**
 * Messages Inbox Page
 * List of all conversations
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDateTime } from '@/lib/utils';
import { MessageCircle, Package, User, ChevronRight } from 'lucide-react';

interface ConversationItem {
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
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      if (response.data.success) {
        setConversations(response.data.data.conversations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesajlarım</h1>
          <p className="text-gray-600">{conversations.length} konuşma</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Henüz mesajınız yok</h3>
            <p className="mt-2 text-gray-500">
              Bir ilan sayfasından satıcıyla mesajlaşmaya başlayabilirsiniz.
            </p>
            <Link href="/">
              <Button className="mt-4">İlanları İncele</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/hesabim/mesajlar/${conv.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {/* Avatar or Listing Image */}
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {conv.listing?.image ? (
                        <img
                          src={conv.listing.image}
                          alt={conv.listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {conv.otherUser.firstName} {conv.otherUser.lastName}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDateTime(conv.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      {conv.listing && (
                        <p className="text-sm text-primary truncate flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" /> {conv.listing.title}
                        </p>
                      )}
                      
                      {conv.lastMessage && (
                        <p className={`text-sm mt-1 truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                          {conv.lastMessage.senderName}: {conv.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center text-gray-400">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
