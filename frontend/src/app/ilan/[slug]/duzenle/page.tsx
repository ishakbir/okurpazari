/**
 * Edit Listing Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Listing, CATEGORIES, CONDITIONS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';

export default function EditListingPage() {
  const params = useParams();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (isAuthenticated && params.id) {
      fetchListing();
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${params.id}`);
      if (response.data.success) {
        const l = response.data.data.listing;
        setListing(l);
        setFormData({
          title: l.title,
          description: l.description,
          price: l.price.toString(),
          category: l.category,
          condition: l.condition
        });
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        setError('İlan bulunamadı');
      } else if (error.response?.status === 403) {
        setError('Bu ilanı düzenleme yetkiniz yok');
      } else {
        setError('İlan yüklenirken bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await api.put(`/listings/${params.id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition
      });

      if (response.data.success) {
        setSuccess('İlan güncellendi ve onaya gönderildi!');
        setTimeout(() => {
          router.push('/hesabim/ilanlarim');
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'İlan güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Alert variant="error">{error}</Alert>
        </main>
        <Footer />
      </div>
    );
  }

  // Only allow editing PENDING or REJECTED listings
  if (listing && listing.status !== 'PENDING' && listing.status !== 'REJECTED') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Alert variant="warning">Bu ilan durumu nedeniyle düzenlenemez.</Alert>
            <Button className="mt-4" onClick={() => router.push('/hesabim/ilanlarim')}>
              İlanlarıma Dön
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>İlanı Düzenle</CardTitle>
            </CardHeader>
            <CardContent>
              {listing?.status === 'REJECTED' && listing.rejectionReason && (
                <Alert variant="warning" className="mb-6">
                  <strong>Red nedeni:</strong> {listing.rejectionReason}
                  <p className="mt-1 text-sm">Lütfen ilanınızı bu nedene göre düzenleyip tekrar gönderin.</p>
                </Alert>
              )}

              {error && <Alert variant="error" className="mb-4">{error}</Alert>}
              {success && <Alert variant="success" className="mb-4">{success}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="İlan Başlığı"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ürününüzü tanımlayan kısa bir başlık"
                  required
                  minLength={5}
                  maxLength={200}
                />

                <Textarea
                  label="Açıklama"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ürünün durumu, özellikleri hakkında detaylı bilgi verin"
                  rows={5}
                  required
                  minLength={20}
                  maxLength={2000}
                />

                <Input
                  label="Fiyat (₺)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />

                <Select
                  label="Kategori"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  options={[
                    { value: '', label: 'Kategori seçin' },
                    ...CATEGORIES.map(cat => ({ value: cat, label: cat }))
                  ]}
                />

                <Select
                  label="Ürün Durumu"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  options={[
                    { value: '', label: 'Durum seçin' },
                    ...CONDITIONS.map(cond => ({ value: cond, label: cond }))
                  ]}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    Güncelle ve Onaya Gönder
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/hesabim/ilanlarim')}
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
