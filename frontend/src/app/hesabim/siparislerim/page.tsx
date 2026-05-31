/**
 * My Orders Page (Purchases)
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Purchase } from '@/types';
import UserLayout from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ShoppingCart, Package, Check } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  SHIPPED: 'Kargoya Verildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi'
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

export default function MyOrdersPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPurchases();
    }
  }, [isAuthenticated]);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/purchases/my?limit=50');
      if (response.data.success) {
        setPurchases(response.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsCompleted = async (purchaseId: number) => {
    setActionLoading(purchaseId);
    setMessage(null);
    try {
      await api.post(`/purchases/${purchaseId}/complete`);
      setMessage({ type: 'success', text: 'Sipariş tamamlandı olarak işaretlendi' });
      fetchPurchases();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'İşlem başarısız' });
    } finally {
      setActionLoading(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="text-gray-600">{purchases?.length || 0} sipariş</p>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
          {message.text}
        </Alert>
      )}

      {!purchases || purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Henüz siparişiniz yok</h3>
            <p className="mt-2 text-gray-500">İlanları inceleyerek alışveriş yapabilirsiniz.</p>
            <Link href="/">
              <Button className="mt-4">İlanları İncele</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {purchase.listing?.images?.[0] ? (
                      <img
                        src={purchase.listing.images[0]}
                        alt={purchase.listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/ilan/${purchase.listing?.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary">
                            {purchase.listing?.title || 'İlan'}
                          </h3>
                        </Link>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(purchase.amount)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[purchase.status]}>
                        {STATUS_LABELS[purchase.status]}
                      </Badge>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      <p>Satıcı: {purchase.seller?.firstName} {purchase.seller?.lastName}</p>
                      <p>Sipariş Tarihi: {formatDateTime(purchase.createdAt)}</p>
                      {purchase.shippedAt && (
                        <p>Kargoya Verildi: {formatDateTime(purchase.shippedAt)}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      {purchase.status === 'SHIPPED' && (
                        <Button
                          size="sm"
                          onClick={() => markAsCompleted(purchase.id)}
                          isLoading={actionLoading === purchase.id}
                        >
                          <Check className="w-4 h-4 inline mr-1" /> Teslim Aldım
                        </Button>
                      )}
                      <Link href={`/ilan/${purchase.listing?.id}`}>
                        <Button variant="outline" size="sm">
                          Detay
                        </Button>
                      </Link>
                    </div>
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
