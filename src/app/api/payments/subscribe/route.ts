/**
 * Subscribe API Route
 *
 * Initiates subscription payment and updates subscription status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestBilling, mockRequestBilling, MOCK_MODE } from '@/lib/toss/server';
import { PLAN_DETAILS } from '@/types/subscription';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!subscription.toss_billing_key || !subscription.toss_customer_key) {
      return NextResponse.json(
        { error: 'Billing key not registered' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `order_${nanoid(16)}`;
    const amount = PLAN_DETAILS.pro.price;

    // Get user profile for email/name
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, email')
      .eq('id', user.id)
      .single();

    // Request billing from Toss
    const paymentData = MOCK_MODE
      ? await mockRequestBilling({
          billingKey: subscription.toss_billing_key,
          amount,
          orderId,
          orderName: 'SeolCoding Pro 구독',
        })
      : await requestBilling({
          billingKey: subscription.toss_billing_key,
          customerKey: subscription.toss_customer_key,
          amount,
          orderId,
          orderName: 'SeolCoding Pro 구독',
          customerEmail: profile?.email || user.email,
          customerName: profile?.nickname || '회원',
        });

    // Calculate period
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Update subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: 'pro',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Create payment history record
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        subscription_id: subscription.id,
        user_id: user.id,
        amount,
        currency: 'KRW',
        status: 'succeeded',
        toss_payment_key: paymentData.paymentKey,
        description: 'Pro 구독 결제',
        receipt_url: paymentData.receipt?.url || null,
      });

    if (historyError) {
      console.error('Failed to create payment history:', historyError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentKey: paymentData.paymentKey,
      receiptUrl: paymentData.receipt?.url,
      message: 'Subscription activated successfully',
    });
  } catch (error) {
    console.error('Failed to process subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
