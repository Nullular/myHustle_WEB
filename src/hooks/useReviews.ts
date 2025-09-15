'use client';

import { useState, useEffect } from 'react';
import { Review, ReviewTargetType, ReviewStats, CreateReviewRequest } from '@/types/Review';
import ReviewService from '@/services/ReviewService';
import { useAuthStore } from '@/lib/store/auth';

export function useReviews(targetType: ReviewTargetType, targetId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

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
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: CreateReviewRequest): Promise<void> => {
    if (!user?.id) {
      throw new Error('User must be logged in to create a review');
    }

    try {
      await ReviewService.createReview(user.id, reviewData);
      // Reload reviews after creating a new one
      await loadReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  };

  const voteOnReview = async (reviewId: string, isHelpful: boolean): Promise<void> => {
    if (!user?.id) {
      throw new Error('User must be logged in to vote on reviews');
    }

    try {
      await ReviewService.voteOnReview(reviewId, user.id, isHelpful);
      // Reload reviews to get updated vote counts
      await loadReviews();
    } catch (error) {
      console.error('Error voting on review:', error);
      throw error;
    }
  };

  const addOwnerResponse = async (reviewId: string, response: string): Promise<void> => {
    if (!user?.id) {
      throw new Error('User must be logged in to respond to reviews');
    }

    try {
      await ReviewService.addOwnerResponse(reviewId, user.id, response);
      // Reload reviews to show the new response
      await loadReviews();
    } catch (error) {
      console.error('Error adding owner response:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (targetId && targetType) {
      loadReviews();
    }
  }, [targetId, targetType]);

  return {
    reviews,
    stats,
    loading,
    error,
    createReview,
    voteOnReview,
    addOwnerResponse,
    refetch: loadReviews,
  };
}