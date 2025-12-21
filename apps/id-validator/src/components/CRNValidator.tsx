import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@mini-apps/ui';
import { CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { validateCRN, type CRNValidationResult } from '../lib/validators/crn';
import { generateTestCRN } from '../lib/generators/crnGenerator';
import { formatCRN } from '../lib/utils/formatters';

export function CRNValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CRNValidationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCRN(e.target.value);
    setInput(formatted);

    // 실시간 검증 (13자리 입력 시)
    const numbers = formatted.replace(/[^0-9]/g, '');
    if (numbers.length === 13 || numbers.length === 14) {
      setResult(validateCRN(formatted));
    } else {
      setResult(null);
    }
  };

  const handleValidate = () => {
    const validationResult = validateCRN(input);
    setResult(validationResult);
  };

  const handleGenerate = () => {
    const testNumber = generateTestCRN();
    const formatted = formatCRN(testNumber);
    setInput(formatted);
    setResult(validateCRN(formatted));
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-gray-900">법인등록번호 검증</CardTitle>
          <CardDescription className="text-gray-600">
            법인등록번호의 유효성을 체크섬 알고리즘으로 검증합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="crn-input" className="text-sm font-medium text-gray-700">법인등록번호</Label>
            <Input
              id="crn-input"
              placeholder="000000-0000000"
              value={input}
              onChange={handleInputChange}
              maxLength={14}
              className="font-mono text-lg h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              13자리 또는 14자리 숫자를 입력하세요 (하이픈은 자동 삽입됩니다)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleValidate}
              disabled={input.length < 14}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              검증하기
            </Button>
            <Button variant="outline" onClick={handleGenerate} className="border-gray-300 hover:bg-gray-50">
              <Sparkles className="w-4 h-4 mr-2" />
              테스트 번호 생성
            </Button>
            <Button variant="ghost" onClick={handleClear} className="hover:bg-gray-100">
              초기화
            </Button>
          </div>

          {result && (
            <div className={`border-2 rounded-lg ${result.isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${result.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                    {result.isValid ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className={`text-base font-semibold ${result.isValid ? 'text-green-900' : 'text-red-900'}`}>
                      {result.message}
                    </p>

                    {result.details && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 text-xs">등기관서 코드</span>
                            <p className="font-mono font-medium text-gray-900 mt-1">
                              {result.details.registryCode}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 text-xs">법인 종류 코드</span>
                            <p className="font-mono font-medium text-gray-900 mt-1">
                              {result.details.corporateTypeCode}
                            </p>
                          </div>
                        </div>

                        {result.details.checksumPassed === undefined && (
                          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                              2025년 1월 31일 이후 발급된 법인등록번호는 14자리로 변경되어
                              체크섬 검증이 적용되지 않습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Info className="w-4 h-4 text-gray-600 flex-shrink-0" />
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">안내사항</p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>법인등록번호는 공개 정보이지만, 형식 검증만 가능합니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>실제 진위확인은 대법원 등기소 API를 사용하세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>생성된 테스트 번호는 실제 등록된 번호가 아니며 법적 효력이 없습니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
