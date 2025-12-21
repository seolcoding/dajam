import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { DeductionBreakdown } from './components/DeductionBreakdown';
import { DeductionChart } from './components/DeductionChart';
import { SalarySimulator } from './components/SalarySimulator';
import { TooltipProvider } from '@mini-apps/ui';
import { Calculator } from 'lucide-react';

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">급여 실수령액 계산기</h1>
                <p className="text-sm text-slate-600 mt-1">
                  연봉 협상 시 얼마를 받게 될까요?
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
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

        {/* Footer */}
        <footer className="border-t bg-slate-50 mt-20">
          <div className="container mx-auto px-6 py-8 text-center">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                2025년 기준 4대보험료율 및 간이세액표 적용
              </p>
              <p className="text-sm text-slate-500">
                실제 급여명세서와 차이가 있을 수 있으며, 참고용으로만 사용하시기 바랍니다.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default App;
