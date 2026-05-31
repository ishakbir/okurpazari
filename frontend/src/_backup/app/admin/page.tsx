/**
 * Admin Dashboard Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/giris');
        return;
      }
      if (user?.role !== 'ADMIN') {
        router.push('/hesabim');
        return;
      }
      fetchStats();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Paneli
            </h1>
            <p className="text-gray-600">Platform istatistikleri ve yönetim araçları</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{stats?.listings.pending || 0}</div>
                <div className="text-sm text-gray-500">Bekleyen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats?.listings.active || 0}</div>
                <div className="text-sm text-gray-500">Aktif</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{stats?.listings.rejected || 0}</div>
                <div className="text-sm text-gray-500">Reddedilen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats?.listings.sold || 0}</div>
                <div className="text-sm text-gray-500">Satılan</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">{stats?.users.total || 0}</div>
                <div className="text-sm text-gray-500">Kullanıcı</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Bekleyen İlanlar
                  {stats?.listings.pending ? (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.listings.pending}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Onay bekleyen ilanları incele ve onayla veya reddet.
                </p>
                <Link href="/admin/bekleyen">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    İlanları İncele
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Tüm İlanlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Platformdaki tüm ilanları görüntüle ve yönet.
                </p>
                <Link href="/admin/ilanlar">
                  <Button variant="outline" className="w-full">
                    İlanları Görüntüle
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Kullanıcıları görüntüle ve hesap durumlarını yönet.
                </p>
                <Link href="/admin/kullanicilar">
                  <Button variant="outline" className="w-full">
                    Kullanıcıları Görüntüle
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Tema Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Slider, site adı ve tema özelleştirmelerini yönetin.
                </p>
                <Link href="/admin/tema">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
                    Tema Ayarları
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
