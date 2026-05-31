/**
 * Footer Component
 */
import React from 'react';
import Link from 'next/link';
import { BookOpen, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-gray-400 border-none">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              Okur Pazarı
            </h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-sm">
              Güvenli ve kolay ikinci el ilan verme platformu. Kitap dünyasındaki en değerli eserleri keşfedin ve paylaşın.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Bağlantılar</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors duration-200">
                  Tüm İlanlar
                </Link>
              </li>
              <li>
                <Link href="/ilan-olustur" className="text-sm text-gray-400 hover:text-accent transition-colors duration-200">
                  İlan Ver
                </Link>
              </li>
              <li>
                <Link href="/hesabim" className="text-sm text-gray-400 hover:text-accent transition-colors duration-200">
                  Hesabım
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent" />
                destek@okurpazari.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent" />
                +90 850 123 45 67
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} Okur Pazarı. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
