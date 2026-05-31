/**
 * Listing Card Component
 */
import React from 'react';
import Link from 'next/link';
import { Listing, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { formatPrice, formatRelativeTime, truncate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  // Use slug if available, otherwise fallback to id
  const listingUrl = listing.slug ? `/ilan/${listing.slug}` : `/ilan/${listing.id}`;
  
  return (
    <Link href={listingUrl}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="aspect-[4/3] bg-gray-100 relative">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Status Badge */}
          {showStatus && (
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[listing.status]}`}>
                {STATUS_LABELS[listing.status]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {listing.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {truncate(listing.description, 80)}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>

          {/* Category and Condition */}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="default">{listing.category}</Badge>
            <span className="text-xs text-gray-400">{listing.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
