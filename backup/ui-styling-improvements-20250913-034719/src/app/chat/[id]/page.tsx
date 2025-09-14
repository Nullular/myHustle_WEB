'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ChatScreen from '@/components/ChatScreen';

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const conversationId = params.id as string;
  const participantId = searchParams.get('participantId') || '';
  const participantName = searchParams.get('participantName') || 'Unknown User';
  
  // Business context from URL params (optional)
  const shopId = searchParams.get('shopId');
  const shopName = searchParams.get('shopName');
  const serviceId = searchParams.get('serviceId');
  const serviceName = searchParams.get('serviceName');
  
  const businessContext = shopId && shopName ? {
    shopId,
    shopName,
    serviceId: serviceId || undefined,
    serviceName: serviceName || undefined
  } : undefined;

  return (
    <ChatScreen
      conversationId={conversationId}
      otherParticipantId={participantId}
      otherParticipantName={decodeURIComponent(participantName)}
      businessContext={businessContext}
    />
  );
}