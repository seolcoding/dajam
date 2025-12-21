import { useMemo } from 'react';
import type { Order, OrderSummary } from '@/types';
import { generateOrderSummary } from '@/services/orderService';
import { getSession } from '@/services/storage';

export function useOrderSummary(sessionId: string, orders: Order[]): OrderSummary {
  return useMemo(() => {
    const session = getSession(sessionId);
    if (!session) {
      return {
        restaurantName: '',
        totalAmount: 0,
        perPersonAmount: 0,
        participantCount: 0,
        menuSummary: [],
        orders: [],
        generatedAt: new Date(),
      };
    }

    return generateOrderSummary(sessionId);
  }, [sessionId, orders]);
}
