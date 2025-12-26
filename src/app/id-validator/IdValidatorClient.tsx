'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RRNValidator } from './components/RRNValidator';
import { BRNValidator } from './components/BRNValidator';
import { CRNValidator } from './components/CRNValidator';
import { AppHeader, AppFooter } from '@/components/layout';
import { Shield, Building2, Building } from 'lucide-react';

export function IdValidatorClient() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        title="신분증 번호 검증기"
        description="주민등록번호, 사업자등록번호, 법인등록번호의 유효성을 검증합니다"
        icon={Shield}
        iconGradient="from-slate-600 to-slate-800"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        {/* Notice Banner */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500 inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            개발 및 테스트 목적 전용 - 모든 처리는 브라우저에서만 수행됩니다
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rrn" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rrn" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              주민등록번호
            </TabsTrigger>
            <TabsTrigger value="brn" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              사업자등록번호
            </TabsTrigger>
            <TabsTrigger value="crn" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              법인등록번호
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rrn">
            <RRNValidator />
          </TabsContent>

          <TabsContent value="brn">
            <BRNValidator />
          </TabsContent>

          <TabsContent value="crn">
            <CRNValidator />
          </TabsContent>
        </Tabs>
      </div>

      <AppFooter
        disclaimer="이 도구는 교육 및 개발 테스트 목적으로만 사용하세요. 실제 진위확인은 국세청, 대법원 등 공식 기관 API를 사용하세요."
      />
    </div>
  );
}
