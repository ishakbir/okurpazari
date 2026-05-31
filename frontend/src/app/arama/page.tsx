/**
 * Search Page — Advanced listing search with filters
 */
'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Listing, PRODUCT_CONDITIONS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

interface CategoryItem {
  name: string;
  subcategories: string[];
}

interface PaginatedListings {
  items: Listing[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');

  // Fetch categories from API
  useEffect(() => {
    api.get('/settings/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.data.categories);
        }
      })
      .catch(console.error);
  }, []);

  // Run search on mount (from URL params)
  useEffect(() => {
    fetchListings(1);
  }, []);

  const fetchListings = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');

      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await api.get<{ success: boolean; data: PaginatedListings }>(
        `/listings?${params.toString()}`
      );

      if (response.data.success) {
        setListings(response.data.data.items);
        setPagination({
          page: response.data.data.pagination.page,
          totalPages: response.data.data.pagination.totalPages,
          totalItems: response.data.data.pagination.totalItems
        });
      }
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('');
    setTimeout(() => fetchListings(1), 0);
  };

  // Get subcategories for selected category
  const selectedCatObj = categories.find(c => c.name === category);
  const subcategories = selectedCatObj?.subcategories || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {search ? `"${search}" için arama sonuçları` : 'İlan Ara'}
          </h1>

          {/* Filter Bar */}
          <div className="glass-panel p-5 md:p-8 rounded-3xl border-stone-200/50 mb-8 shadow-sm">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kitap adı, yazar, açıklama ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm bg-white"
                />
                <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-end gap-3">
                {/* Category */}
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-[none] focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                {subcategories.length > 0 && (
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Alt Kategori</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-[none] focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    >
                      <option value="">Tümü</option>
                      {subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div className="flex gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Min ₺</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-24 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-[none] focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Max ₺</label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-24 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-[none] focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>

                {/* Condition */}
                <div className="min-w-[140px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Durum</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm bg-white/50 backdrop-blur-sm focus:outline-[none] focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    <option value="">Tümü</option>
                    {Object.values(PRODUCT_CONDITIONS).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <button
                  type="submit"
                  className="bg-primary hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 btn-press shadow-md"
                >
                  Ara
                </button>
                {(search || category || minPrice || maxPrice || condition) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="border-2 border-stone-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-all duration-300 btn-press"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results */}
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-stone-100 rounded-2xl border border-stone-200/50 flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">İlan bulunamadı</h3>
              <p className="mt-2 text-gray-500 text-sm">Farklı filtreler deneyebilirsiniz.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {pagination.totalItems} ilan bulundu
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-3">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => fetchListings(pagination.page - 1)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Önceki
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchListings(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 btn-press border ${
                            pageNum === pagination.page
                              ? 'bg-primary border-primary text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-stone-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchListings(pagination.page + 1)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
