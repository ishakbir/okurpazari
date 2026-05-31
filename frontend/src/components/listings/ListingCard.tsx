/**
 * Listing Card Component - Blue Theme
 */
import React from 'react';
import Link from 'next/link';
import { Listing, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { formatPrice, formatRelativeTime, truncate } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  const listingUrl = listing.slug ? `/ilan/${listing.slug}` : `/ilan/${listing.id}`;
  
  return (
    <Link href={listingUrl}>
      <div className="glass-panel rounded-2xl overflow-hidden hover-lift group flex flex-col h-full cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden">
          <div className="aspect-[2/3]">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          {showStatus && (
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md shadow-sm ${STATUS_COLORS[listing.status]}`}>
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="glass-panel px-2.5 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm backdrop-blur-md">
              {listing.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 min-h-[40px] group-hover:text-accent transition-colors duration-300">
            {listing.title}
          </h3>
          
          <p className="text-xs text-gray-500 mb-2">
            {listing.condition} • {formatRelativeTime(listing.createdAt)}
          </p>

          <div className="flex flex-col">
            <span className="text-lg font-bold text-accent">
              {formatPrice(listing.price)}
            </span>
          </div>

          <button className="w-full mt-3 bg-primary text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-300 btn-press uppercase tracking-widest shadow-sm group-hover:bg-black">
            İncele
          </button>
        </div>
      </div>
    </Link>
  );
}
