/**
 * Review types based on the Android app and Firebase schema
 */

export interface DetailedRatings {
  quality: number;
  communication: number;
  timeliness: number;
  value: number;
  professionalism: number;
}

export interface OwnerResponse {
  content: string;
  respondedAt: number;
  ownerId: string;
}

export enum ReviewTargetType {
  SHOP = 'SHOP',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Review {
  id: string;
  customerId: string;
  shopId: string;
  
  // Review Target
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  
  // Review Content
  rating: number;
  title: string;
  content: string;
  
  // Detailed Ratings
  detailedRatings: DetailedRatings;
  
  // Media
  imageUrls: string[];
  videoUrls: string[];
  
  // Context
  orderId: string;
  bookingId: string;
  verifiedPurchase: boolean;
  
  // Owner Response
  ownerResponse: OwnerResponse | null;
  
  // Helpfulness
  helpfulVotes: number;
  unhelpfulVotes: number;
  votedBy: string[];
  
  // Moderation
  visible: boolean;
  flagged: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

export interface CreateReviewRequest {
  shopId: string;
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;
  rating: number;
  title: string;
  content: string;
  detailedRatings?: Partial<DetailedRatings>;
  imageUrls?: string[];
  videoUrls?: string[];
  orderId?: string;
  bookingId?: string;
  verifiedPurchase?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  detailedAverages: DetailedRatings;
}