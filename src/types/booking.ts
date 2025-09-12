export interface TimeSlot {
  time: string;
  time24: string;
  isAvailable: boolean;
  price?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelectable: boolean;
  isBlocked: boolean;
  isStartOfRange: boolean;
  isEndOfRange: boolean;
  isInRange: boolean;
}

export interface BookingService {
  id: string;
  name: string;
  allowsMultiDayBooking?: boolean;
  price?: string;
  duration?: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id?: string;
  customerId: string;
  shopId: string;
  serviceId: string;
  serviceName: string;
  shopName: string;
  shopOwnerId: string;
  customerName: string;
  customerEmail: string;
  requestedDate: string;
  requestedTime: string;
  status: BookingStatus;
  notes: string;
  responseMessage?: string;
  createdAt: number;
  updatedAt: number;
}

import { Service } from '@/types/models';

export interface BookingScreenProps {
  shopId: string;
  serviceId: string;
  serviceName: string;
  shopName: string;
  shopOwnerId: string;
  shopOpenTime: string;
  shopCloseTime: string;
  service?: Service;
  onBack: () => void;
  onSave: (timestamp: number) => void;
  onLoginClick?: () => void;
}