'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { NeuButton, NeuSwitch } from '@/components/ui';
import NeuDescriptionBox from '@/components/ui/NeuDescriptionBox';
import { AuthService } from '@/lib/firebase/auth';
import { useAuthStore } from '@/lib/store/auth';
import { SignUpForm, UserType } from '@/types';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  userType: z.nativeEnum(UserType),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>(UserType.CUSTOMER);
  
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: UserType.CUSTOMER,
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthService.signUp(data);
      setUser(user);
      
      // Redirect based on user type
      if (user.userType === UserType.BUSINESS_OWNER) {
        router.push('/create-store');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
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

  const handleUserTypeChange = (isBusinessOwner: boolean) => {
    const newUserType = isBusinessOwner ? UserType.BUSINESS_OWNER : UserType.CUSTOMER;
    setUserType(newUserType);
    setValue('userType', newUserType);
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
          <p className="text-white/90 text-lg">Join the Community!</p>
        </div>

        {/* SignUp Form Card */}
        <NeuDescriptionBox>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="neu-input pl-12 w-full"
                {...register('displayName')}
                onChange={handleInputChange}
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>

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

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="neu-input pl-12 pr-12 w-full"
                {...register('confirmPassword')}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* User Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Account Type
              </label>
              <NeuSwitch
                checked={userType === UserType.BUSINESS_OWNER}
                onCheckedChange={handleUserTypeChange}
                label={userType === UserType.BUSINESS_OWNER ? 'Business Owner' : 'Customer'}
              />
              <p className="text-xs text-gray-500">
                {userType === UserType.BUSINESS_OWNER 
                  ? 'I want to list products/services and manage a business'
                  : 'I want to browse and purchase products/services'
                }
              </p>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className="mt-1"
              />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
            )}

            {/* Sign Up Button */}
            <NeuButton
              type="submit"
              className="w-full h-12"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </NeuButton>

            {/* Login Link */}
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </NeuDescriptionBox>
      </div>
    </div>
  );
}
