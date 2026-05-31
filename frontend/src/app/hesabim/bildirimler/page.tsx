/**
 * Notifications Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Notification } from '@/types';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, DollarSign, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=50');
      if (response.data.success) {
        setNotifications(response.data.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LISTING_APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'LISTING_REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'LISTING_SOLD': return <DollarSign className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
          <p className="text-gray-600">{notifications.filter(n => !n.isRead).length} okunmamış</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" onClick={markAllRead}>
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Bildiriminiz yok</h3>
            <p className="mt-2 text-gray-500">İlan durumlarınızla ilgili bildirimler burada görünecektir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-all',
                !notification.isRead && 'border-primary/30 bg-primary-light/30'
              )}
            >
              <CardContent className="py-4">
                <div className="flex gap-4 items-start">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={cn(
                        'text-sm',
                        notification.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
                      )}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{notification.message}</p>
                    {notification.listingId && (
                      <Link href={`/ilan/${notification.listingId}`} className="text-sm text-primary hover:underline mt-2 inline-block">
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
    </UserLayout>
  );
}
