/**
 * PlanBadge Component
 *
 * Displays a small badge showing the current plan
 * Used in headers, user menus, etc.
 */

import { Badge } from '@/components/ui/badge';
import { PlanType } from '@/types/subscription';
import { Crown } from 'lucide-react';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (plan === 'free') {
    return (
      <Badge variant="secondary" className={className}>
        무료
      </Badge>
    );
  }

  return (
    <Badge
      variant="default"
      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white ${className}`}
    >
      <Crown className="w-3 h-3 mr-1" />
      Pro
    </Badge>
  );
}
