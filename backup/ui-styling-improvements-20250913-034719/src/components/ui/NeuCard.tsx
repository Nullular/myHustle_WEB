import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pressed' | 'animated';
  hover?: boolean;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'pressed':
        return 'neu-card-pressed';
      case 'animated':
        return 'neu-animated-card';
      default:
        return 'neu-card';
    }
  };

  return (
    <div
      className={cn(
        getVariantClasses(),
        hover && variant === 'default' && 'hover:transform hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
};
