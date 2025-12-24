/**
 * usePlanLimits Hook
 *
 * Get current plan limits and check feature availability
 * Check usage against limits
 */

'use client';

import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { PLAN_DETAILS, PlanLimits, isFeatureAvailable, getAvailableApps } from '@/types/subscription';

interface UsePlanLimitsReturn {
  limits: PlanLimits;
  isPro: boolean;
  isFree: boolean;
  hasFeature: (feature: keyof PlanLimits) => boolean;
  canUseApp: (appName: string) => boolean;
  maxParticipants: number;
  maxSessions: number;
  hasCloudMode: boolean;
  hasAnalytics: boolean;
  hasCustomBranding: boolean;
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const { plan, isLoading } = useSubscription();

  const limits = useMemo(() => {
    return PLAN_DETAILS[plan].limits;
  }, [plan]);

  const isPro = plan === 'pro';
  const isFree = plan === 'free';

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    return isFeatureAvailable(plan, feature);
  };

  const canUseApp = (appName: string): boolean => {
    const availableApps = getAvailableApps(plan);
    return availableApps.includes(appName);
  };

  return {
    limits,
    isPro,
    isFree,
    hasFeature,
    canUseApp,
    maxParticipants: limits.maxParticipantsPerSession,
    maxSessions: limits.maxSessionsPerMonth,
    hasCloudMode: limits.cloudMode,
    hasAnalytics: limits.analytics,
    hasCustomBranding: limits.customBranding,
  };
}
