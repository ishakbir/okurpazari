/**
 * Register Page
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';
import { AxiosError } from 'axios';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      await register(formData);
    } catch (err) {
      const axiosError = err as AxiosError<{ 
        message: string; 
        errors?: Array<{ field: string; message: string }> 
      }>;
      
      if (axiosError.response?.data?.errors) {
        const errors: FormErrors = {};
        axiosError.response.data.errors.forEach(err => {
          errors[err.field as keyof FormErrors] = err.message;
        });
        setFieldErrors(errors);
      } else {
        setError(axiosError.response?.data?.message || 'Kayıt olurken bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            İlan Platformu
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Kayıt Ol
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="text-blue-600 hover:text-blue-500">
              Giriş yap
            </Link>
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ad"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.firstName}
                  placeholder="Ahmet"
                />

                <Input
                  label="Soyad"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.lastName}
                  placeholder="Yılmaz"
                />
              </div>

              <Input
                label="E-posta"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={fieldErrors.email}
                placeholder="ornek@email.com"
              />

              <Input
                label="Şifre"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                error={fieldErrors.password}
                helperText="En az 8 karakter, bir harf ve bir rakam içermeli"
                placeholder="••••••••"
              />

              <Input
                label="Telefon (İsteğe bağlı)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
                placeholder="05XX XXX XX XX"
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Kayıt Ol
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
