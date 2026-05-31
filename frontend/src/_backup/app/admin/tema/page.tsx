/**
 * Admin Theme Settings Page
 * Manage slider items (with image upload), site name
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';

interface SliderItem {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

const emptySliderItem: SliderItem = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: ''
};

export default function ThemeSettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [siteName, setSiteName] = useState('HukukKitaplığı');
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

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
      fetchSettings();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/public');
      if (response.data.success) {
        setSiteName(response.data.data.siteName || 'HukukKitaplığı');
        setSliderItems(response.data.data.sliderItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSliderItem = () => {
    setSliderItems([...sliderItems, { ...emptySliderItem }]);
  };

  const removeSliderItem = (index: number) => {
    setSliderItems(sliderItems.filter((_, i) => i !== index));
  };

  const updateSliderItem = (index: number, field: keyof SliderItem, value: string) => {
    const updated = [...sliderItems];
    updated[index] = { ...updated[index], [field]: value };
    setSliderItems(updated);
  };

  const moveSliderItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliderItems.length) return;
    const updated = [...sliderItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSliderItems(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploading(index);
      setMessage(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/settings/slider/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        updateSliderItem(index, 'imageUrl', response.data.data.imageUrl);
        setMessage({ type: 'success', text: 'Resim yüklendi!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Resim yüklenemedi. Lütfen tekrar deneyin.' });
    } finally {
      setUploading(null);
    }
  };

  const saveSiteName = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await api.put('/settings/site-name', { siteName });
      setMessage({ type: 'success', text: 'Site adı güncellendi!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Site adı kaydedilemedi' });
    } finally {
      setSaving(false);
    }
  };

  const saveSlider = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      for (const item of sliderItems) {
        if (!item.title || !item.imageUrl) {
          setMessage({ type: 'error', text: 'Her slider öğesi için başlık ve resim zorunludur' });
          setSaving(false);
          return;
        }
      }

      await api.put('/settings/slider', { items: sliderItems });
      setMessage({ type: 'success', text: 'Slider ayarları kaydedildi!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Slider kaydedilemedi' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tema Ayarları</h1>
              <p className="text-gray-600">Slider, site adı ve tema özelleştirmeleri</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">← Admin Panele Dön</Button>
            </Link>
          </div>

          {message && (
            <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
              {message.text}
            </Alert>
          )}

          {/* Site Name */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>🏠 Site Adı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Site Adı"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Site adını girin"
                  />
                </div>
                <Button onClick={saveSiteName} disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Slider */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>🖼️ Ana Sayfa Slider</CardTitle>
                <Button onClick={addSliderItem} size="sm">+ Yeni Slide Ekle</Button>
              </div>
            </CardHeader>
            <CardContent>
              {sliderItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Henüz slider öğesi yok</p>
                  <p className="text-sm mt-1">Yukarıdaki butona tıklayarak yeni slider öğesi ekleyin</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sliderItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-5 bg-white relative group hover:border-indigo-300 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          Slide {index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSliderItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded"
                          >↑</button>
                          <button
                            onClick={() => moveSliderItem(index, 'down')}
                            disabled={index === sliderItems.length - 1}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded"
                          >↓</button>
                          <button
                            onClick={() => removeSliderItem(index)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-2"
                          >✕</button>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slider Resmi *
                        </label>
                        {item.imageUrl ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={item.imageUrl.startsWith('/') ? `${apiBase}${item.imageUrl}` : item.imageUrl}
                              alt={item.title || 'Slider'}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => fileInputRefs.current[index]?.click()}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 mr-2"
                              >
                                📷 Değiştir
                              </button>
                              <button
                                onClick={() => updateSliderItem(index, 'imageUrl', '')}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600"
                              >
                                🗑 Kaldır
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRefs.current[index]?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                          >
                            {uploading === index ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                <p className="text-sm text-gray-500">Yükleniyor...</p>
                              </div>
                            ) : (
                              <>
                                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.25h10.5A2.25 2.25 0 0019.5 17V7A2.25 2.25 0 0017.25 4.75H6.75A2.25 2.25 0 004.5 7v10a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-600">Resim yüklemek için tıklayın</p>
                                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF • Max 10MB</p>
                              </>
                            )}
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          ref={(el) => { fileInputRefs.current[index] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(index, file);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Başlık *"
                          value={item.title}
                          onChange={(e) => updateSliderItem(index, 'title', e.target.value)}
                          placeholder="Slider başlığı"
                        />
                        <Input
                          label="Alt Başlık"
                          value={item.subtitle}
                          onChange={(e) => updateSliderItem(index, 'subtitle', e.target.value)}
                          placeholder="Kısa açıklama"
                        />
                        <Input
                          label="Buton Yazısı"
                          value={item.buttonText}
                          onChange={(e) => updateSliderItem(index, 'buttonText', e.target.value)}
                          placeholder="Detaylar"
                        />
                        <Input
                          label="Buton Linki"
                          value={item.buttonLink}
                          onChange={(e) => updateSliderItem(index, 'buttonLink', e.target.value)}
                          placeholder="/sayfa"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sliderItems.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={saveSlider} disabled={saving} className="px-8">
                    {saving ? 'Kaydediliyor...' : '💾 Slider Ayarlarını Kaydet'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
