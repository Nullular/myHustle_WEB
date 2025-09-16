import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Review, 
  CreateReviewRequest, 
  ReviewTargetType, 
  ReviewStats,
  ModerationStatus 
} from '@/types/Review';

/**
 * Service for managing reviews in Firebase
 * Based on the Android ReviewRepository implementation
 */
export class ReviewService {
  private static instance: ReviewService | null = null;
  private reviewsCollection = collection(db, 'reviews');

  static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  /**
   * Create a new review
   */
  async createReview(customerId: string, reviewData: CreateReviewRequest): Promise<string> {
    try {
      const review: Omit<Review, 'id'> = {
        customerId,
        shopId: reviewData.shopId,
        targetType: reviewData.targetType,
        targetId: reviewData.targetId,
        targetName: reviewData.targetName,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        detailedRatings: {
          quality: reviewData.detailedRatings?.quality || 0,
          communication: reviewData.detailedRatings?.communication || 0,
          timeliness: reviewData.detailedRatings?.timeliness || 0,
          value: reviewData.detailedRatings?.value || 0,
          professionalism: reviewData.detailedRatings?.professionalism || 0,
        },
        imageUrls: reviewData.imageUrls || [],
        videoUrls: reviewData.videoUrls || [],
        orderId: reviewData.orderId || '',
        bookingId: reviewData.bookingId || '',
        verifiedPurchase: reviewData.verifiedPurchase || false,
        ownerResponse: null,
        helpfulVotes: 0,
        unhelpfulVotes: 0,
        votedBy: [],
        visible: true,
        flagged: false,
        moderationStatus: ModerationStatus.APPROVED,
        moderationNotes: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(this.reviewsCollection, review);
      
      // Update the document with its own ID
      await updateDoc(docRef, { id: docRef.id });
      
      // TODO: Update target rating (shop/product/service)
      await this.updateTargetRating(reviewData.targetType, reviewData.targetId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific target (shop, product, or service)
   * Temporary simplified query to avoid index requirement
   */
  async getReviewsForTarget(
    targetType: ReviewTargetType, 
    targetId: string, 
    limitCount: number = 10
  ): Promise<Review[]> {
    try {
      // Simplified query - only filter by targetId to avoid composite index requirement
      const q = query(
        this.reviewsCollection,
        where('targetId', '==', targetId),
        limit(50) // Get more to filter in memory
      );

      const snapshot = await getDocs(q);
      
      const allReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Sort reviews and return them (all reviews are now public)
      const sortedReviews = allReviews
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, limitCount);

      return sortedReviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Get reviews by a specific customer
   * Simplified query to avoid composite index requirement
   */
  async getReviewsByCustomer(customerId: string): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where('customerId', '==', customerId),
        limit(100) // Get more to sort in memory
      );

      const snapshot = await getDocs(q);
      
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Sort by createdAt in memory
      return reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      throw error;
    }
  }

  /**
   * Get review statistics for a target
   */
  async getReviewStats(targetType: ReviewTargetType, targetId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getReviewsForTarget(targetType, targetId, 1000); // Get all reviews for stats
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          detailedAverages: {
            quality: 0,
            communication: 0,
            timeliness: 0,
            value: 0,
            professionalism: 0,
          },
        };
      }

      const totalReviews = reviews.length;
      const sumRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = sumRating / totalReviews;

      // Rating distribution
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        const roundedRating = Math.round(review.rating) as keyof typeof ratingDistribution;
        if (roundedRating >= 1 && roundedRating <= 5) {
          ratingDistribution[roundedRating]++;
        }
      });

      // Detailed averages
      const detailedSums = {
        quality: 0,
        communication: 0,
        timeliness: 0,
        value: 0,
        professionalism: 0,
      };

      reviews.forEach(review => {
        detailedSums.quality += review.detailedRatings.quality;
        detailedSums.communication += review.detailedRatings.communication;
        detailedSums.timeliness += review.detailedRatings.timeliness;
        detailedSums.value += review.detailedRatings.value;
        detailedSums.professionalism += review.detailedRatings.professionalism;
      });

      const detailedAverages = {
        quality: detailedSums.quality / totalReviews,
        communication: detailedSums.communication / totalReviews,
        timeliness: detailedSums.timeliness / totalReviews,
        value: detailedSums.value / totalReviews,
        professionalism: detailedSums.professionalism / totalReviews,
      };

      return {
        averageRating,
        totalReviews,
        ratingDistribution,
        detailedAverages,
      };
    } catch (error) {
      console.error('Error calculating review stats:', error);
      throw error;
    }
  }

  /**
   * Add owner response to a review
   */
  async addOwnerResponse(reviewId: string, ownerId: string, response: string): Promise<void> {
    try {
      const reviewDoc = doc(this.reviewsCollection, reviewId);
      await updateDoc(reviewDoc, {
        ownerResponse: {
          content: response,
          respondedAt: Date.now(),
          ownerId: ownerId,
        },
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error adding owner response:', error);
      throw error;
    }
  }

  /**
   * Vote on review helpfulness
   */
  async voteOnReview(reviewId: string, userId: string, isHelpful: boolean): Promise<void> {
    try {
      const reviewDoc = doc(this.reviewsCollection, reviewId);
      // Note: This is a simplified version. In production, you'd want to handle
      // the vote logic more carefully to prevent double voting
      const updateData = isHelpful 
        ? { helpfulVotes: 1 } 
        : { unhelpfulVotes: 1 };
      
      await updateDoc(reviewDoc, updateData);
    } catch (error) {
      console.error('Error voting on review:', error);
      throw error;
    }
  }

  /**
   * Update target rating (to be called after review creation/update)
   * This should update the shop/product/service rating and totalReviews count
   */
  private async updateTargetRating(targetType: ReviewTargetType, targetId: string): Promise<void> {
    try {
      const stats = await this.getReviewStats(targetType, targetId);
      
      // Update the target document with new rating and review count
      let targetCollection: string;
      switch (targetType) {
        case ReviewTargetType.SHOP:
          targetCollection = 'shops';
          break;
        case ReviewTargetType.PRODUCT:
          targetCollection = 'products';
          break;
        case ReviewTargetType.SERVICE:
          targetCollection = 'services';
          break;
        default:
          throw new Error(`Unknown target type: ${targetType}`);
      }

      const targetDoc = doc(db, targetCollection, targetId);
      await updateDoc(targetDoc, {
        rating: stats.averageRating,
        totalReviews: stats.totalReviews,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating target rating:', error);
      // Don't throw here to prevent review creation from failing if rating update fails
    }
  }
}

export default ReviewService.getInstance();