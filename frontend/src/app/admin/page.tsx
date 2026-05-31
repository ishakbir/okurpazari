/**
 * Admin Dashboard Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { Clock, CheckCircle, XCircle, ShoppingCart, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-600 mb-8">Platformun genel durumunu buradan takip edebilirsiniz.</p>

      {isLoading ? (
        <PageLoader />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          <Card className="border-yellow-200 bg-yellow-50 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Bekleyen İlanlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-yellow-700">{stats.listings.pending}</p></CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Aktif İlanlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-700">{stats.listings.active}</p></CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Reddedilen İlanlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-red-700">{stats.listings.rejected}</p></CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Satılan İlanlar
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-blue-700">{stats.listings.sold}</p></CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50 sm:col-span-2 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-indigo-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Toplam Kullanıcı
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-indigo-700">{stats.users.total}</p></CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-gray-500">İstatistikler yüklenemedi.</p>
      )}
    </AdminLayout>
  );
}
