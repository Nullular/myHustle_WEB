'use client';

import React from 'react';
import { Review } from '@/types/Review';
import { StarRating } from '@/components/ui/StarRating';
import { NeuCard } from '@/components/ui/NeuCard';
import { formatDistanceToNow } from 'date-fns';
import { User, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReportReview?: (reviewId: string) => void;
  showOwnerResponse?: boolean;
  className?: string;
}

export function ReviewCard({ 
  review, 
  onVoteHelpful, 
  onReportReview, 
  showOwnerResponse = true,
  className = '' 
}: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });

  const handleVote = (isHelpful: boolean) => {
    if (onVoteHelpful) {
      onVoteHelpful(review.id, isHelpful);
    }
  };

  return (
    <NeuCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={20} className="text-gray-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} size={16} />
              <span className="text-sm text-gray-500">{timeAgo}</span>
            </div>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Review Content */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}
      
      <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

      {/* Detailed Ratings */}
      {(review.detailedRatings.quality > 0 || 
        review.detailedRatings.communication > 0 || 
        review.detailedRatings.timeliness > 0 || 
        review.detailedRatings.value > 0 || 
        review.detailedRatings.professionalism > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Detailed Ratings</h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {review.detailedRatings.quality > 0 && (
              <div>
                <span className="text-gray-600">Quality</span>
                <StarRating rating={review.detailedRatings.quality} size={12} />
              </div>
            )}
            {review.detailedRatings.communication > 0 && (
              <div>
                <span className="text-gray-600">Communication</span>
                <StarRating rating={review.detailedRatings.communication} size={12} />
              </div>
            )}
            {review.detailedRatings.timeliness > 0 && (
              <div>
                <span className="text-gray-600">Timeliness</span>
                <StarRating rating={review.detailedRatings.timeliness} size={12} />
              </div>
            )}
            {review.detailedRatings.value > 0 && (
              <div>
                <span className="text-gray-600">Value</span>
                <StarRating rating={review.detailedRatings.value} size={12} />
              </div>
            )}
            {review.detailedRatings.professionalism > 0 && (
              <div>
                <span className="text-gray-600">Professionalism</span>
                <StarRating rating={review.detailedRatings.professionalism} size={12} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      {review.imageUrls.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {review.imageUrls.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Owner Response */}
      {showOwnerResponse && review.ownerResponse && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Owner Response</span>
            <span className="text-xs text-blue-600">
              {formatDistanceToNow(new Date(review.ownerResponse.respondedAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-blue-800 text-sm">{review.ownerResponse.content}</p>
        </div>
      )}

      {/* Helpfulness Voting */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Was this helpful?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote(true)}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            >
              <ThumbsUp size={14} />
              <span>Yes</span>
              {review.helpfulVotes > 0 && <span>({review.helpfulVotes})</span>}
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <ThumbsDown size={14} />
              <span>No</span>
              {review.unhelpfulVotes > 0 && <span>({review.unhelpfulVotes})</span>}
            </button>
          </div>
        </div>
        
        {onReportReview && (
          <button
            onClick={() => onReportReview(review.id)}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Report
          </button>
        )}
      </div>
    </NeuCard>
  );
}