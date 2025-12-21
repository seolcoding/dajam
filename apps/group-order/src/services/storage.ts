import type { OrderSession, Order } from '@/types';

// ============================================
// localStorage Keys
// ============================================
export const STORAGE_KEYS = {
  SESSION: (id: string) => `session:${id}`,
  ORDERS: (sessionId: string) => `orders:${sessionId}`,
  MY_ORDER: (sessionId: string, participantName: string) =>
    `myorder:${sessionId}:${participantName}`,
  SESSION_LIST: 'session:list',
} as const;

// ============================================
// Session Storage
// ============================================
export function saveSession(session: OrderSession): void {
  localStorage.setItem(STORAGE_KEYS.SESSION(session.id), JSON.stringify(session));

  // Add to session list
  const sessionList = getSessionList();
  if (!sessionList.includes(session.id)) {
    sessionList.push(session.id);
    localStorage.setItem(STORAGE_KEYS.SESSION_LIST, JSON.stringify(sessionList));
  }
}

export function getSession(sessionId: string): OrderSession | null {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION(sessionId));
  if (!data) return null;

  const session = JSON.parse(data);
  // Convert date strings back to Date objects
  session.createdAt = new Date(session.createdAt);
  if (session.deadline) session.deadline = new Date(session.deadline);

  return session;
}

export function updateSession(sessionId: string, updates: Partial<OrderSession>): void {
  const session = getSession(sessionId);
  if (!session) return;

  const updatedSession = { ...session, ...updates };
  saveSession(updatedSession);
}

export function getSessionList(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION_LIST);
  return data ? JSON.parse(data) : [];
}

// ============================================
// Orders Storage
// ============================================
export function saveOrders(sessionId: string, orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS(sessionId), JSON.stringify(orders));
}

export function getOrders(sessionId: string): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS(sessionId));
  if (!data) return [];

  const orders = JSON.parse(data);
  // Convert date strings back to Date objects
  return orders.map((order: Order) => ({
    ...order,
    submittedAt: new Date(order.submittedAt),
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
  }));
}

export function addOrder(sessionId: string, order: Order): void {
  const orders = getOrders(sessionId);
  orders.push(order);
  saveOrders(sessionId, orders);
}

export function updateOrder(sessionId: string, orderId: string, updates: Partial<Order>): void {
  const orders = getOrders(sessionId);
  const updatedOrders = orders.map(o =>
    o.id === orderId ? { ...o, ...updates, updatedAt: new Date() } : o
  );
  saveOrders(sessionId, updatedOrders);
}

export function deleteOrder(sessionId: string, orderId: string): void {
  const orders = getOrders(sessionId);
  const filteredOrders = orders.filter(o => o.id !== orderId);
  saveOrders(sessionId, filteredOrders);
}

// ============================================
// Cleanup
// ============================================
export function clearAllSessions(): void {
  const sessionList = getSessionList();
  sessionList.forEach(sessionId => {
    localStorage.removeItem(STORAGE_KEYS.SESSION(sessionId));
    localStorage.removeItem(STORAGE_KEYS.ORDERS(sessionId));
  });
  localStorage.removeItem(STORAGE_KEYS.SESSION_LIST);
}
