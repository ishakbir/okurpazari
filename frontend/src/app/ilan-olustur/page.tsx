/**
 * Create Listing Page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { CATEGORIES, PRODUCT_CONDITIONS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { AxiosError } from 'axios';

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  condition?: string;
}

export default function CreateListingPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await api.post('/listings', {
        ...formData,
        price: parseFloat(formData.price)
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/hesabim/ilanlarim');
        }, 2000);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ 
        message: string; 
        errors?: Array<{ field: string; message: string }> 
      }>;
      
      if (axiosError.response?.data?.errors) {
        const errors: FormErrors = {};
        axiosError.response.data.errors.forEach(err => {
          errors[err.field as keyof FormErrors] = err.message;
        });
        setFieldErrors(errors);
      } else {
        setError(axiosError.response?.data?.message || 'İlan oluşturulurken bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = CATEGORIES.map(cat => ({ value: cat, label: cat }));
  const conditionOptions = Object.entries(PRODUCT_CONDITIONS).map(([key, value]) => ({
    value: value,
    label: value
  }));

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Yeni İlan Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert variant="success">
                  <strong>İlan oluşturuldu!</strong> İlanınız onay için gönderildi. 
                  Yönlendiriliyorsunuz...
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert variant="error" className="mb-4">{error}</Alert>
                  )}

                  <Alert variant="info" className="mb-6">
                    İlanınız oluşturulduktan sonra moderatör onayına sunulacaktır. 
                    Onay durumunu &quot;İlanlarım&quot; sayfasından takip edebilirsiniz.
                  </Alert>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="İlan Başlığı"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      error={fieldErrors.title}
                      placeholder="Örn: iPhone 14 Pro Max 256GB"
                      helperText="5-200 karakter arası"
                    />

                    <Textarea
                      label="Açıklama"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      error={fieldErrors.description}
                      placeholder="Ürün hakkında detaylı bilgi verin..."
                      helperText="20-5000 karakter arası"
                      rows={5}
                    />

                    <Input
                      label="Fiyat (₺)"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      error={fieldErrors.price}
                      placeholder="0.00"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Kategori"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        options={categoryOptions}
                        placeholder="Kategori seçin"
                        required
                        error={fieldErrors.category}
                      />

                      <Select
                        label="Ürün Durumu"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        options={conditionOptions}
                        placeholder="Durum seçin"
                        required
                        error={fieldErrors.condition}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                      >
                        İptal
                      </Button>
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        className="flex-1"
                      >
                        İlan Oluştur
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
