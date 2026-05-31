/**
 * Home Page - Son İlanlar (Latest Listings)
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Listing } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ListingCard } from '@/components/listings/ListingCard';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { HeroSlider } from '@/components/home/HeroSlider';
import { ArrowRight } from 'lucide-react';
import {
  Scale,
  BookOpen,
  Sprout,
  Landmark,
  Microscope,
  Baby,
  Rocket,
  GraduationCap,
  Package,
  type LucideIcon,
} from 'lucide-react';

interface CategoryItem {
  name: string;
  subcategories: string[];
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Hukuk': Scale,
  'Edebiyat': BookOpen,
  'Kişisel Gelişim': Sprout,
  'Tarih': Landmark,
  'Bilim': Microscope,
  'Çocuk': Baby,
  'Bilim Kurgu': Rocket,
  'Ders Kitabı': GraduationCap,
  'Diğer': Package,
};

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestListings();
    fetchCategories();
  }, []);

  const fetchLatestListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/listings?page=1&limit=12');
      if (response.data.success) {
        setListings(response.data.data.items);
      }
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/settings/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/arama?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Category Icons */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 stagger-children">
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.name] || Package;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl group hover-lift animate-slide-up cursor-pointer"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-stone-100 group-hover:bg-accent/10 border border-transparent group-hover:border-accent/20 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 shadow-sm">
                    <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-600 group-hover:text-accent transition-colors duration-300">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Son İlanlar */}
        <div className="container mx-auto px-4 pb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Son İlanlar
            </h2>
            <p className="mt-2 text-sm text-gray-500">En yeni eklenen ikinci el kitaplar</p>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <Alert variant="error">{error}</Alert>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Henüz ilan yok</h3>
              <p className="mt-2 text-gray-500 text-sm">İlk ilanı siz oluşturun!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 stagger-children">
                {listings.map((listing) => (
                  <div key={listing.id} className="animate-slide-up">
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>

              {/* Tümünü Gör butonu */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => router.push('/arama')}
                  className="bg-primary hover:bg-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 btn-press inline-flex items-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-1"
                >
                  Tüm İlanları Gör
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
