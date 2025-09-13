'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { NeuButton, NeuInput, NeuCard } from '@/components/ui';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store/auth';
import { LoginForm, UserType } from '@/types';
import { testerValidationService } from '@/lib/firebase/testerValidationService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, validate if email is allowed for testers
      const emailValidation = await testerValidationService.validateTesterEmail(data.email);
      
      if (!emailValidation.isValid) {
        setError(emailValidation.message || 'This platform is only available to our loyal testers!');
        setIsLoading(false);
        return;
      }

      const user = await AuthService.signIn(data);
      setUser(user);
      
      // Redirect to home page after successful login
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType: 'customer' | 'businessOwner') => {
    // Demo login removed - production auth only.
  };

  const handleRealShopOwnerLogin = async (ownerKey: string) => {
    // Real shop owner demo removed.
  };

  const handleShopOwnerLogin = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.signIn(credentials);
      setUser(user);
      
      // Always redirect to home page
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Shop owner login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (error) {
      setError(null);
      clearErrors();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{
           background: 'linear-gradient(135deg, var(--neu-bg-primary) 0%, var(--neu-accent) 100%)'
         }}>
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">MyHustle</h1>
          <p className="text-white/90 text-lg">Welcome Back!</p>
        </div>

        {/* Login Form Card */}
        <NeuCard className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="neu-input pl-16 w-full"
                style={{ paddingLeft: '4.5rem' }}
                {...register('email')}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="neu-input pl-16 pr-16 w-full"
                style={{ paddingLeft: '4.5rem', paddingRight: '4.5rem' }}
                {...register('password')}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In Button */}
            <NeuButton
              type="submit"
              className="w-full h-12"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </NeuButton>

            {/* Demo UI removed for production */}

            {/* Sign Up Link */}
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </NeuCard>
      </div>
    </div>
  );
}
