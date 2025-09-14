import React from 'react';
import { cn } from '@/lib/utils';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'hover' | 'icon';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  variant = 'default',
  children,
  className,
  isLoading,
  disabled,
  ...props
}) => {
  const baseClasses = variant === 'hover' ? 'neu-hover-button' : 'neu-button';
  
  return (
    <button
      className={cn(
        baseClasses,
        isLoading && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
