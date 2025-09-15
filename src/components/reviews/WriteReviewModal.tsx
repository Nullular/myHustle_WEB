'use client';

import React, { useState } from 'react';
import { CreateReviewRequest, ReviewTargetType, DetailedRatings } from '@/types/Review';
import { StarRating } from '@/components/ui/StarRating';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import { X, Star, Camera } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  shopId: string;
  onSubmit: (review: CreateReviewRequest) => Promise<void>;
  className?: string;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  shopId,
  onSubmit,
  className = ''
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [detailedRatings, setDetailedRatings] = useState<Partial<DetailedRatings>>({});
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (content.trim().length < 10) {
      alert('Please write at least 10 characters in your review');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData: CreateReviewRequest = {
        shopId,
        targetType,
        targetId,
        targetName,
        rating,
        title: title.trim(),
        content: content.trim(),
        detailedRatings,
        imageUrls: images,
        verifiedPurchase: false, // TODO: Check if this is a verified purchase
      };
      
      await onSubmit(reviewData);
      
      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setDetailedRatings({});
      setImages([]);
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedRatingChange = (category: keyof DetailedRatings, value: number) => {
    setDetailedRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
        <NeuCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Star size={24} />
              <span>Write a Review</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close review modal"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Target Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              <span className="font-medium">Reviewing:</span> {targetName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size={32}
                className="mb-2"
              />
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Detailed Ratings for Services */}
            {targetType === ReviewTargetType.SERVICE && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <StarRating
                    rating={detailedRatings.quality || 0}
                    interactive
                    onRatingChange={(value) => handleDetailedRatingChange('quality', value)}
                    size={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication
                  </label>
                  <StarRating
                    rating={detailedRatings.communication || 0}
                    interactive
                    onRatingChange={(value) => handleDetailedRatingChange('communication', value)}
                    size={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeliness
                  </label>
                  <StarRating
                    rating={detailedRatings.timeliness || 0}
                    interactive
                    onRatingChange={(value) => handleDetailedRatingChange('timeliness', value)}
                    size={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value for Money
                  </label>
                  <StarRating
                    rating={detailedRatings.value || 0}
                    interactive
                    onRatingChange={(value) => handleDetailedRatingChange('value', value)}
                    size={20}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professionalism
                  </label>
                  <StarRating
                    rating={detailedRatings.professionalism || 0}
                    interactive
                    onRatingChange={(value) => handleDetailedRatingChange('professionalism', value)}
                    size={20}
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Summarize your experience..."
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell others about your experience..."
                required
                minLength={10}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/1000 characters (minimum 10)
              </p>
            </div>

            {/* Photo Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Photo upload feature coming soon
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <NeuButton
                type="submit"
                disabled={rating === 0 || content.trim().length < 10 || isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    <span>Submit Review</span>
                  </>
                )}
              </NeuButton>
            </div>
          </form>
        </NeuCard>
      </div>
    </div>
  );
}