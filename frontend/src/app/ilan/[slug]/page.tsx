/**
 * Listing Detail Page - Blue Theme (Stitch Product Detail Design)
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Listing, STATUS_LABELS, STATUS_COLORS } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageLoader } from '@/components/ui/Spinner';
import { ListingQA } from '@/components/listings/ListingQA';
import { PurchaseModal } from '@/components/listings/PurchaseModal';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const isSeller = user?.id === listing?.seller?.id;
  const canBuy = isAuthenticated && !isSeller && listing?.status === 'ACTIVE';

  useEffect(() => {
    if (params.slug) {
      fetchListing();
    }
  }, [params.slug]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${params.slug}`);
      if (response.data.success) {
        setListing(response.data.data.listing);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 404) {
        setError('İlan bulunamadı');
      } else if (error.response?.status === 403) {
        setError('Bu ilanı görüntüleme yetkiniz yok');
      } else {
        setError('İlan yüklenirken bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Alert variant="error" className="max-w-md mx-auto">
              {error || 'İlan bulunamadı'}
            </Alert>
            <Link href="/">
              <Button className="mt-4">Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 mb-6">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li><Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><Link href={`/?category=${listing.category}`} className="hover:text-primary transition-colors">{listing.category}</Link></li>
              <li><span className="mx-2">/</span></li>
              <li className="text-gray-900 font-medium truncate max-w-[200px]">{listing.title}</li>
            </ol>
          </nav>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-4">
              <div className="glass-panel p-4 rounded-2xl border-stone-200/50">
                {/* Main Image */}
                <div className="aspect-[2/3] w-full relative overflow-hidden rounded-md mb-4 bg-gray-100 flex items-center justify-center group">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[selectedImage]}
                      alt={listing.title}
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold shadow-md ${STATUS_COLORS[listing.status]}`}>
                      {STATUS_LABELS[listing.status]}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {listing.images && listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {listing.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square rounded border-2 overflow-hidden transition-colors ${
                          idx === selectedImage ? 'border-accent' : 'border-gray-200 hover:border-accent/50'
                        }`}
                      >
                        <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Product Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight font-serif tracking-tight">
                  {listing.title}
                </h1>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-gray-500">Kategori:</span>
                  <Link href={`/?category=${listing.category}`} className="text-primary font-medium hover:underline">{listing.category}</Link>
                  <span className="text-gray-300 mx-1">|</span>
                  <span className="text-gray-500">Durum:</span>
                  <span className="text-gray-800 font-medium">{listing.condition}</span>
                </div>

                {listing.listingNumber && (
                  <p className="text-xs text-gray-400 mb-4">İlan No: #{listing.listingNumber}</p>
                )}

                {/* Price Box */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex items-center justify-between mb-6 shadow-sm">
                  <div>
                    <p className="text-2xl font-bold text-accent">{formatPrice(listing.price)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {listing.status === 'ACTIVE' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full"></span>
                        Satışta
                      </span>
                    )}
                    {listing.status === 'SOLD' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Satıldı
                      </span>
                    )}
                  </div>
                </div>

                {/* Buy Button */}
                <div className="flex gap-4">
                  {canBuy && (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="flex-1 bg-primary hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 btn-press flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      SATIN AL
                    </button>
                  )}

                  {!isAuthenticated && listing.status === 'ACTIVE' && (
                    <div className="flex-1">
                      <Alert variant="info">
                        Satın almak için <Link href="/giris" className="underline font-medium">giriş yapın</Link>.
                      </Alert>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>İlan Tarihi</span>
                    <span className="font-medium text-gray-800">{formatDate(listing.createdAt)}</span>
                  </div>
                  {listing.soldAt && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span>Satış Tarihi</span>
                      <span className="font-medium text-gray-800">{formatDateTime(listing.soldAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Ürün Açıklaması</h3>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{listing.description}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              {listing.status === 'REJECTED' && listing.rejectionReason && (
                <Alert variant="warning">
                  <strong>Red Nedeni:</strong>
                  <p className="mt-1">{listing.rejectionReason}</p>
                </Alert>
              )}
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Seller Info Card */}
              {listing.seller && (
                <div className="glass-panel p-6 rounded-2xl border-stone-200/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Satıcı Bilgileri</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-primary font-bold text-xl border border-stone-200">
                      {listing.seller.firstName?.charAt(0)}{listing.seller.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{listing.seller.firstName} {listing.seller.lastName}</p>
                    </div>
                  </div>

                  {listing.seller.phone && (
                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-xs text-gray-500">İletişim</span>
                        <span className="block text-sm font-bold text-gray-800">📞 Mevcut</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block text-xs text-gray-500">Yanıt</span>
                        <span className="block text-sm font-bold text-gray-800">Hızlı</span>
                      </div>
                    </div>
                  )}

                  {isAuthenticated && user?.id !== listing.seller.id && listing.status === 'ACTIVE' && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await api.post('/conversations/start', {
                            sellerId: listing.seller?.id,
                            listingId: listing.id
                          });
                          if (response.data.success) {
                            router.push(`/hesabim/mesajlar/${response.data.data.conversation.id}`);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-300 btn-press flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Satıcıya Soru Sor
                    </button>
                  )}
                </div>
              )}

              {/* Trust Badges */}
              <div className="glass-panel p-6 rounded-2xl border-stone-200/50">
                <ul className="space-y-5">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">Güvenli Alışveriş</h4>
                      <p className="text-xs text-gray-500">Moderasyonlu ilan sistemi ile güvenli.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">Kolay İade</h4>
                      <p className="text-xs text-gray-500">14 gün içinde koşulsuz iade hakkı.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Buyer Info (SOLD listings) */}
              {listing.status === 'SOLD' && listing.buyer && (
                <div className="glass-panel p-6 rounded-2xl border-stone-200/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Alıcı Bilgileri</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      {listing.buyer.firstName?.charAt(0)}{listing.buyer.lastName?.charAt(0)}
                    </div>
                    <div className="font-medium">
                      {listing.buyer.firstName} {listing.buyer.lastName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Q&A Section */}
          <section className="mt-12">
            <div className="glass-panel rounded-3xl border-stone-200/50 p-6 lg:p-10">
              <ListingQA
                listingId={listing.id}
                sellerId={listing.seller?.id || 0}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Purchase Modal */}
      {listing && (
        <PurchaseModal
          listing={listing}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            fetchListing();
          }}
        />
      )}
    </div>
  );
}
