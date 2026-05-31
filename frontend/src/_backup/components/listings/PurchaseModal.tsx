/**
 * Purchase Modal Component
 * Mock payment form for buying listings
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Listing, PaymentData, ShippingData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { formatPrice } from '@/lib/utils';

interface PurchaseModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseModal({ listing, isOpen, onClose }: PurchaseModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shipping, setShipping] = useState<ShippingData>({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    address: '',
    phone: user?.phone || ''
  });

  const [payment, setPayment] = useState<PaymentData>({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  if (!isOpen) return null;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(`/purchases/listing/${listing.id}`, {
        payment: {
          cardNumber: payment.cardNumber.replace(/\s/g, ''),
          cardHolder: payment.cardHolder,
          expiry: payment.expiry,
          cvv: payment.cvv
        },
        shipping
      });

      setStep('success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Ödeme işlemi sırasında hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {step === 'shipping' && 'Teslimat Bilgileri'}
            {step === 'payment' && 'Ödeme Bilgileri'}
            {step === 'success' && 'Satın Alma Başarılı!'}
          </h2>
          {step !== 'success' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Product Summary */}
        {step !== 'success' && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    📦
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 line-clamp-1">{listing.title}</h3>
                <p className="text-xl font-bold text-blue-600">{formatPrice(listing.price)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          {/* Shipping Step */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <Input
                label="Alıcı Adı Soyadı"
                value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                required
              />
              <Textarea
                label="Teslimat Adresi"
                value={shipping.address}
                onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                placeholder="Mahalle, sokak, bina no, daire no, ilçe, il"
                rows={3}
                required
              />
              <Input
                label="Telefon"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                required
              />
              <Button type="submit" className="w-full">
                Ödemeye Geç
              </Button>
            </form>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-4">
                🔒 Demo mod: Herhangi bir kart bilgisi girin, ödeme kabul edilecek.
              </div>

              <Input
                label="Kart Numarası"
                value={payment.cardNumber}
                onChange={(e) => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
              <Input
                label="Kart Üzerindeki İsim"
                value={payment.cardHolder}
                onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value.toUpperCase() })}
                placeholder="AD SOYAD"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Son Kullanma"
                  value={payment.expiry}
                  onChange={(e) => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                  placeholder="AA/YY"
                  maxLength={5}
                  required
                />
                <Input
                  label="CVV"
                  type="password"
                  value={payment.cvv}
                  onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                  placeholder="***"
                  maxLength={4}
                  required
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Toplam:</span>
                  <span className="text-xl font-bold text-blue-600">{formatPrice(listing.price)}</span>
                </div>
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {formatPrice(listing.price)} Öde
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="w-full text-center text-gray-500 text-sm mt-2 hover:underline"
                >
                  ← Geri
                </button>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tebrikler!
              </h3>
              <p className="text-gray-600 mb-6">
                Siparişiniz başarıyla oluşturuldu. Satıcı en kısa sürede kargo gönderimi yapacak.
              </p>
              <div className="space-y-2">
                <Button onClick={() => router.push('/hesabim/siparislerim')} className="w-full">
                  Siparişlerimi Görüntüle
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Alışverişe Devam Et
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
