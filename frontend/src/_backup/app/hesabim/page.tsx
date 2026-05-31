/**
 * User Dashboard Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  const router = useRouter();
  const [stats, setStats] = useState<ListingStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      router.push('/admin');
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user, router]);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Hoş geldin, {user?.firstName}!
            </h1>
            <p className="text-gray-600">İlanlarını ve hesap bilgilerini buradan yönetebilirsin.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                <div className="text-sm text-gray-500">Bekleyen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
                <div className="text-sm text-gray-500">Aktif</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
                <div className="text-sm text-gray-500">Reddedilen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{stats?.sold || 0}</div>
                <div className="text-sm text-gray-500">Satılan</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>İlanlarım</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Tüm ilanlarını görüntüle ve düzenle.
                </p>
                <Link href="/hesabim/ilanlarim">
                  <Button variant="outline" className="w-full">
                    İlanlarıma Git
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Yeni İlan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Yeni bir ilan oluştur ve satışa başla.
                </p>
                <Link href="/ilan-olustur">
                  <Button className="w-full">
                    İlan Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Bildirimler
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  İlan durumu hakkında bildirimleri gör.
                </p>
                <Link href="/hesabim/bildirimler">
                  <Button variant="outline" className="w-full">
                    Bildirimleri Gör
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>🛒 Siparişlerim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Satın aldığın ürünleri takip et.
                </p>
                <Link href="/hesabim/siparislerim">
                  <Button variant="outline" className="w-full">
                    Siparişlerime Git
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>💰 Satışlarım</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Sattığın ürünleri ve kargo durumunu yönet.
                </p>
                <Link href="/hesabim/satislarim">
                  <Button variant="outline" className="w-full">
                    Satışlarıma Git
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>💬 Mesajlarım</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Satıcılar ve alıcılarla mesajlaş.
                </p>
                <Link href="/hesabim/mesajlar">
                  <Button variant="outline" className="w-full">
                    Mesajlarıma Git
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>🔒 Şifre Değiştir</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Hesap şifreni güncelle.
                </p>
                <Link href="/hesabim/sifre-degistir">
                  <Button variant="outline" className="w-full">
                    Şifre Değiştir
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
