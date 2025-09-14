'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatScreen from '@/components/ChatScreen';
import { useAuthStore } from '@/lib/store/auth';
import { messagingRepository } from '@/lib/firebase/repositories/messagingRepository';
import { Conversation } from '@/types/messaging';
import { Loader } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchConversation = async () => {
      try {
        setLoading(true);
        const conv = await messagingRepository.getConversation(conversationId);
        if (conv) {
          setConversation(conv);
        } else {
          setError('Conversation not found.');
        }
      } catch (err) {
        setError('Failed to load chat.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin" /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!conversation || !user) {
    return <div className="flex items-center justify-center h-screen">Preparing chat...</div>;
  }

  const otherParticipantId = conversation.participants.find(p => p !== user.id) || user.id;
  const otherParticipantInfo = conversation.participantInfo[otherParticipantId];
  
  // JUST SHOW THE DAMN EMAIL - NO MORE COMPLEX LOGIC
  let otherParticipantName = 'Unknown User';
  
  if (user.id === otherParticipantId) {
    // Self conversation - show your own email
    otherParticipantName = user.email || 'Your Email';
  } else if (otherParticipantInfo && otherParticipantInfo.email) {
    // Other participant - show their email
    otherParticipantName = otherParticipantInfo.email;
  } else {
    // Fallback - try to get email from user data directly
    otherParticipantName = user.email || 'Unknown User';
  }

  // DEBUG: Log everything so we can see what's happening
  console.log('🔍 CHAT DEBUG:', {
    otherParticipantId,
    'otherParticipantInfo.email': otherParticipantInfo?.email,
    'otherParticipantInfo.displayName': otherParticipantInfo?.displayName,
    'otherParticipantInfo (full)': otherParticipantInfo,
    'user.id': user.id,
    'user.email': user.email,
    'Final otherParticipantName': otherParticipantName,
    'conversation.participants': conversation.participants,
    'All participantInfo': conversation.participantInfo
  });

  const businessContext = conversation.shopId ? {
    shopId: conversation.shopId,
    shopName: conversation.title || '', // Assuming shop name might be in title
  } : undefined;

  return (
    <ChatScreen
      conversationId={conversationId}
      otherParticipantId={otherParticipantId}
      otherParticipantName={otherParticipantName}
      businessContext={businessContext}
    />
  );
}