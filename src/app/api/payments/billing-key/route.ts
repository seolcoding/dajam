/**
 * Billing Key API Route
 *
 * Exchanges auth key for billing key and activates subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmBillingKey, mockConfirmBillingKey, MOCK_MODE } from '@/lib/toss/server';

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

    const body = await request.json();
    const { authKey, customerKey } = body;

    if (!authKey || !customerKey) {
      return NextResponse.json(
        { error: 'Missing required fields: authKey, customerKey' },
        { status: 400 }
      );
    }

    // Confirm billing key with Toss
    const billingData = MOCK_MODE
      ? await mockConfirmBillingKey({ authKey, customerKey })
      : await confirmBillingKey({ authKey, customerKey });

    // Update subscription with billing key
    const { data: subscription, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        toss_billing_key: billingData.billingKey,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('toss_customer_key', customerKey)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      subscription,
      cardNumber: billingData.cardNumber,
      message: 'Billing key registered successfully',
    });
  } catch (error) {
    console.error('Failed to confirm billing key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm billing key' },
      { status: 500 }
    );
  }
}
