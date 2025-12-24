/**
 * Toss Payments Client-side Integration
 *
 * Handles browser-side Toss Payments SDK initialization
 * Used for billing key registration flow
 */

import { loadTossPayments } from '@tosspayments/payment-sdk';

// Toss Payments SDK returns this type
type TossPaymentsInstance = Awaited<ReturnType<typeof loadTossPayments>>;

let tossPaymentsInstance: TossPaymentsInstance | null = null;

/**
 * Get Toss Payments instance (singleton pattern)
 */
export async function getTossPayments(): Promise<TossPaymentsInstance> {
  if (tossPaymentsInstance) {
    return tossPaymentsInstance;
  }

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error('Toss Payments client key is not configured. Please set NEXT_PUBLIC_TOSS_CLIENT_KEY environment variable.');
  }

  tossPaymentsInstance = await loadTossPayments(clientKey);
  return tossPaymentsInstance;
}

/**
 * Request billing key from Toss Payments
 * Opens Toss payment widget for user to register their card
 *
 * Uses SDK v2 API: tossPayments.payment({ customerKey }).requestBillingAuth()
 */
export async function requestBillingAuth(params: {
  customerKey: string;
  customerName: string;
  customerEmail?: string;
  successUrl: string;
  failUrl: string;
}) {
  const tossPayments = await getTossPayments();

  // SDK v2: Use payment instance with customerKey
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payment = (tossPayments as any).payment({ customerKey: params.customerKey });

  return payment.requestBillingAuth('CARD', {
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    successUrl: params.successUrl,
    failUrl: params.failUrl,
  });
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Mock mode for development/testing when Toss keys aren't configured
 */
export const MOCK_MODE = !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export function getMockBillingAuth() {
  if (!MOCK_MODE) {
    throw new Error('Mock mode is only available when Toss client key is not configured');
  }

  return {
    authKey: 'mock_auth_key_' + Date.now(),
    customerKey: 'mock_customer_' + Date.now(),
  };
}
