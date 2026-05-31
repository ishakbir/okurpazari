/**
 * Listing Detail Page
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
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Ana Sayfa
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium truncate">
                {listing.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <Card className="overflow-hidden">
                <div className="aspect-[4/3] bg-gray-100">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Ürün Açıklaması</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>

              {/* Q&A Section */}
              <Card>
                <CardContent className="pt-6">
                  <ListingQA 
                    listingId={listing.id} 
                    sellerId={listing.seller?.id || 0}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price & Status */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[listing.status]}`}>
                      {STATUS_LABELS[listing.status]}
                    </span>
                    {listing.listingNumber && (
                      <span className="text-xs text-gray-400">
                        İlan No: #{listing.listingNumber}
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>

                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formatPrice(listing.price)}
                  </div>

                  {/* Buy Button */}
                  {canBuy && (
                    <Button 
                      className="w-full mb-4 bg-green-600 hover:bg-green-700"
                      onClick={() => setShowPurchaseModal(true)}
                    >
                      🛒 Satın Al
                    </Button>
                  )}

                  {!isAuthenticated && listing.status === 'ACTIVE' && (
                    <Alert variant="info" className="mb-4">
                      Satın almak için <Link href="/giris" className="underline font-medium">giriş yapın</Link>.
                    </Alert>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Kategori:</span>
                      <Badge>{listing.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Durum:</span>
                      <span className="font-medium">{listing.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>İlan Tarihi:</span>
                      <span>{formatDate(listing.createdAt)}</span>
                    </div>
                    {listing.soldAt && (
                      <div className="flex justify-between">
                        <span>Satış Tarihi:</span>
                        <span>{formatDateTime(listing.soldAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {listing.status === 'REJECTED' && listing.rejectionReason && (
                    <Alert variant="warning" className="mt-4">
                      <strong>Red Nedeni:</strong>
                      <p className="mt-1">{listing.rejectionReason}</p>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Seller Info */}
              {listing.seller && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Satıcı Bilgileri</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {listing.seller.firstName?.charAt(0)}{listing.seller.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {listing.seller.firstName} {listing.seller.lastName}
                        </div>
                        {listing.seller.email && (
                          <div className="text-sm text-gray-500">
                            {listing.seller.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {listing.seller.phone && (
                        <Button variant="outline" className="w-full">
                          📞 {listing.seller.phone}
                        </Button>
                      )}
                      {isAuthenticated && user?.id !== listing.seller.id && listing.status === 'ACTIVE' && (
                        <Button 
                          variant="outline" 
                          className="w-full"
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
                        >
                          💬 Satıcıyla Mesajlaş
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Buyer Info (for SOLD listings) */}
              {listing.status === 'SOLD' && listing.buyer && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Alıcı Bilgileri</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        {listing.buyer.firstName?.charAt(0)}{listing.buyer.lastName?.charAt(0)}
                      </div>
                      <div className="font-medium">
                        {listing.buyer.firstName} {listing.buyer.lastName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
            fetchListing(); // Refresh to update status if purchased
          }}
        />
      )}
    </div>
  );
}
