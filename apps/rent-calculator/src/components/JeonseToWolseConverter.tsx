/**
 * 전세 → 월세 변환 컴포넌트
 */

import { Card, CardHeader, CardTitle, CardContent, Label, Slider, NumberInput } from '@mini-apps/ui';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { jeonseToWolse } from '../lib/rentCalculator';
import { CurrencyDisplay } from './CurrencyDisplay';
import { InfoTooltip } from './InfoTooltip';

export function JeonseToWolseConverter() {
  const {
    jeonse,
    depositForWolse,
    conversionRateJeonse,
    setJeonse,
    setDepositForWolse,
    setConversionRateJeonse,
  } = useCalculatorStore();

  let monthlyRent = 0;
  let error = '';

  try {
    monthlyRent = jeonseToWolse(jeonse, depositForWolse, conversionRateJeonse);
  } catch (e) {
    error = e instanceof Error ? e.message : '계산 오류';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 입력 영역 */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-semibold text-gray-900">입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          <div>
            <Label htmlFor="jeonse">전세금</Label>
            <NumberInput
              id="jeonse"
              value={jeonse}
              onChange={(value) => setJeonse(value || 0)}
              min={0}
              suffix="원"
            />
          </div>

          <div>
            <Label htmlFor="deposit-wolse">월세 보증금</Label>
            <NumberInput
              id="deposit-wolse"
              value={depositForWolse}
              onChange={(value) => setDepositForWolse(value || 0)}
              min={0}
              suffix="원"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="conversion-rate-jeonse">전월세 전환율</Label>
              <InfoTooltip content="법정 상한은 기준금리 + 2% (현재 약 4.5%)" />
            </div>
            <div className="space-y-2">
              <Slider
                id="conversion-rate-jeonse"
                value={[conversionRateJeonse]}
                onValueChange={([value]) => setConversionRateJeonse(value)}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0.1%</span>
                <span className="font-semibold">{conversionRateJeonse.toFixed(1)}%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 영역 */}
      <Card className="border-blue-200 shadow-sm bg-white">
        <CardHeader className="border-b border-blue-100 bg-blue-50">
          <CardTitle className="text-lg font-semibold text-gray-900">결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">월세</p>
                <CurrencyDisplay
                  value={monthlyRent}
                  className="text-3xl font-bold text-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">계산 공식</p>
                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>월세 = (전세금 - 보증금) × 전환율 ÷ 12</p>
                  <p>
                    = ({jeonse.toLocaleString()} - {depositForWolse.toLocaleString()})
                    × {conversionRateJeonse}% ÷ 12
                  </p>
                  <p className="font-semibold text-gray-900">
                    = <CurrencyDisplay value={monthlyRent} />
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">보증금 + 월세</p>
                <p className="text-lg font-semibold text-gray-900">
                  <CurrencyDisplay value={depositForWolse} /> + <CurrencyDisplay value={monthlyRent} />
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
