import { nanoid } from 'nanoid';
import type {
  OrderSession,
  MenuItem,
  Order,
  OrderSummary,
  MenuSummaryItem,
  ParticipantBill,
  OrderStats,
} from '@/types';
import { saveSession, getSession, getOrders, addOrder as addOrderToStorage } from './storage';

// ============================================
// Session Management
// ============================================
export function createSession(data: {
  restaurantName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline?: Date;
  hostName: string;
}): OrderSession {
  const sessionId = nanoid(10);
  const session: OrderSession = {
    id: sessionId,
    ...data,
    createdAt: new Date(),
    isActive: true,
  };

  saveSession(session);
  return session;
}

export function closeSession(sessionId: string): void {
  const session = getSession(sessionId);
  if (!session) return;

  session.isActive = false;
  saveSession(session);
}

// ============================================
// Order Submission
// ============================================
export function submitOrder(
  sessionId: string,
  orderData: Omit<Order, 'id' | 'submittedAt'>
): Order {
  const orderId = nanoid(10);
  const order: Order = {
    ...orderData,
    id: orderId,
    submittedAt: new Date(),
  };

  addOrderToStorage(sessionId, order);
  return order;
}

// ============================================
// Order Aggregation
// ============================================
export function aggregateByMenu(orders: Order[]): MenuSummaryItem[] {
  const menuMap = new Map<string, {
    quantity: number;
    subtotal: number;
    unitPrice: number;
    orderedBy: Set<string>;
  }>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.menuName;

      if (menuMap.has(key)) {
        const existing = menuMap.get(key)!;
        existing.quantity += item.quantity;
        existing.subtotal += item.price * item.quantity;
        existing.orderedBy.add(order.participantName);
      } else {
        menuMap.set(key, {
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          unitPrice: item.price,
          orderedBy: new Set([order.participantName]),
        });
      }
    });
  });

  return Array.from(menuMap.entries()).map(([menuName, data]) => ({
    menuName,
    totalQuantity: data.quantity,
    unitPrice: data.unitPrice,
    subtotal: data.subtotal,
    orderedBy: Array.from(data.orderedBy),
  }));
}

export function aggregateByParticipant(orders: Order[]): ParticipantBill[] {
  return orders.map(order => {
    const totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      participantName: order.participantName,
      items: order.items,
      totalAmount,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);
}

export function calculateStats(orders: Order[]): OrderStats {
  const participantBills = aggregateByParticipant(orders);
  const menuSummary = aggregateByMenu(orders);

  const amounts = participantBills.map(p => p.totalAmount);
  const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);

  const mostPopular = menuSummary.reduce((max, item) =>
    item.totalQuantity > max.totalQuantity ? item : max
  , menuSummary[0] || { menuName: 'N/A', totalQuantity: 0 });

  return {
    totalAmount,
    averageAmount: participantBills.length > 0 ? Math.round(totalAmount / participantBills.length) : 0,
    maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
    minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
    participantCount: participantBills.length,
    totalItems: orders.reduce((sum, o) => sum + o.items.length, 0),
    mostPopularMenu: mostPopular.menuName,
  };
}

// ============================================
// Order Summary Generation
// ============================================
export function generateOrderSummary(sessionId: string): OrderSummary {
  const session = getSession(sessionId);
  const orders = getOrders(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  const menuSummary = aggregateByMenu(orders);
  const totalAmount = menuSummary.reduce((sum, item) => sum + item.subtotal, 0);
  const participantCount = new Set(orders.map(o => o.participantName)).size;

  return {
    restaurantName: session.restaurantName,
    totalAmount,
    perPersonAmount: participantCount > 0 ? Math.ceil(totalAmount / participantCount) : 0,
    participantCount,
    menuSummary,
    orders,
    generatedAt: new Date(),
  };
}

// ============================================
// Share Text Generation
// ============================================
export function generateShareText(summary: OrderSummary): string {
  let text = `📋 ${summary.restaurantName} 단체 주문\n\n`;

  text += `👥 참여 인원: ${summary.participantCount}명\n\n`;

  text += `📝 주문 내역:\n`;
  summary.menuSummary.forEach(item => {
    text += `  • ${item.menuName} x ${item.totalQuantity}개 = ${item.subtotal.toLocaleString()}원\n`;
  });

  text += `\n💰 총 금액: ${summary.totalAmount.toLocaleString()}원\n`;
  text += `💵 1인당: ${summary.perPersonAmount.toLocaleString()}원\n\n`;

  text += `📋 개인별 주문:\n`;
  summary.orders.forEach(order => {
    const orderTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    text += `  [${order.participantName}] ${orderTotal.toLocaleString()}원\n`;
    order.items.forEach(item => {
      text += `    - ${item.menuName} x ${item.quantity}\n`;
    });
    if (order.specialRequest) {
      text += `    메모: ${order.specialRequest}\n`;
    }
  });

  return text;
}

// ============================================
// Image Export
// ============================================
export async function downloadOrderImage(elementId: string, filename: string): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ============================================
// Helper Functions
// ============================================
export function calculateIndividualBills(sessionId: string): ParticipantBill[] {
  const orders = getOrders(sessionId);
  return aggregateByParticipant(orders);
}

export function calculateEvenSplit(sessionId: string): { perPerson: number; participants: string[] } {
  const summary = generateOrderSummary(sessionId);

  return {
    perPerson: summary.perPersonAmount,
    participants: Array.from(new Set(summary.orders.map(o => o.participantName))),
  };
}

export function isSessionClosed(sessionId: string): boolean {
  const session = getSession(sessionId);
  if (!session) return true;

  if (!session.isActive) return true;

  if (session.deadline && new Date() > session.deadline) {
    return true;
  }

  return false;
}
