# Next.js Migration Plan

## 현재 상태 분석

### 기술 스택
- **Framework**: React 19 + Vite 7
- **상태관리**: Zustand
- **스타일링**: Tailwind CSS 4
- **UI 라이브러리**: @mini-apps/ui (Radix UI 기반)
- **차트**: Recharts
- **아이콘**: Lucide React
- **패키지 매니저**: pnpm (workspace)

### 앱 목록 (16개)
| 앱 | 설명 | 복잡도 |
|---|---|---|
| salary-calculator | 급여 실수령액 계산기 | 중 |
| chosung-quiz | 초성 퀴즈 게임 | 중 |
| ladder-game | 사다리 게임 | 고 (Canvas) |
| balance-game | 밸런스 게임 | 중 |
| bingo-game | 빙고 게임 | 중 |
| dutch-pay | 더치페이 계산기 | 중 |
| gpa-calculator | 학점 계산기 | 저 |
| ideal-worldcup | 이상형 월드컵 | 중 |
| live-voting | 실시간 투표 | 중 |
| random-picker | 랜덤 뽑기 | 저 |
| group-order | 단체 주문 | 고 (실시간) |
| id-validator | 신분증 검증기 | 저 |
| lunch-roulette | 점심 룰렛 | 중 (위치API) |
| rent-calculator | 전월세 계산기 | 중 |
| student-network | 수강생 네트워킹 | 중 |
| team-divider | 팀 나누기 | 저 |

### 공유 패키지
```
packages/
└── ui/          # @mini-apps/ui - Radix UI 기반 컴포넌트
    ├── Button, Card, Input, Select, Tabs 등
    └── Tailwind config 공유
```

---

## 마이그레이션 전략 옵션

### Option A: 통합 Next.js App (추천)

모든 미니앱을 하나의 Next.js 앱으로 통합

```
seolcoding-apps/
├── app/
│   ├── layout.tsx              # 공통 레이아웃
│   ├── page.tsx                # 갤러리 페이지 (/)
│   ├── salary-calculator/
│   │   └── page.tsx
│   ├── chosung-quiz/
│   │   └── page.tsx
│   └── ... (16개 앱)
├── components/
│   ├── ui/                     # 기존 @mini-apps/ui 이동
│   └── shared/                 # 공통 컴포넌트
├── lib/
│   └── utils.ts
└── package.json
```

**장점**
- 단일 빌드, 단일 배포
- 코드 공유 용이
- SEO, 메타데이터 관리 통합
- Vercel 최적화 활용

**단점**
- 앱 간 의존성 결합
- 빌드 시간 증가

---

### Option B: Turborepo + Next.js (개별 앱)

각 앱을 독립적인 Next.js 앱으로 유지

```
seolcoding-apps/
├── apps/
│   ├── salary-calculator/      # Next.js app
│   ├── chosung-quiz/           # Next.js app
│   └── ...
├── packages/
│   ├── ui/                     # 공유 UI
│   ├── config/                 # 공유 설정
│   └── tsconfig/               # 공유 TS 설정
├── turbo.json
└── package.json
```

**장점**
- 독립적 배포 가능
- 앱별 최적화
- 기존 구조 유지

**단점**
- 설정 복잡도 증가
- 중복 코드 가능성

---

### Option C: 하이브리드 (점진적 마이그레이션)

핵심 앱만 Next.js로 마이그레이션, 나머지는 Vite 유지

```
seolcoding-apps/
├── apps/
│   ├── main/                   # Next.js (갤러리 + 주요 앱)
│   │   └── app/
│   │       ├── salary-calculator/
│   │       └── rent-calculator/
│   ├── chosung-quiz/           # Vite 유지
│   └── ladder-game/            # Vite 유지
└── packages/
    └── ui/
```

**장점**
- 점진적 전환
- 리스크 분산

**단점**
- 혼합 스택 관리
- 장기적 유지보수 부담

---

## 추천: Option A (통합 Next.js App)

### 이유
1. **16개 앱 모두 클라이언트 사이드** - SSR 불필요, CSR로 충분
2. **공유 UI 활용 극대화** - 컴포넌트 중복 제거
3. **단일 배포** - Vercel에서 최적화된 배포
4. **SEO 통합** - 갤러리 페이지 SEO + 메타데이터 관리
5. **유지보수 단순화** - 하나의 Next.js 프로젝트

---

## 상세 마이그레이션 계획

### Phase 1: 프로젝트 초기 설정 (1일)

```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# 2. 기존 의존성 설치
pnpm add zustand recharts lucide-react number-precision
pnpm add @radix-ui/react-* class-variance-authority clsx tailwind-merge
```

**디렉토리 구조**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # 앱 갤러리
│   └── globals.css
├── components/
│   ├── ui/                   # Radix UI 컴포넌트
│   └── gallery/              # 갤러리 컴포넌트
├── lib/
│   └── utils.ts
└── styles/
```

### Phase 2: UI 패키지 마이그레이션 (1일)

```
packages/ui/src/ → src/components/ui/
```

- Button, Card, Input 등 모든 컴포넌트 이동
- import 경로 `@/components/ui`로 통일
- Tailwind 설정 통합

### Phase 3: 앱별 마이그레이션 (4일)

각 앱을 `src/app/[앱이름]/` 라우트로 변환

**마이그레이션 순서 (복잡도 순)**
1. **Day 1**: 단순 앱 (4개)
   - gpa-calculator
   - id-validator
   - random-picker
   - team-divider

2. **Day 2**: 중간 복잡도 (6개)
   - salary-calculator
   - rent-calculator
   - dutch-pay
   - balance-game
   - student-network
   - bingo-game

3. **Day 3**: 중간+ 복잡도 (4개)
   - chosung-quiz
   - ideal-worldcup
   - live-voting
   - lunch-roulette

4. **Day 4**: 고복잡도 (2개)
   - ladder-game (Canvas 렌더링)
   - group-order (실시간 기능)

**앱 마이그레이션 체크리스트**
```
□ 라우트 폴더 생성 (app/[앱이름]/)
□ page.tsx 생성 ('use client' 추가)
□ components/ 폴더 복사
□ hooks/, utils/, types/ 복사
□ import 경로 수정 (@/components/ui 등)
□ 상태관리 코드 확인 (Zustand)
□ 스타일 확인 (Tailwind)
□ 기능 테스트
```

### Phase 4: 갤러리 페이지 구현 (0.5일)

```tsx
// src/app/page.tsx
export default function GalleryPage() {
  const apps = [
    { name: '급여 계산기', path: '/salary-calculator', icon: '💰' },
    { name: '초성 퀴즈', path: '/chosung-quiz', icon: '🎯' },
    // ...
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {apps.map(app => (
        <AppCard key={app.path} {...app} />
      ))}
    </div>
  );
}
```

### Phase 5: 최적화 및 배포 (0.5일)

1. **메타데이터 설정**
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: 'SeolCoding Apps',
  description: '유용한 미니 앱 모음',
};
```

2. **Vercel 배포 설정**
```json
// vercel.json
{
  "framework": "nextjs"
}
```

3. **도메인 연결**
   - apps.seolcoding.com → Vercel

---

## 파일 변환 예시

### Before (Vite)
```tsx
// apps/salary-calculator/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### After (Next.js)
```tsx
// src/app/salary-calculator/page.tsx
'use client';

import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
// ... 나머지 imports

export default function SalaryCalculatorPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* 기존 App.tsx 내용 */}
      </div>
    </TooltipProvider>
  );
}
```

---

## 예상 일정

| Phase | 작업 | 예상 시간 |
|-------|------|----------|
| 1 | 프로젝트 초기 설정 | 2시간 |
| 2 | UI 패키지 마이그레이션 | 3시간 |
| 3 | 앱 마이그레이션 (16개) | 8시간 |
| 4 | 갤러리 페이지 | 1시간 |
| 5 | 최적화 및 배포 | 2시간 |
| **총** | | **~16시간** |

---

## 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| Canvas 앱 (ladder-game) 호환성 | useEffect + ref 패턴 유지 |
| Zustand 상태관리 | Next.js에서 동일하게 작동 |
| 위치 API (lunch-roulette) | 클라이언트 컴포넌트에서 처리 |
| 실시간 기능 (group-order) | 클라이언트 사이드 유지 |

---

## 결정 필요 사항

1. **마이그레이션 전략 선택**: Option A / B / C
2. **일정**: 전체 마이그레이션 vs 점진적 전환
3. **도메인 구조**:
   - `apps.seolcoding.com/salary-calculator` (서브디렉토리)
   - `salary-calculator.seolcoding.com` (서브도메인)
