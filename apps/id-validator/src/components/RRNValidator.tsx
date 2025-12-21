import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@mini-apps/ui';
import { CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { validateRRN, type RRNValidationResult } from '../lib/validators/rrn';
import { generateTestRRN } from '../lib/generators/rrnGenerator';
import { formatRRN } from '../lib/utils/formatters';

export function RRNValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<RRNValidationResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRRN(e.target.value);
    setInput(formatted);

    // 실시간 검증 (13자리 입력 시)
    const numbers = formatted.replace(/[^0-9]/g, '');
    if (numbers.length === 13) {
      setResult(validateRRN(formatted));
    } else {
      setResult(null);
    }
  };

  const handleValidate = () => {
    const validationResult = validateRRN(input);
    setResult(validationResult);
  };

  const handleGenerate = () => {
    const testNumber = generateTestRRN();
    const formatted = formatRRN(testNumber);
    setInput(formatted);
    setResult(validateRRN(formatted));
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-gray-900">주민등록번호 검증</CardTitle>
          <CardDescription className="text-gray-600">
            주민등록번호의 유효성을 체크섬 알고리즘으로 검증합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label htmlFor="rrn-input" className="text-sm font-medium text-gray-700">주민등록번호</Label>
            <Input
              id="rrn-input"
              placeholder="000000-0000000"
              value={input}
              onChange={handleInputChange}
              maxLength={14}
              className="font-mono text-lg h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              13자리 숫자를 입력하세요 (하이픈은 자동 삽입됩니다)
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
                            <span className="text-gray-600 text-xs">생년월일</span>
                            <p className="font-mono font-medium text-gray-900 mt-1">{result.details.birthDate}</p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 text-xs">나이</span>
                            <p className="font-medium text-gray-900 mt-1">{result.details.age}세</p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 text-xs">성별</span>
                            <p className="font-medium text-gray-900 mt-1">
                              {result.details.gender === 'male' ? '남성' : '여성'}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <span className="text-gray-600 text-xs">구분</span>
                            <p className="font-medium text-gray-900 mt-1">
                              {result.details.isKorean ? '내국인' : '외국인'}
                            </p>
                          </div>
                        </div>

                        {result.details.checksumPassed === undefined && (
                          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900 leading-relaxed">
                              2020년 10월 이후 발급된 주민등록번호는 뒷자리가 임의번호로 변경되어
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
              <p className="font-semibold text-gray-900">개인정보 보호 안내</p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>실제 타인의 주민등록번호를 입력하지 마세요.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>모든 검증은 브라우저에서만 처리되며 서버로 전송되지 않습니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-1.5"></span>
                  <span>생성된 테스트 번호는 유효한 형식이지만 실제 등록된 번호가 아닙니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
