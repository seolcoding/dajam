import type { Metadata } from "next";
import { Suspense } from "react";
import UnifiedPickerApp from "./UnifiedPickerApp";

export const metadata: Metadata = {
  title: "랜덤 뽑기 | 룰렛, 점심 메뉴, 사다리 타기",
  description: "공정하고 재미있는 랜덤 선택 도구. 룰렛 뽑기, 점심 메뉴 추천, 사다리 타기를 한 곳에서 즐기세요. 암호학적으로 안전한 랜덤 알고리즘으로 완전한 공정성을 보장합니다.",
  keywords: [
    "랜덤 뽑기", "룰렛", "추첨", "랜덤 선택", "공정한 추첨", "무작위 선택",
    "점심 메뉴", "맛집 추천", "사다리 타기", "사다리 게임"
  ],
  openGraph: {
    title: "랜덤 뽑기 | 룰렛, 점심, 사다리",
    description: "공정하고 재미있는 랜덤 선택 도구 - 룰렛, 점심 메뉴, 사다리 타기",
    type: "website",
  },
};

export default function RandomPickerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnifiedPickerApp />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
