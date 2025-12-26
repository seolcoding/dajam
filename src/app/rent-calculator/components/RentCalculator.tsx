'use client';

/**
 * 전월세 계산기 메인 컴포넌트
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JeonseToWolseConverter } from './JeonseToWolseConverter';
import { WolseToJeonseConverter } from './WolseToJeonseConverter';
import { CostComparisonChart } from './CostComparisonChart';
import { AppHeader, AppFooter } from '@/components/layout';
import { Home, TrendingUp } from 'lucide-react';

export function RentCalculator() {
  const [activeTab, setActiveTab] = useState<'jeonse-to-wolse' | 'wolse-to-jeonse'>('jeonse-to-wolse');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title="전세/월세 계산기"
        description="전세와 월세를 비교하고, 실제 부담액을 계산하세요"
        icon={Home}
        iconGradient="from-emerald-500 to-teal-600"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-8 flex-1">

        {/* 변환 탭 */}
        <section>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white border border-gray-200">
              <TabsTrigger value="jeonse-to-wolse">전세 → 월세</TabsTrigger>
              <TabsTrigger value="wolse-to-jeonse">월세 → 전세</TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="jeonse-to-wolse">
                <JeonseToWolseConverter />
              </TabsContent>

              <TabsContent value="wolse-to-jeonse">
                <WolseToJeonseConverter />
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* 비용 비교 분석 */}
        <section className="pt-4">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">비용 비교 분석</h2>
          </div>
          <CostComparisonChart />
        </section>

      </div>

      <AppFooter
        disclaimer="본 계산기는 참고용 도구이며, 법적 구속력이 없습니다. 실제 계약 시에는 반드시 전문가(공인중개사, 변호사)와 상담하시기 바랍니다."
      />
    </div>
  );
}
