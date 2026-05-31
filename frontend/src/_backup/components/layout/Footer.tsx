/**
 * Footer Component
 */
import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-blue-600">İlan Platformu</h3>
            <p className="mt-2 text-sm text-gray-500">
              Güvenli ve kolay ilan verme platformu. Ürünlerinizi hızlıca satışa çıkarın.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Bağlantılar</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                  Tüm İlanlar
                </Link>
              </li>
              <li>
                <Link href="/ilan-olustur" className="text-sm text-gray-500 hover:text-gray-700">
                  İlan Ver
                </Link>
              </li>
              <li>
                <Link href="/hesabim" className="text-sm text-gray-500 hover:text-gray-700">
                  Hesabım
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">İletişim</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>destek@ilanplatformu.com</li>
              <li>+90 850 123 45 67</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400">
            © {currentYear} İlan Platformu. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
