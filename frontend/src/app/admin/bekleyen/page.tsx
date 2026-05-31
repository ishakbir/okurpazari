/**
 * Admin Pending Listings Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Listing } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Check, X } from 'lucide-react';

export default function PendingListingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchListings();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/admin/listings/pending?limit=50');
      if (response.data.success) {
        setListings(response.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    setMessage(null);
    try {
      await api.post(`/admin/listings/${id}/approve`);
      setListings(listings.filter(l => l.id !== id));
      setMessage({ type: 'success', text: 'İlan onaylandı' });
    } catch (err) {
      setMessage({ type: 'error', text: 'İşlem başarısız' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason[id]?.trim()) {
      setMessage({ type: 'error', text: 'Red nedeni girmelisiniz' });
      return;
    }

    setActionLoading(id);
    setMessage(null);
    try {
      await api.post(`/admin/listings/${id}/reject`, {
        reason: rejectReason[id]
      });
      setListings(listings.filter(l => l.id !== id));
      setShowRejectForm(null);
      setMessage({ type: 'success', text: 'İlan reddedildi' });
    } catch (err) {
      setMessage({ type: 'error', text: 'İşlem başarısız' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bekleyen İlanlar</h1>
      <p className="text-gray-600 mb-6">{listings.length} ilan onay bekliyor</p>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
          {message.text}
        </Alert>
      )}

      {isLoading ? (
        <PageLoader />
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Tüm ilanlar incelendi</h3>
            <p className="mt-2 text-gray-500">Bekleyen ilan bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/ilan/${listing.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-[#355872]">
                            {listing.title}
                          </h3>
                        </Link>
                        <p className="text-lg font-bold text-[#355872]">
                          {formatPrice(listing.price)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="mt-2 text-xs text-gray-400">
                      {listing.category} • {listing.condition} • {formatDateTime(listing.createdAt)}
                    </div>

                    {listing.seller && (
                      <div className="mt-2 text-sm text-gray-500">
                        Satıcı: {listing.seller.firstName} {listing.seller.lastName}
                        {listing.seller.email && ` (${listing.seller.email})`}
                      </div>
                    )}

                    {/* Actions */}
                    {showRejectForm === listing.id ? (
                      <div className="mt-4 space-y-2">
                        <Input
                          placeholder="Red nedeni (zorunlu)"
                          value={rejectReason[listing.id] || ''}
                          onChange={(e) => setRejectReason({ ...rejectReason, [listing.id]: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(listing.id)}
                            isLoading={actionLoading === listing.id}
                          >
                            Reddet
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRejectForm(null)}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(listing.id)}
                          isLoading={actionLoading === listing.id}
                        >
                          <Check className="w-4 h-4 inline mr-1" /> Onayla
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowRejectForm(listing.id)}
                        >
                          <X className="w-4 h-4 inline mr-1" /> Reddet
                        </Button>
                        <Link href={`/ilan/${listing.id}`}>
                          <Button variant="outline" size="sm">
                            Detay
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
