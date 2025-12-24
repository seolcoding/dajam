/**
 * UpgradePrompt Component
 *
 * Banner/modal prompting upgrade to Pro
 * Shows blocked feature and Pro benefits
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLAN_DETAILS } from '@/types/subscription';
import { Crown, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  feature: string;
  variant?: 'banner' | 'modal';
  isOpen?: boolean;
  onClose?: () => void;
}

export function UpgradePrompt({ feature, variant = 'banner', isOpen = true, onClose }: UpgradePromptProps) {
  if (variant === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Pro 업그레이드가 필요합니다
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold">{feature}</span> 기능은 Pro 플랜에서 사용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Pro로 더 많은 기능을</h4>
                  <p className="text-sm text-purple-700">
                    월 {new Intl.NumberFormat('ko-KR').format(PLAN_DETAILS.pro.price)}원으로 모든 제한 없이 사용하세요
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-gray-700">
                {PLAN_DETAILS.pro.features.slice(0, 4).map((feat, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    {feat}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                나중에
              </Button>
              <Link href="/dashboard/settings/subscription" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Crown className="w-4 h-4 mr-2" />
                  업그레이드
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <h3 className="font-semibold">Pro 업그레이드가 필요합니다</h3>
          </div>
          <p className="text-sm text-white/90">
            <span className="font-semibold">{feature}</span> 기능은 Pro 플랜에서만 사용할 수 있습니다.
          </p>
        </div>

        <Link href="/dashboard/settings/subscription">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-purple-600 hover:bg-white/90"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            업그레이드
          </Button>
        </Link>
      </div>
    </Card>
  );
}
