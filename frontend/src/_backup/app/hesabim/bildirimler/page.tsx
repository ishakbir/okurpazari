/**
 * Notifications Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Notification } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=50');
      if (response.data.success) {
        setNotifications(response.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LISTING_APPROVED':
        return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>;
      case 'LISTING_REJECTED':
        return <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</div>;
      case 'LISTING_SOLD':
        return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">💰</div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">🔔</div>;
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
              <p className="text-gray-600">{unreadCount} okunmamış bildirim</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">
                  🔔
                </div>
                <h3 className="text-lg font-medium text-gray-900">Bildirim yok</h3>
                <p className="mt-2 text-gray-500">İlan durumu değişikliklerinde burada bilgilendirileceksiniz.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    !notification.isRead && 'border-l-4 border-l-blue-500 bg-blue-50/50'
                  )}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={cn(
                            'font-medium',
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          )}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                          {notification.message}
                        </p>
                        {notification.listingId && (
                          <Link 
                            href={`/ilan/${notification.listingId}`}
                            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            İlanı Görüntüle →
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
