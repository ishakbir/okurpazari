/**
 * Password Change Page
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export default function ChangePasswordPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/giris');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalı' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users/change-password', formData);
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi!' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Şifre değiştirilemedi' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Şifre Değiştir</h1>
            <Link href="/hesabim">
              <Button variant="outline">← Hesabım</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yeni Şifre Belirle</CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-4">
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Mevcut Şifre"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Mevcut şifrenizi girin"
                />

                <Input
                  label="Yeni Şifre"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="En az 8 karakter"
                  helperText="En az 8 karakter, harf ve rakam içermeli"
                />

                <Input
                  label="Yeni Şifre (Tekrar)"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Yeni şifreyi tekrar girin"
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Şifreyi Değiştir
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
