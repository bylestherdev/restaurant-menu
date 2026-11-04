'use client';

import { CartProvider } from '@/context/CartContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { RecommendationsProvider } from '@/context/RecommendationsContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ProfileProvider>
        <RecommendationsProvider>
          {children}
        </RecommendationsProvider>
      </ProfileProvider>
    </CartProvider>
  );
}