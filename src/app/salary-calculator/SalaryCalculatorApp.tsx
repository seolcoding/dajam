'use client';

import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { DeductionBreakdown } from './components/DeductionBreakdown';
import { DeductionChart } from './components/DeductionChart';
import { SalarySimulator } from './components/SalarySimulator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppHeader, AppFooter } from '@/components/layout';
import { Calculator } from 'lucide-react';

export function SalaryCalculatorApp() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <AppHeader
          title="급여 실수령액 계산기"
          description="연봉 협상 시 얼마를 받게 될까요?"
          icon={Calculator}
          iconGradient="from-blue-500 to-indigo-600"
        />

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-1">
              <InputForm />
            </div>

            {/* Middle Column: Results */}
            <div className="lg:col-span-1 space-y-8">
              <ResultCard />
              <DeductionBreakdown />
            </div>

            {/* Right Column: Charts */}
            <div className="lg:col-span-1 space-y-8">
              <DeductionChart />
            </div>
          </div>

          {/* Full Width: Simulator */}
          <div className="mt-12">
            <SalarySimulator />
          </div>
        </main>

        <AppFooter
          disclaimer="2025년 기준 4대보험료율 및 간이세액표 적용. 실제 급여명세서와 차이가 있을 수 있으며, 참고용으로만 사용하시기 바랍니다."
          className="mt-20"
        />
      </div>
    </TooltipProvider>
  );
}
