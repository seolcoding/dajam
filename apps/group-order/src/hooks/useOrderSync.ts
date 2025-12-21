import { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { Order } from '@/types';
import { OrderBroadcaster } from '@/services/OrderBroadcaster';
import { getOrders, saveOrders } from '@/services/storage';

export function useOrderSync(sessionId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const broadcasterRef = useRef<OrderBroadcaster | null>(null);

  useEffect(() => {
    // 초기 로드
    const initialOrders = getOrders(sessionId);
    setOrders(initialOrders);

    // Broadcaster 초기화
    const broadcaster = new OrderBroadcaster(sessionId);
    broadcasterRef.current = broadcaster;

    // 실시간 업데이트 리스너
    broadcaster.on('NEW_ORDER', (data: { order: Order }) => {
      setOrders(prev => [...prev, data.order]);
    });

    broadcaster.on('UPDATE_ORDER', (data: { order: Order }) => {
      setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
    });

    broadcaster.on('DELETE_ORDER', (data: { orderId: string }) => {
      setOrders(prev => prev.filter(o => o.id !== data.orderId));
    });

    broadcaster.on('STORAGE_CHANGED', () => {
      // Fallback: 전체 다시 로드
      const updatedOrders = getOrders(sessionId);
      setOrders(updatedOrders);
    });

    return () => {
      broadcaster.close();
    };
  }, [sessionId]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'submittedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: nanoid(10),
      submittedAt: new Date(),
    };

    // localStorage에 저장
    const existingOrders = getOrders(sessionId);
    existingOrders.push(newOrder);
    saveOrders(sessionId, existingOrders);

    // BroadcastChannel로 알림
    broadcasterRef.current?.broadcast({ type: 'NEW_ORDER', order: newOrder });

    // 로컬 상태 업데이트
    setOrders(prev => [...prev, newOrder]);

    return newOrder;
  }, [sessionId]);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    const existingOrders = getOrders(sessionId);
    const updatedOrders = existingOrders.map(o =>
      o.id === orderId ? { ...o, ...updates, updatedAt: new Date() } : o
    );
    saveOrders(sessionId, updatedOrders);

    const updatedOrder = updatedOrders.find(o => o.id === orderId)!;
    broadcasterRef.current?.broadcast({ type: 'UPDATE_ORDER', order: updatedOrder });

    setOrders(updatedOrders);
  }, [sessionId]);

  const deleteOrder = useCallback((orderId: string) => {
    const existingOrders = getOrders(sessionId);
    const filteredOrders = existingOrders.filter(o => o.id !== orderId);
    saveOrders(sessionId, filteredOrders);

    broadcasterRef.current?.broadcast({ type: 'DELETE_ORDER', orderId });

    setOrders(filteredOrders);
  }, [sessionId]);

  return { orders, addOrder, updateOrder, deleteOrder };
}
