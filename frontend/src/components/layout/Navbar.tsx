'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';

interface CategoryItem {
  name: string;
  subcategories: string[];
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { onNotification, onMessageNotification } = useSocket();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category nav
  const [headerCategories, setHeaderCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/unread/count')
        .then(res => setUnreadNotifications(res.data?.data?.count || 0))
        .catch(() => {});
      api.get('/conversations/unread-count')
        .then(res => setUnreadMessages(res.data?.data?.count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub1 = onNotification(() => setUnreadNotifications(p => p + 1));
    const unsub2 = onMessageNotification(() => setUnreadMessages(p => p + 1));
    return () => { unsub1(); unsub2(); };
  }, [isAuthenticated, onNotification, onMessageNotification]);

  // Fetch header categories & all categories for subcategory data
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHeaderCategories(data.data.headerCategories || []);
        }
      })
      .catch(() => {});

    api.get('/settings/categories')
      .then(res => {
        if (res.data.success) {
          setAllCategories(res.data.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/arama?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  }, [searchQuery]);

  const handleDropdownEnter = (catName: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(catName);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const getSubcategories = (catName: string): string[] => {
    return allCategories.find(c => c.name === catName)?.subcategories || [];
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-white text-xs py-2.5 text-center font-medium tracking-wide">
        Okur Pazarı — Güvenli ikinci el kitap alışverişi
      </div>

      {/* Main Header */}
      <header className="bg-white/85 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/50 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight whitespace-nowrap">
            Okur Pazarı
          </Link>

          {/* Search Bar - Desktop (fixed alignment) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative flex items-stretch w-full hover-lift">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Örn. dünya klasikleri, roman, KPSS..."
                className="w-full border border-r-0 border-gray-300 rounded-l-xl px-5 py-2.5 focus:outline-[none] focus:border-accent focus:ring-1 focus:ring-accent bg-white/70 backdrop-blur-sm transition-all text-sm h-[46px]"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-black text-white px-6 rounded-r-xl transition-all duration-300 flex items-center border border-primary hover:border-black h-[46px]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-4 text-gray-500">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link href="/hesabim/bildirimler" className="relative hover:text-accent transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-1 shadow-sm">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
                  )}
                </Link>

                {/* Messages */}
                <Link href="/hesabim/mesajlar" className="relative hover:text-accent transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] px-1 h-4.5 flex items-center justify-center shadow-sm">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 text-primary flex items-center justify-center text-sm font-bold shadow-sm transition-transform hover:scale-105">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/hesabim" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Hesabım</Link>
                      <Link href="/hesabim/ilanlarim" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>İlanlarım</Link>
                      <Link href="/hesabim/siparislerim" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Siparişlerim</Link>
                      <Link href="/hesabim/satislarim" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Satışlarım</Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary/5 transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setMobileMenuOpen(false); }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >Çıkış Yap</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Listing */}
                <Link
                  href="/ilan-olustur"
                  className="hidden lg:flex bg-accent hover:bg-[#A16207] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  İlan Ver
                </Link>
              </>
            ) : (
              <>
                <Link href="/giris" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                  Giriş Yap
                </Link>
                <Link href="/kayit" className="bg-primary hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kitap ara..."
              className="w-full border border-gray-300 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-primary"
            />
            <button type="submit" className="absolute right-0 top-0 h-full text-gray-400 px-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Category Navigation Bar */}
        {headerCategories.length > 0 && (
          <nav className="border-t border-gray-200/50 bg-white/40 backdrop-blur-md">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-2 py-1 flex-wrap">
                {headerCategories.map((catName) => {
                  const subs = getSubcategories(catName);
                  const hasDropdown = subs.length > 0;

                  return (
                    <div
                      key={catName}
                      className="relative group"
                      onMouseEnter={() => hasDropdown && handleDropdownEnter(catName)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <Link
                        href={`/arama?category=${encodeURIComponent(catName)}`}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-black/5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {catName}
                        {hasDropdown && (
                          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === catName ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </Link>

                      {/* Subcategory Dropdown */}
                      {hasDropdown && openDropdown === catName && (
                        <div className="absolute left-0 top-full bg-white border border-gray-200 rounded-b-lg shadow-lg py-1 min-w-[200px] z-50">
                          <div className="absolute -top-2 left-0 right-0 h-2" />
                          {subs.map((sub) => (
                            <Link
                              key={sub}
                              href={`/arama?category=${encodeURIComponent(catName)}&subcategory=${encodeURIComponent(sub)}`}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Click outside to close menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}
