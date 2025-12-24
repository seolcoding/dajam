/**
 * Subscription Settings Page
 *
 * Shows current plan, upgrade options, and subscription management
 */

import { Metadata } from 'next';
import { SubscriptionPageClient } from './SubscriptionPageClient';

export const metadata: Metadata = {
  title: '구독 관리 | 다잼',
  description: '구독 플랜 관리 및 업그레이드',
};

export default function SubscriptionPage() {
  return <SubscriptionPageClient />;
}
