'use client';

import React from 'react';
import MessagingScreen from '@/components/MessagingScreen';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const router = useRouter();

  const handleStartNewChat = () => {
    router.push('/chat/new');
  };

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <MessagingScreen 
      onStartNewChat={handleStartNewChat}
      onBackClick={handleBackClick}
    />
  );
}