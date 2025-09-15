'use client';

import React, { useState, useEffect } from 'react';
import { Review, ReviewTargetType, ReviewStats } from '@/types/Review';
import { ReviewCard } from './ReviewCard';
import { RatingDisplay } from '@/components/ui/StarRating';
import { NeuCard } from '@/components/ui/NeuCard';
import { NeuButton } from '@/components/ui/NeuButton';
import ReviewService from '@/services/ReviewService';
import { Star, MessageSquare, ChevronDown } from 'lucide-react';

interface ReviewsListProps {
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  shopId: string;
  showWriteReview?: boolean;
  onWriteReview?: () => void;
  className?: string;
}

export function ReviewsList({
  targetType,
  targetId,
  targetName,
  shopId,
  showWriteReview = false,
  onWriteReview,
  className = ''
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  useEffect(() => {
    loadReviews();
  }, [targetId, targetType]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reviewsData, statsData] = await Promise.all([
        ReviewService.getReviewsForTarget(targetType, targetId),
        ReviewService.getReviewStats(targetType, targetId)
      ]);

      setReviews(reviewsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      // TODO: Get current user ID from auth context
      const userId = 'current-user-id'; // Replace with actual user ID
      await ReviewService.voteOnReview(reviewId, userId, isHelpful);
      // Reload reviews to get updated vote counts
      loadReviews();
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  const handleReportReview = async (reviewId: string) => {
    // TODO: Implement review reporting
    console.log('Report review:', reviewId);
  };

  if (loading) {
    return (
      <NeuCard className={`p-8 text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </NeuCard>
    );
  }

  if (error) {
    return (
      <NeuCard className={`p-8 text-center ${className}`}>
        <p className="text-red-600">{error}</p>
        <NeuButton 
          onClick={loadReviews} 
          className="mt-4"
        >
          Try Again
        </NeuButton>
      </NeuCard>
    );
  }

  return (
    <div className={className}>
      {/* Reviews Summary */}
      <NeuCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <MessageSquare size={24} />
            <span>Customer Reviews</span>
          </h3>
          {showWriteReview && (
            <NeuButton
              onClick={onWriteReview}
              variant="default"
              className="flex items-center space-x-2"
            >
              <Star size={16} />
              <span>Write Review</span>
            </NeuButton>
          )}
        </div>

        {stats && stats.totalReviews > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div>
              <RatingDisplay 
                rating={stats.averageRating} 
                totalReviews={stats.totalReviews}
                size="lg"
                className="mb-4"
              />
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{star} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full rating-bar"
                        style={
                          {
                            '--rating-width': `${stats.totalReviews > 0 ? (stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 : 0}%`
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <span className="w-8 text-gray-600">
                      {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Ratings */}
            {(stats.detailedAverages.quality > 0 || 
              stats.detailedAverages.communication > 0 || 
              stats.detailedAverages.timeliness > 0 || 
              stats.detailedAverages.value > 0 || 
              stats.detailedAverages.professionalism > 0) && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Detailed Ratings</h4>
                <div className="space-y-2">
                  {stats.detailedAverages.quality > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality</span>
                      <RatingDisplay 
                        rating={stats.detailedAverages.quality} 
                        showCount={false}
                        size="sm"
                      />
                    </div>
                  )}
                  {stats.detailedAverages.communication > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Communication</span>
                      <RatingDisplay 
                        rating={stats.detailedAverages.communication} 
                        showCount={false}
                        size="sm"
                      />
                    </div>
                  )}
                  {stats.detailedAverages.timeliness > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Timeliness</span>
                      <RatingDisplay 
                        rating={stats.detailedAverages.timeliness} 
                        showCount={false}
                        size="sm"
                      />
                    </div>
                  )}
                  {stats.detailedAverages.value > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <RatingDisplay 
                        rating={stats.detailedAverages.value} 
                        showCount={false}
                        size="sm"
                      />
                    </div>
                  )}
                  {stats.detailedAverages.professionalism > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Professionalism</span>
                      <RatingDisplay 
                        rating={stats.detailedAverages.professionalism} 
                        showCount={false}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No reviews yet</h4>
            <p className="text-gray-500">Be the first to share your experience!</p>
          </div>
        )}
      </NeuCard>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {displayedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onVoteHelpful={handleVoteHelpful}
              onReportReview={handleReportReview}
            />
          ))}

          {/* Show More/Less Button */}
          {reviews.length > 3 && (
            <div className="text-center">
              <NeuButton
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="flex items-center space-x-2"
              >
                <span>
                  {showAllReviews 
                    ? `Show Less` 
                    : `Show All ${reviews.length} Reviews`
                  }
                </span>
                <ChevronDown 
                  size={16} 
                  className={`transform transition-transform ${
                    showAllReviews ? 'rotate-180' : ''
                  }`} 
                />
              </NeuButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}