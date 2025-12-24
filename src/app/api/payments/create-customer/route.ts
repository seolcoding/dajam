/**
 * Create Customer API Route
 *
 * Creates Toss customer key for user and stores in subscriptions table
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingSubscription?.toss_customer_key) {
      return NextResponse.json({
        customerKey: existingSubscription.toss_customer_key,
        message: 'Customer key already exists',
      });
    }

    // Generate customer key (unique identifier for Toss)
    const customerKey = `customer_${user.id}_${nanoid(10)}`;

    // Create or update subscription record
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          toss_customer_key: customerKey,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
          toss_customer_key: customerKey,
          cancel_at_period_end: false,
        });

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({
      customerKey,
      message: 'Customer key created successfully',
    });
  } catch (error) {
    console.error('Failed to create customer key:', error);
    return NextResponse.json(
      { error: 'Failed to create customer key' },
      { status: 500 }
    );
  }
}
