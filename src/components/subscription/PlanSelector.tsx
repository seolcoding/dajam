/**
 * PlanSelector Component
 *
 * Shows Free vs Pro plan comparison
 * Allows users to select a plan for upgrade/downgrade
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_DETAILS, PlanType, formatKRW } from '@/types/subscription';
import { Check, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
  isLoading?: boolean;
}

export function PlanSelector({ currentPlan, onSelectPlan, isLoading = false }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);

  const handleSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleConfirm = () => {
    if (selectedPlan !== currentPlan) {
      onSelectPlan(selectedPlan);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card
          className={cn(
            'relative p-6 cursor-pointer transition-all',
            selectedPlan === 'free'
              ? 'border-2 border-primary shadow-lg'
              : 'border hover:border-gray-300'
          )}
          onClick={() => handleSelect('free')}
        >
          {currentPlan === 'free' && (
            <Badge className="absolute top-4 right-4" variant="secondary">
              현재 플랜
            </Badge>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{PLAN_DETAILS.free.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">{formatKRW(PLAN_DETAILS.free.price)}</span>
                <span className="text-gray-500 ml-2">/월</span>
              </div>
            </div>

            <ul className="space-y-3">
              {PLAN_DETAILS.free.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card
          className={cn(
            'relative p-6 cursor-pointer transition-all',
            'bg-gradient-to-br from-purple-50 to-pink-50',
            selectedPlan === 'pro'
              ? 'border-2 border-purple-600 shadow-xl'
              : 'border-purple-200 hover:border-purple-300'
          )}
          onClick={() => handleSelect('pro')}
        >
          {currentPlan === 'pro' && (
            <Badge
              className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              현재 플랜
            </Badge>
          )}

          <div className="absolute top-4 left-4">
            <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="w-3 h-3 mr-1" />
              추천
            </Badge>
          </div>

          <div className="space-y-4 mt-8">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold">{PLAN_DETAILS.pro.name}</h3>
              </div>
              <div className="mt-2">
                <span className="text-4xl font-bold text-purple-600">
                  {formatKRW(PLAN_DETAILS.pro.price)}
                </span>
                <span className="text-gray-500 ml-2">/월</span>
              </div>
            </div>

            <ul className="space-y-3">
              {PLAN_DETAILS.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {selectedPlan !== currentPlan && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              selectedPlan === 'pro' &&
              'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            )}
          >
            {isLoading ? (
              '처리 중...'
            ) : selectedPlan === 'pro' ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Pro로 업그레이드
              </>
            ) : (
              '무료 플랜으로 변경'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
