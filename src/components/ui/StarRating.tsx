'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = 20, 
  interactive = false, 
  onRatingChange,
  className = '' 
}: StarRatingProps) {
  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= rating;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(index)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} 
              transition-transform duration-150 focus:outline-none`}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`${
                isFilled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : isHalfFilled 
                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                  : 'text-gray-300'
              } transition-colors duration-150`}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingDisplay({ 
  rating, 
  totalReviews = 0, 
  showCount = true, 
  size = 'md',
  className = '' 
}: RatingDisplayProps) {
  const sizeConfig = {
    sm: { star: 16, text: 'text-sm' },
    md: { star: 20, text: 'text-base' },
    lg: { star: 24, text: 'text-lg' },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <StarRating rating={rating} size={config.star} />
      <div className="flex items-baseline space-x-1">
        <span className={`font-semibold text-gray-800 ${config.text}`}>
          {rating.toFixed(1)}
        </span>
        {showCount && totalReviews > 0 && (
          <span className={`text-gray-500 ${config.text}`}>
            ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
}