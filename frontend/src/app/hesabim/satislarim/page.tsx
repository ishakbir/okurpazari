/**
 * My Sales Page
 * With carrier selection and barcode display
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
import Barcode from 'react-barcode';
import { Wallet, Package, MapPin, Phone, Check } from 'lucide-react';

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

const CARRIERS = ['PTT', 'Yurtiçi', 'MNG', 'Aras', 'Sürat'];

export default function MySalesPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [sales, setSales] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<Record<number, string>>({});
  const [showShipModal, setShowShipModal] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated]);

  const fetchSales = async () => {
    try {
      const response = await api.get('/purchases/sales?limit=50');
      if (response.data.success) {
        setSales(response.data.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsShipped = async (purchaseId: number) => {
    const carrier = selectedCarrier[purchaseId];
    if (!carrier) {
      setMessage({ type: 'error', text: 'Lütfen bir kargo firması seçin' });
      return;
    }

    setActionLoading(purchaseId);
    setMessage(null);
    try {
      await api.post(`/purchases/${purchaseId}/ship`, { carrier });
      setMessage({ type: 'success', text: 'Sipariş kargoya verildi ve barkod oluşturuldu!' });
      setShowShipModal(null);
      fetchSales();
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
          <h1 className="text-2xl font-bold text-gray-900">Satışlarım</h1>
          <p className="text-gray-600">{sales?.length || 0} satış</p>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
          {message.text}
        </Alert>
      )}

      {!sales || sales.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Henüz satışınız yok</h3>
            <p className="mt-2 text-gray-500">İlanlarınız satıldığında burada görünecek.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="py-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {sale.listing?.images?.[0] ? (
                      <img
                        src={sale.listing.images[0]}
                        alt={sale.listing.title}
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
                        <Link href={`/ilan/${sale.listing?.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary">
                            {sale.listing?.title || 'İlan'}
                          </h3>
                        </Link>
                        <p className="text-lg font-bold text-green-600">
                          +{formatPrice(sale.amount)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[sale.status]}>
                        {STATUS_LABELS[sale.status]}
                      </Badge>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      <p>Alıcı: {sale.buyer?.firstName} {sale.buyer?.lastName}</p>
                      <p>Satış Tarihi: {formatDateTime(sale.createdAt)}</p>
                      {sale.shippingAddress && (
                        <p className="mt-1"><MapPin className="w-3.5 h-3.5 inline mr-1" />{sale.shippingAddress}</p>
                      )}
                      {sale.shippingPhone && (
                        <p><Phone className="w-3.5 h-3.5 inline mr-1" />{sale.shippingPhone}</p>
                      )}
                    </div>

                    {/* Shipping Barcode Display */}
                    {sale.status === 'SHIPPED' && sale.shipping_barcode && (
                      <div className="mt-4 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            <Package className="w-4 h-4 inline mr-1" />{sale.shipping_carrier} Kargo
                          </span>
                        </div>
                        <div className="flex justify-center bg-white p-2">
                          <Barcode 
                            value={sale.shipping_barcode} 
                            width={1.5}
                            height={50}
                            fontSize={12}
                            displayValue={true}
                          />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                          Takip No: {sale.shipping_barcode}
                        </p>
                      </div>
                    )}

                    {/* Ship Modal */}
                    {showShipModal === sale.id && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-3">Kargo Firması Seçin</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                          {CARRIERS.map((carrier) => (
                            <button
                              key={carrier}
                              onClick={() => setSelectedCarrier(prev => ({ ...prev, [sale.id]: carrier }))}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                selectedCarrier[sale.id] === carrier
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50'
                              }`}
                            >
                              {carrier}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => markAsShipped(sale.id)}
                            isLoading={actionLoading === sale.id}
                            disabled={!selectedCarrier[sale.id]}
                          >
                            <Check className="w-4 h-4 inline mr-1" /> Barkod Oluştur ve Kargoya Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowShipModal(null)}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {sale.status === 'PAID' && showShipModal !== sale.id && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => setShowShipModal(sale.id)}
                        >
                          <Package className="w-4 h-4 inline mr-1" /> Kargoya Ver
                        </Button>
                      </div>
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
