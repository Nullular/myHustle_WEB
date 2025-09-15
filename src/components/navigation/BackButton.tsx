'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { NeuButton } from '@/components/ui';
import { getBackPath } from '@/lib/navigation';

interface BackButtonProps {
  /** Override the default back path */
  customBackPath?: string;
  /** Show text alongside the icon */
  showText?: boolean;
  /** Custom text to display */
  text?: string;
  /** Additional className */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'hover' | 'icon';
}

export function BackButton({ 
  customBackPath, 
  showText = true, 
  text = 'Back',
  className = '',
  variant = 'default'
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    const backPath = customBackPath || getBackPath(pathname);
    
    if (backPath) {
      router.push(backPath);
    } else {
      // Fallback to main screen if no structured path is found
      router.push('/');
    }
  };

  return (
    <NeuButton
      variant={variant}
      onClick={handleBack}
      className={`flex items-center space-x-2 ${className}`}
    >
      <ArrowLeft size={20} />
      {showText && (
        <span className="hidden sm:block">{text}</span>
      )}
    </NeuButton>
  );
}

interface HeaderBackButtonProps extends BackButtonProps {
  title: string;
  subtitle?: string;
}

/**
 * Complete header with back button and title - commonly used pattern
 */
export function HeaderWithBack({ 
  title, 
  subtitle, 
  customBackPath,
  className = '',
}: HeaderBackButtonProps) {
  return (
    <header className={`bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          <BackButton customBackPath={customBackPath} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 text-sm hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}