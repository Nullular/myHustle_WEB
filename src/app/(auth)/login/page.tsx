'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { NeuButton, NeuInput } from '@/components/ui';
import NeuDescriptionBox from '@/components/ui/NeuDescriptionBox';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store/auth';
import { LoginForm, UserType } from '@/types';
import { getDemoCredentials, getRealShopOwnerCredentials, REAL_SHOP_OWNERS } from '@/lib/demo/demoAuth';

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
    const credentials = getDemoCredentials(userType);
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.signIn(credentials);
      setUser(user);
      
      // Redirect based on user type
      if (user.userType === UserType.BUSINESS_OWNER) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealShopOwnerLogin = async (ownerKey: string) => {
    const credentials = REAL_SHOP_OWNERS[ownerKey as keyof typeof REAL_SHOP_OWNERS];
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
        <NeuDescriptionBox>
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
                className="neu-input pl-12 w-full"
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
                className="neu-input pl-12 pr-12 w-full"
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

            {/* Demo Login Buttons - For Development */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-3">Quick Demo Login</p>
              <div className="flex space-x-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('customer')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50"
                >
                  Demo Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('businessOwner')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg disabled:opacity-50"
                >
                  Demo Business
                </button>
              </div>
              
              {/* Real Shop Owner Accounts */}
              <p className="text-center text-sm text-gray-500 mb-3">Real Shop Owners</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleRealShopOwnerLogin('shopOwner1')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg disabled:opacity-50"
                >
                  Shop Owner 1
                </button>
                <button
                  type="button"
                  onClick={() => handleRealShopOwnerLogin('shopOwner2')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg disabled:opacity-50"
                >
                  Shop Owner 2
                </button>
              </div>
            </div>

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
        </NeuDescriptionBox>
      </div>
    </div>
  );
}
