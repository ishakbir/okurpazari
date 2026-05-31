/**
 * Hero Slider Component
 * Auto-sliding carousel for the homepage, fetches data from site settings API
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SliderItem {
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

interface HeroSliderProps {
  items?: SliderItem[];
}

export function HeroSlider({ items: propItems }: HeroSliderProps) {
  const [items, setItems] = useState<SliderItem[]>(propItems || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch slider items from API if not provided via props
  useEffect(() => {
    if (!propItems) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.sliderItems?.length > 0) {
            setItems(data.data.sliderItems);
          }
        })
        .catch(() => {});
    }
  }, [propItems]);

  // Auto-slide
  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, currentIndex]);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
      setIsTransitioning(false);
    }, 300);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
      setIsTransitioning(false);
    }, 300);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  // Default content when no slider items
  if (items.length === 0) {
    return (
      <div className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            HukukKitaplığı
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto">
            Hukuk kitapları için güvenilir ikinci el platformu
          </p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const resolveImage = (url: string) => url.startsWith('/') ? `${apiBase}${url}` : url;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '400px' }}>
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${resolveImage(currentItem.imageUrl)})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${
        isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              {currentItem.title}
            </h2>
            {currentItem.subtitle && (
              <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow">
                {currentItem.subtitle}
              </p>
            )}
            {currentItem.buttonText && currentItem.buttonLink && (
              <a
                href={currentItem.buttonLink}
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {currentItem.buttonText}
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-200 flex items-center justify-center group"
            aria-label="Önceki"
          >
            <svg className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-200 flex items-center justify-center group"
            aria-label="Sonraki"
          >
            <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
