import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Okur Pazarı - İkinci El Kitap İlan Platformu",
  description: "Kitaplarınızı güvenle satışa çıkarın. Moderasyonlu ilan sistemi ile güvenli alışveriş.",
  keywords: "kitap, ikinci el kitap, ilan, güvenli alışveriş, okur pazarı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-white text-gray-900">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
