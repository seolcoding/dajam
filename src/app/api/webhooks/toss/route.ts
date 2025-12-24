/**
 * Toss Payments Webhook Handler
 *
 * Handles payment success/failure events from Toss
 * Updates subscription and payment history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/toss/server';

// Use service role key for webhook (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing for webhook');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get webhook signature for verification
    const signature = request.headers.get('toss-signature') || '';
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.eventType) {
      case 'PAYMENT_STATUS_CHANGED':
        await handlePaymentStatusChanged(supabase, event);
        break;

      case 'SUBSCRIPTION_STATUS_CHANGED':
        await handleSubscriptionStatusChanged(supabase, event);
        break;

      default:
        console.log('Unhandled webhook event type:', event.eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentStatusChanged(supabase: any, event: any) {
  const { paymentKey, orderId, status } = event.data;

  // Find subscription by billing key or customer key
  const { data: paymentHistory } = await supabase
    .from('payment_history')
    .select('*, subscriptions(*)')
    .eq('toss_payment_key', paymentKey)
    .single();

  if (!paymentHistory) {
    console.error('Payment history not found for payment key:', paymentKey);
    return;
  }

  // Update payment status
  const paymentStatus = status === 'DONE' ? 'succeeded' : status === 'CANCELED' ? 'refunded' : 'failed';

  await supabase
    .from('payment_history')
    .update({ status: paymentStatus })
    .eq('toss_payment_key', paymentKey);

  // If payment failed, update subscription status
  if (status === 'CANCELED' || status === 'FAILED') {
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentHistory.subscription_id);
  }
}

async function handleSubscriptionStatusChanged(supabase: any, event: any) {
  const { customerKey, status } = event.data;

  // Find subscription by customer key
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('toss_customer_key', customerKey)
    .single();

  if (!subscription) {
    console.error('Subscription not found for customer key:', customerKey);
    return;
  }

  // Update subscription status
  const subscriptionStatus = status === 'ACTIVE' ? 'active' : status === 'CANCELED' ? 'cancelled' : 'expired';

  await supabase
    .from('subscriptions')
    .update({
      status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('toss_customer_key', customerKey);
}
