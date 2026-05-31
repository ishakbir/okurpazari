/**
 * Home Page - Public Listings
 */
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Listing, CATEGORIES } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { HeroSlider } from '@/components/home/HeroSlider';

interface PaginatedListings {
  items: Listing[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = async (page = 1) => {
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
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchListings(1);
  };

  const categoryOptions = [
    { value: '', label: 'Tüm Kategoriler' },
    ...CATEGORIES.map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="İlan ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                options={categoryOptions}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Kategori"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min ₺"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max ₺"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Ara
                </Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>
                  Temizle
                </Button>
              </div>
            </div>
          </form>

          {/* Results */}
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">İlan bulunamadı</h3>
              <p className="mt-2 text-gray-500">Farklı filtreler deneyebilirsiniz.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {pagination.totalItems} ilan bulundu
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchListings(pagination.page - 1)}
                  >
                    Önceki
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Sayfa {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchListings(pagination.page + 1)}
                  >
                    Sonraki
                  </Button>
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
