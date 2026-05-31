/**
 * Admin Theme Settings Page
 * Manage slider items, site name, and header category navigation
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { Globe, Tag, ImageIcon, Camera, Trash2, Save, X, ChevronUp, ChevronDown, Plus } from 'lucide-react';

interface SliderItem {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  showOverlay: boolean;
}

interface CategoryItem {
  name: string;
  subcategories: string[];
}

const emptySliderItem: SliderItem = {
  title: '',
  subtitle: '',
  imageUrl: '',
  buttonText: '',
  buttonLink: '',
  showOverlay: true
};

export default function ThemeSettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [siteName, setSiteName] = useState('Okur Pazarı');
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Header categories
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [headerCategories, setHeaderCategories] = useState<string[]>([]);
  const [savingHeader, setSavingHeader] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchSettings();
      fetchCategories();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/public');
      if (response.data.success) {
        setSiteName(response.data.data.siteName || 'Okur Pazarı');
        const items = response.data.data.sliderItems || [];
        setSliderItems(items.map((item: SliderItem) => ({
          ...item,
          showOverlay: item.showOverlay !== false
        })));
        setHeaderCategories(response.data.data.headerCategories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/settings/categories');
      if (res.data.success) {
        setAllCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Slider ---
  const addSliderItem = () => {
    setSliderItems([...sliderItems, { ...emptySliderItem }]);
  };

  const removeSliderItem = (index: number) => {
    setSliderItems(sliderItems.filter((_, i) => i !== index));
  };

  const updateSliderItem = (index: number, field: keyof SliderItem, value: string | boolean) => {
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
        showMsg('success', 'Resim yüklendi!');
      }
    } catch (err) {
      showMsg('error', 'Resim yüklenemedi');
    } finally {
      setUploading(null);
    }
  };

  const saveSiteName = async () => {
    try {
      setSaving(true);
      await api.put('/settings/site-name', { siteName });
      showMsg('success', 'Site adı güncellendi!');
    } catch (err) {
      showMsg('error', 'Site adı kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const saveSlider = async () => {
    try {
      setSaving(true);
      setMessage(null);
      for (const item of sliderItems) {
        if (!item.imageUrl) {
          showMsg('error', 'Her slider öğesi için resim zorunludur');
          setSaving(false);
          return;
        }
      }
      await api.put('/settings/slider', { items: sliderItems });
      showMsg('success', 'Slider ayarları kaydedildi!');
    } catch (err) {
      showMsg('error', 'Slider kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  // --- Header Categories ---
  const toggleHeaderCategory = (catName: string) => {
    setHeaderCategories(prev =>
      prev.includes(catName)
        ? prev.filter(c => c !== catName)
        : [...prev, catName]
    );
  };

  const saveHeaderCategories = async () => {
    try {
      setSavingHeader(true);
      await api.put('/settings/header-categories', { headerCategories });
      showMsg('success', 'Header kategorileri güncellendi!');
    } catch (err) {
      showMsg('error', 'Header kategorileri kaydedilemedi');
    } finally {
      setSavingHeader(false);
    }
  };

  if (isLoading) {
    return <AdminLayout><PageLoader /></AdminLayout>;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Tema Ayarları</h1>
      <p className="text-gray-600 mb-6">Slider, header kategorileri ve tema özelleştirmeleri</p>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </Alert>
      )}

      {/* Site Name */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-[#355872]" /> Site Adı</CardTitle>
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

      {/* Header Categories */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-[#355872]" /> Header Kategori Navigasyonu</CardTitle>
            <Button onClick={saveHeaderCategories} disabled={savingHeader} size="sm">
              {savingHeader ? 'Kaydediliyor...' : <><Save className="w-4 h-4 inline mr-1" /> Kaydet</>}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Aşağıdan header&apos;da (menü çubuğunda) gösterilecek kategorileri seçin. Alt kategorisi olan kategoriler otomatik olarak dropdown menü şeklinde açılır.
          </p>
          {allCategories.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz kategori eklenmemiş. Önce <Link href="/admin/kategoriler" className="text-[#355872] underline">Kategori Yönetimi</Link>&apos;nden kategori ekleyin.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allCategories.map((cat) => {
                const isActive = headerCategories.includes(cat.name);
                return (
                  <label
                    key={cat.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isActive
                        ? 'border-[#355872] bg-[#355872]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleHeaderCategory(cat.name)}
                      className="w-4 h-4 text-[#355872] border-gray-300 rounded focus:ring-[#7AACCE]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      {cat.subcategories.length > 0 && (
                        <span className="ml-1.5 text-xs text-gray-400">({cat.subcategories.length} alt)</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          {headerCategories.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-medium">Sıralama (Header&apos;daki görünüm):</p>
              <div className="flex flex-wrap gap-2">
                {headerCategories.map((name, i) => (
                  <span key={name} className="inline-flex items-center gap-1 bg-white border border-[#355872]/30 text-[#355872] px-3 py-1 rounded-full text-xs font-medium">
                    {i + 1}. {name}
                    <button onClick={() => toggleHeaderCategory(name)} className="ml-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slider */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#355872]" /> Ana Sayfa Slider</CardTitle>
            <Button onClick={addSliderItem} size="sm"><Plus className="w-4 h-4 mr-1" /> Yeni Slide Ekle</Button>
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
                      ><ChevronUp className="w-4 h-4" /></button>
                      <button
                        onClick={() => moveSliderItem(index, 'down')}
                        disabled={index === sliderItems.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded"
                      ><ChevronDown className="w-4 h-4" /></button>
                      <button
                        onClick={() => removeSliderItem(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-2"
                      ><X className="w-4 h-4" /></button>
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
                            <Camera className="w-4 h-4 inline mr-1" /> Değiştir
                          </button>
                          <button
                            onClick={() => updateSliderItem(index, 'imageUrl', '')}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" /> Kaldır
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

                  {/* Overlay Toggle */}
                  <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.showOverlay}
                        onChange={(e) => updateSliderItem(index, 'showOverlay', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600" />
                    </label>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Gri Efekt (Overlay)</span>
                      <p className="text-xs text-gray-400">Kapandığında resim olduğu gibi görünür</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Başlık (İsteğe bağlı)"
                      value={item.title}
                      onChange={(e) => updateSliderItem(index, 'title', e.target.value)}
                      placeholder="Slider başlığı"
                    />
                    <Input
                      label="Alt Başlık (İsteğe bağlı)"
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
                {saving ? 'Kaydediliyor...' : <><Save className="w-4 h-4 inline mr-1" /> Slider Ayarlarını Kaydet</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
