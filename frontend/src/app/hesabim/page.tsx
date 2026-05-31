/**
 * User Dashboard Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';

interface ListingStats {
  pending: number;
  active: number;
  rejected: number;
  sold: number;
  total: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        api.get<{ success: boolean; data: { stats: ListingStats } }>('/listings/my/stats'),
        api.get<{ success: boolean; data: { count: number } }>('/notifications/unread/count')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data.stats);
      }
      if (notifRes.data.success) {
        setUnreadCount(notifRes.data.data.count);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Hoş geldin, {user?.firstName}!
        </h1>
        <p className="text-gray-600">İlanlarını ve hesap bilgilerini buradan yönetebilirsin.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <Card className="animate-slide-up">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <div className="text-sm text-gray-500">Bekleyen</div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
            <div className="text-sm text-gray-500">Aktif</div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
            <div className="text-sm text-gray-500">Reddedilen</div>
          </CardContent>
        </Card>
        <Card className="animate-slide-up">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{stats?.sold || 0}</div>
            <div className="text-sm text-gray-500">Satılan</div>
          </CardContent>
        </Card>
      </div>

      {/* Notification alert */}
      {unreadCount > 0 && (
        <Card className="border-primary/20 bg-primary-light mb-6">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{unreadCount}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Okunmamış {unreadCount} bildiriminiz var</p>
              <p className="text-xs text-gray-500">Bildirimler sayfasından kontrol edebilirsiniz.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </UserLayout>
  );
}
