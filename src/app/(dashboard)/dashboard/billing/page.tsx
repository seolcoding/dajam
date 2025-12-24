/**
 * Billing History Page
 *
 * Shows payment history and invoices
 */

import { Metadata } from 'next';
import { BillingPageClient } from './BillingPageClient';

export const metadata: Metadata = {
  title: '결제 내역 - SeolCoding',
  description: '결제 내역 및 영수증 관리',
};

export default function BillingPage() {
  return <BillingPageClient />;
}
