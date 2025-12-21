// ============================================
// Session Types
// ============================================
export interface OrderSession {
  id: string;
  restaurantName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline?: Date;
  createdAt: Date;
  hostName: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
}

// ============================================
// Order Types
// ============================================
export interface Order {
  id: string;
  sessionId: string;
  participantName: string;
  items: OrderItem[];
  specialRequest?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  menuId?: string; // 고정 메뉴 모드에서만
  menuName: string;
  price: number;
  quantity: number;
  options?: string[];
}

// ============================================
// Summary Types
// ============================================
export interface OrderSummary {
  restaurantName: string;
  totalAmount: number;
  perPersonAmount: number;
  participantCount: number;
  menuSummary: MenuSummaryItem[];
  orders: Order[];
  generatedAt: Date;
}

export interface MenuSummaryItem {
  menuName: string;
  totalQuantity: number;
  unitPrice: number;
  subtotal: number;
  orderedBy: string[];
}

export interface ParticipantBill {
  participantName: string;
  items: OrderItem[];
  totalAmount: number;
  isPaid?: boolean;
}

export interface OrderStats {
  totalAmount: number;
  averageAmount: number;
  maxAmount: number;
  minAmount: number;
  participantCount: number;
  totalItems: number;
  mostPopularMenu: string;
}

// ============================================
// BroadcastChannel Messages
// ============================================
export type BroadcastMessage =
  | { type: 'NEW_ORDER'; order: Order }
  | { type: 'UPDATE_ORDER'; order: Order }
  | { type: 'DELETE_ORDER'; orderId: string }
  | { type: 'SESSION_CLOSED'; sessionId: string }
  | { type: 'DEADLINE_UPDATED'; deadline: Date }
  | { type: 'STORAGE_CHANGED'; key: string };
