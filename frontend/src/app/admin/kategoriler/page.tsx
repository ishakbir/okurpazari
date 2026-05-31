/**
 * Admin Category Management Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Pencil, Trash2, X, Plus } from 'lucide-react';

interface CategoryItem {
  name: string;
  subcategories: string[];
}

export default function AdminCategoriesPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New category form
  const [newCategoryName, setNewCategoryName] = useState('');

  // Edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // New subcategory
  const [addingSubTo, setAddingSubTo] = useState<number | null>(null);
  const [newSubName, setNewSubName] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchCategories();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/settings/categories');
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = async (updated: CategoryItem[]) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/settings/categories', { categories: updated });
      if (res.data.success) {
        setCategories(updated);
        setMessage({ type: 'success', text: 'Kategoriler kaydedildi' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Kategoriler kaydedilemedi' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.some(c => c.name === newCategoryName.trim())) {
      setMessage({ type: 'error', text: 'Bu kategori zaten var' });
      return;
    }
    const updated = [...categories, { name: newCategoryName.trim(), subcategories: [] }];
    setNewCategoryName('');
    saveCategories(updated);
  };

  const handleDeleteCategory = (index: number) => {
    if (!confirm(`"${categories[index].name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    const updated = categories.filter((_, i) => i !== index);
    saveCategories(updated);
  };

  const handleRenameCategory = (index: number) => {
    if (!editName.trim()) return;
    const updated = [...categories];
    updated[index] = { ...updated[index], name: editName.trim() };
    setEditingIndex(null);
    setEditName('');
    saveCategories(updated);
  };

  const handleAddSubcategory = (catIndex: number) => {
    if (!newSubName.trim()) return;
    const updated = [...categories];
    const subs = [...updated[catIndex].subcategories];
    if (subs.includes(newSubName.trim())) {
      setMessage({ type: 'error', text: 'Bu alt kategori zaten var' });
      return;
    }
    subs.push(newSubName.trim());
    updated[catIndex] = { ...updated[catIndex], subcategories: subs };
    setNewSubName('');
    setAddingSubTo(null);
    saveCategories(updated);
  };

  const handleDeleteSubcategory = (catIndex: number, subIndex: number) => {
    const updated = [...categories];
    const subs = updated[catIndex].subcategories.filter((_, i) => i !== subIndex);
    updated[catIndex] = { ...updated[catIndex], subcategories: subs };
    saveCategories(updated);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Kategori Yönetimi</h1>
      <p className="text-gray-500 text-sm mb-6">Kategorileri ve alt kategorileri düzenleyin</p>

      {/* Messages */}
      {message && (
        <div className="mb-4">
          <Alert variant={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        </div>
      )}

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {/* Add New Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <form onSubmit={handleAddCategory} className="flex gap-3">
              <input
                type="text"
                placeholder="Yeni kategori adı..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#355872] transition-colors"
              />
              <Button type="submit" disabled={isSaving || !newCategoryName.trim()}>
                + Ekle
              </Button>
            </form>
          </div>

          {/* Category List */}
          <div className="space-y-4">
            {categories.map((cat, catIndex) => (
              <div key={catIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Category Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                  {editingIndex === catIndex ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#355872]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategory(catIndex);
                          if (e.key === 'Escape') { setEditingIndex(null); setEditName(''); }
                        }}
                      />
                      <button
                        onClick={() => handleRenameCategory(catIndex)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => { setEditingIndex(null); setEditName(''); }}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900">{cat.name}</span>
                        <span className="text-xs bg-[#355872]/10 text-[#355872] px-2 py-0.5 rounded-full font-medium">
                          {cat.subcategories.length} alt kategori
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingIndex(catIndex); setEditName(cat.name); }}
                          className="text-sm text-gray-500 hover:text-[#355872] transition-colors"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(catIndex)}
                          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Subcategories */}
                <div className="p-4">
                  {cat.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cat.subcategories.map((sub, subIndex) => (
                        <span
                          key={subIndex}
                          className="inline-flex items-center gap-1.5 bg-blue-50 text-gray-700 px-3 py-1.5 rounded-full text-sm border border-blue-100"
                        >
                          {sub}
                          <button
                            onClick={() => handleDeleteSubcategory(catIndex, subIndex)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Sil"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mb-3">Henüz alt kategori yok</p>
                  )}

                  {/* Add Subcategory */}
                  {addingSubTo === catIndex ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Alt kategori adı..."
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#355872]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubcategory(catIndex);
                          if (e.key === 'Escape') { setAddingSubTo(null); setNewSubName(''); }
                        }}
                      />
                      <button
                        onClick={() => handleAddSubcategory(catIndex)}
                        className="text-sm text-[#355872] font-medium hover:underline"
                      >
                        Ekle
                      </button>
                      <button
                        onClick={() => { setAddingSubTo(null); setNewSubName(''); }}
                        className="text-sm text-gray-400 hover:text-gray-600"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingSubTo(catIndex); setNewSubName(''); }}
                      className="text-sm text-[#355872] hover:underline font-medium"
                    >
                      + Alt Kategori Ekle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">Henüz kategori eklenmemiş</p>
              <p className="text-sm mt-1">Yukarıdan yeni kategori ekleyebilirsiniz</p>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
