export type PlanType = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  toss_customer_key?: string;
  toss_billing_key?: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  toss_payment_key?: string;
  description: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface PlanLimits {
  maxParticipantsPerSession: number;
  maxSessionsPerMonth: number;
  availableApps: string[];
  cloudMode: boolean;
  analytics: boolean;
  customBranding: boolean;
}

export const PLAN_DETAILS: Record<PlanType, {
  name: string;
  price: number;
  limits: PlanLimits;
  features: string[];
}> = {
  free: {
    name: '무료',
    price: 0,
    limits: {
      maxParticipantsPerSession: 30,
      maxSessionsPerMonth: 10,
      availableApps: ['live-voting', 'balance-game', 'team-divider', 'random-picker', 'ladder-game'],
      cloudMode: false,
      analytics: false,
      customBranding: false,
    },
    features: [
      '세션당 최대 30명',
      '월 10개 세션',
      '5개 기본 앱',
      '로컬 모드',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29000,
    limits: {
      maxParticipantsPerSession: Infinity,
      maxSessionsPerMonth: Infinity,
      availableApps: [], // All apps
      cloudMode: true,
      analytics: true,
      customBranding: true,
    },
    features: [
      '무제한 참여자',
      '무제한 세션',
      '전체 21개 앱',
      '클라우드 실시간 동기화',
      '상세 분석 리포트',
      '브랜딩 커스터마이징',
      '우선 지원',
    ],
  },
};

/**
 * Format Korean Won amount
 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

/**
 * Check if a feature is available for a plan
 */
export function isFeatureAvailable(planType: PlanType, feature: keyof PlanLimits): boolean {
  return PLAN_DETAILS[planType].limits[feature] as boolean;
}

/**
 * Get all available apps for a plan
 */
export function getAvailableApps(planType: PlanType): string[] {
  const apps = PLAN_DETAILS[planType].limits.availableApps;
  // Empty array for Pro means all apps are available
  return apps.length === 0 && planType === 'pro'
    ? ['live-voting', 'balance-game', 'team-divider', 'random-picker', 'ladder-game',
       'ideal-worldcup', 'chosung-quiz', 'bingo-game', 'group-order', 'student-network',
       'salary-calculator', 'rent-calculator', 'gpa-calculator', 'dutch-pay',
       'lunch-roulette', 'id-validator', 'realtime-quiz', 'this-or-that', 'word-cloud',
       'personality-test', 'human-bingo']
    : apps;
}
