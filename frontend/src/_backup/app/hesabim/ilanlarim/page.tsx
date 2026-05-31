/**
 * My Listings Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Listing, STATUS_LABELS, STATUS_COLORS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatPrice, formatDate } from '@/lib/utils';

export default function MyListingsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (isAuthenticated) {
      fetchListings();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/listings/my?limit=50');
      if (response.data.success) {
        setListings(response.data.data.items);
      }
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu');
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
              <p className="text-gray-600">{listings.length} ilan</p>
            </div>
            <Link href="/ilan-olustur">
              <Button>Yeni İlan</Button>
            </Link>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">{error}</Alert>
          )}

          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz ilanınız yok</h3>
                <p className="mt-2 text-gray-500">İlk ilanınızı oluşturmak için aşağıdaki butona tıklayın.</p>
                <Link href="/ilan-olustur">
                  <Button className="mt-4">İlan Oluştur</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                            <p className="text-lg font-bold text-blue-600 mt-1">
                              {formatPrice(listing.price)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status]}`}>
                            {STATUS_LABELS[listing.status]}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                          {listing.category} • {listing.condition} • {formatDate(listing.createdAt)}
                        </div>

                        {/* Rejection reason */}
                        {listing.status === 'REJECTED' && listing.rejectionReason && (
                          <Alert variant="warning" className="mt-3">
                            <strong>Red nedeni:</strong> {listing.rejectionReason}
                          </Alert>
                        )}

                        {/* Actions */}
                        <div className="mt-3 flex gap-2">
                          <Link href={`/ilan/${listing.id}`}>
                            <Button variant="outline" size="sm">Görüntüle</Button>
                          </Link>
                          {(listing.status === 'PENDING' || listing.status === 'REJECTED') && (
                            <Link href={`/ilan/${listing.id}/duzenle`}>
                              <Button variant="ghost" size="sm">Düzenle</Button>
                            </Link>
                          )}
                        </div>
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
