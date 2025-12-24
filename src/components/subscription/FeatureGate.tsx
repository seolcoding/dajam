/**
 * FeatureGate Component
 *
 * Wrapper for Pro-only features
 * Shows upgrade prompt if user is on Free plan
 */

'use client';

import { ReactNode } from 'react';
import { UpgradePrompt } from './UpgradePrompt';
import { PlanType } from '@/types/subscription';

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  requiredPlan: PlanType;
  currentPlan: PlanType;
  variant?: 'banner' | 'modal';
  fallback?: ReactNode;
}

export function FeatureGate({
  children,
  feature,
  requiredPlan,
  currentPlan,
  variant = 'banner',
  fallback,
}: FeatureGateProps) {
  const hasAccess = currentPlan === requiredPlan || (requiredPlan === 'free' && currentPlan === 'pro');

  if (!hasAccess) {
    return fallback || <UpgradePrompt feature={feature} variant={variant} />;
  }

  return <>{children}</>;
}
