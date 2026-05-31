/**
 * User Account Layout Component — Sidebar navigation for hesabım pages
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/Spinner';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  ShoppingBag,
  Wallet,
  MessageCircle,
  Lock,
  Home,
  User,
  Menu,
  X,
} from 'lucide-react';

interface UserLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: '/hesabim', label: 'Genel Bakış', icon: LayoutDashboard, exact: true },
  { href: '/hesabim/ilanlarim', label: 'İlanlarım', icon: FileText },
  { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: ShoppingBag },
  { href: '/hesabim/satislarim', label: 'Satışlarım', icon: Wallet },
  { href: '/hesabim/mesajlar', label: 'Mesajlarım', icon: MessageCircle },
  { href: '/hesabim/bildirimler', label: 'Bildirimler', icon: Bell },
  { href: '/hesabim/sifre-degistir', label: 'Şifre Değiştir', icon: Lock },
];

export default function UserLayout({ children }: UserLayoutProps) {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/giris');
        return;
      }
      if (user?.role === 'ADMIN') {
        router.push('/admin');
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex bg-gray-50">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
          aria-label="Menü"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 lg:top-auto left-0 z-40
          w-64 bg-white border-r border-gray-200 h-screen lg:h-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Hesabım
            </h2>
            <p className="text-xs text-gray-500 mt-1">{user?.firstName} {user?.lastName}</p>
          </div>

          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 mt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/ilan-olustur"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <PlusCircle className="w-[18px] h-[18px]" />
              Yeni İlan Oluştur
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Home className="w-[18px] h-[18px]" />
              Ana Sayfaya Dön
            </Link>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
