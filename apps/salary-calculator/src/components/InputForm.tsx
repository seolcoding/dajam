import { useSalaryStore } from '@/hooks/useSalaryStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  NumberInput,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@mini-apps/ui';
import { Calculator, Info } from 'lucide-react';

export function InputForm() {
  const {
    inputMode,
    annualSalary,
    monthlyGross,
    taxFreeAmount,
    dependents,
    children,
    includeRetirement,
    setInputMode,
    setAnnualSalary,
    setMonthlyGross,
    setTaxFreeAmount,
    setDependents,
    setChildren,
    setIncludeRetirement,
    calculate,
  } = useSalaryStore();

  const handleCalculate = () => {
    calculate();
  };

  return (
    <Card className="shadow-lg shadow-blue-500/5 border-blue-100 sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          급여 실수령액 계산기
        </CardTitle>
        <CardDescription className="text-slate-500">
          연봉 또는 월급여를 입력하면 4대보험 및 세금 공제 후 실수령액을 계산합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-7">
        {/* 입력 모드 전환 */}
        <div className="space-y-2">
          <Label>입력 방식</Label>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'annual' | 'monthly')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="annual">연봉</TabsTrigger>
              <TabsTrigger value="monthly">월급</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 연봉 입력 */}
        {inputMode === 'annual' && (
          <div className="space-y-2">
            <Label htmlFor="annualSalary">연봉 (원)</Label>
            <NumberInput
              id="annualSalary"
              value={annualSalary ? Number(annualSalary.replace(/,/g, '')) : undefined}
              onChange={(v) => setAnnualSalary(v?.toString() || '')}
              placeholder="예: 50,000,000"
            />
          </div>
        )}

        {/* 월급 입력 */}
        {inputMode === 'monthly' && (
          <div className="space-y-2">
            <Label htmlFor="monthlyGross">월 급여 (원)</Label>
            <NumberInput
              id="monthlyGross"
              value={monthlyGross ? Number(monthlyGross.replace(/,/g, '')) : undefined}
              onChange={(v) => setMonthlyGross(v?.toString() || '')}
              placeholder="예: 4,000,000"
            />
          </div>
        )}

        {/* 퇴직금 포함 여부 */}
        {inputMode === 'annual' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="includeRetirement">퇴직금 포함</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>연봉에 퇴직금이 포함된 경우 13개월로 나눕니다</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="includeRetirement"
              checked={includeRetirement}
              onCheckedChange={setIncludeRetirement}
            />
          </div>
        )}

        {/* 비과세액 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="taxFreeAmount">비과세액 (원)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>식대 20만원이 일반적입니다</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <NumberInput
            id="taxFreeAmount"
            value={taxFreeAmount}
            onChange={(v) => setTaxFreeAmount(v || 0)}
            placeholder="200,000"
          />
        </div>

        {/* 부양가족 수 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="dependents">부양가족 수 (본인 포함)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>본인을 포함한 부양가족 수를 입력하세요</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <NumberInput
            id="dependents"
            value={dependents}
            onChange={(v) => setDependents(v || 1)}
            placeholder="1"
          />
        </div>

        {/* 자녀 수 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="children">자녀 수 (8세~20세)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>8세 이상 20세 이하 자녀에 대한 세액공제가 적용됩니다</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <NumberInput
            id="children"
            value={children}
            onChange={(v) => setChildren(v || 0)}
            placeholder="0"
          />
        </div>

        {/* 계산 버튼 */}
        <Button
          className="w-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
          onClick={handleCalculate}
          disabled={
            (inputMode === 'annual' && !annualSalary) ||
            (inputMode === 'monthly' && !monthlyGross)
          }
        >
          <Calculator className="w-5 h-5 mr-2" />
          <span className="font-semibold">실수령액 계산하기</span>
        </Button>
      </CardContent>
    </Card>
  );
}
