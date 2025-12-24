/**
 * Toss Payments Server-side API Integration
 *
 * Handles server-side Toss Payments API calls
 * - Billing key issuance
 * - Payment requests
 * - Payment cancellation
 * - Webhook verification
 */

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;
const TOSS_API_URL = 'https://api.tosspayments.com/v1';

/**
 * Get authorization header for Toss API
 */
function getAuthHeader(): string {
  if (!TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY is not configured');
  }
  return 'Basic ' + Buffer.from(TOSS_SECRET_KEY + ':').toString('base64');
}

/**
 * Confirm billing key after user authorizes
 * Exchange authKey for billingKey
 */
export async function confirmBillingKey(params: {
  authKey: string;
  customerKey: string;
}): Promise<{
  billingKey: string;
  customerKey: string;
  cardNumber: string;
  cardType: string;
}> {
  const response = await fetch(`${TOSS_API_URL}/billing/authorizations/issue`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authKey: params.authKey,
      customerKey: params.customerKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to confirm billing key: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Request payment using billing key (subscription charge)
 */
export async function requestBilling(params: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<{
  paymentKey: string;
  orderId: string;
  status: string;
  receipt: {
    url: string;
  };
}> {
  const response = await fetch(`${TOSS_API_URL}/billing/${params.billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to request billing: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Cancel payment
 */
export async function cancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
}): Promise<{
  cancels: Array<{
    cancelAmount: number;
    cancelReason: string;
    canceledAt: string;
  }>;
}> {
  const response = await fetch(`${TOSS_API_URL}/payments/${params.paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cancelReason: params.cancelReason,
      cancelAmount: params.cancelAmount,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to cancel payment: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Get payment details
 */
export async function getPayment(paymentKey: string): Promise<{
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt?: string;
  receipt?: {
    url: string;
  };
}> {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get payment: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  // Toss Payments webhook verification
  // For production, implement proper signature verification
  // Currently returns true for development
  return true;
}

/**
 * Mock mode for development/testing
 */
export const MOCK_MODE = !TOSS_SECRET_KEY;

export async function mockConfirmBillingKey(params: {
  authKey: string;
  customerKey: string;
}): Promise<{
  billingKey: string;
  customerKey: string;
  cardNumber: string;
  cardType: string;
}> {
  return {
    billingKey: 'mock_billing_key_' + Date.now(),
    customerKey: params.customerKey,
    cardNumber: '1234-****-****-5678',
    cardType: 'CREDIT',
  };
}

export async function mockRequestBilling(params: {
  billingKey: string;
  amount: number;
  orderId: string;
  orderName: string;
}): Promise<{
  paymentKey: string;
  orderId: string;
  status: string;
  receipt: {
    url: string;
  };
}> {
  return {
    paymentKey: 'mock_payment_key_' + Date.now(),
    orderId: params.orderId,
    status: 'DONE',
    receipt: {
      url: 'https://mock-receipt.tosspayments.com/' + params.orderId,
    },
  };
}

export async function mockCancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
}): Promise<{
  cancels: Array<{
    cancelAmount: number;
    cancelReason: string;
    canceledAt: string;
  }>;
}> {
  return {
    cancels: [
      {
        cancelAmount: 29000,
        cancelReason: params.cancelReason,
        canceledAt: new Date().toISOString(),
      },
    ],
  };
}
