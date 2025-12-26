# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Dajam (다잼)

🌐 **https://dajam.seolcoding.com**

> **"침묵을 깨는 가장 안전하고 위트 있는 방법, 다잼"**
>
> **"소규모 인원이 같은 공간에서, 모바일/PC/오프라인 경험을 하나로 묶어 서로의 의견을 통합하는 앱"**

### 핵심 원칙
1. **실시간 인터랙션** - 같은 공간의 사람들이 동시에 참여
2. **디바이스 통합** - 모바일/PC/태블릿 동일 경험
3. **즉시 참여** - QR코드/6자리 코드로 회원가입 없이 참여
4. **의견 통합** - 투표, 선택, 순위를 시각적으로 집계

### 앱 우선순위 (핵심 가치 기준)
| Tier | 앱 | 이유 |
|------|-----|------|
| **🔥 Core** | live-voting, group-order, bingo-game | 실시간 멀티유저 필수 |
| **⚡ High** | balance-game, ideal-worldcup, student-network | 의견 통합 + 공유 |
| **📊 Medium** | ladder-game, team-divider, chosung-quiz | 같이하기 (오프라인) |
| **🔧 Utility** | 계산기류, dutch-pay, random-picker, lunch-roulette, id-validator | 개인 도구 |

## Project Overview

A Next.js 15 App Router monorepo containing 16 Korean mini web apps. The apps are designed for Korean users with Korean-optimized UX and Pretendard font.

## Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # ESLint

# Testing (Playwright E2E)
pnpm test             # Run all E2E tests
pnpm test:e2e         # Chromium only
pnpm test:e2e:headed  # With browser UI
pnpm test:e2e:ui      # Playwright UI mode
pnpm test:report      # View HTML report

# Specific test suites
pnpm test:scenarios     # User flow tests
pnpm test:smart         # Accessibility/responsive/performance
pnpm test:accessibility # Axe-core checks
pnpm test:responsive    # Device breakpoints
pnpm test:performance   # Core Web Vitals
```

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home (app gallery)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles + animations
│   └── [app-name]/           # 16 app routes
│       ├── page.tsx          # Server component entry
│       ├── components/       # App-specific components
│       ├── store/            # Zustand stores (if needed)
│       ├── types/            # TypeScript types
│       ├── lib/ or utils/    # App utilities
│       └── data/             # Static data/templates
├── components/
│   ├── ui/                   # shadcn/ui components (Radix-based)
│   ├── share/                # ShareButton, etc.
│   └── common/               # Shared components
├── lib/
│   └── utils.ts              # cn() helper for Tailwind
└── types/                    # Global types

e2e/                          # Playwright tests
├── fixtures/                 # Test fixtures
├── pages/                    # Page Object Models
├── scenarios/                # User flow tests
├── smart/                    # Accessibility/responsive/perf
└── utils/                    # Test utilities

packages/
├── ui/                       # @mini-apps/ui (shared UI package)
└── db/                       # @seolcoding/db (Drizzle, planned)
```

### App Pattern

Each app follows this structure:
1. `page.tsx` - Server component with metadata export
2. `*Client.tsx` or `*App.tsx` - Main client component with `"use client"`
3. `components/` - App-specific UI components
4. `store/` - Zustand store with `create()` from zustand
5. `types/` - TypeScript interfaces

### Key Dependencies

| Purpose | Library |
|---------|---------|
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v3 |
| State | Zustand 5 |
| Charts | Recharts |
| Icons | lucide-react |
| Local DB | Dexie (IndexedDB) |
| Animation | Framer Motion |
| Korean Text | es-hangul |

## UI Development

**Use shadcn/ui components** from `@/components/ui/`. Available: Button, Card, Dialog, Input, Label, Tabs, Progress, Slider, Switch, Checkbox, RadioGroup, Select, DropdownMenu, Popover, Tooltip, Toast, Avatar, Accordion, Separator, AlertDialog.

Adding new shadcn components:
```bash
pnpm dlx shadcn@latest add [component-name]
```

### Styling Patterns

```tsx
// Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```

## Environment Variables

```env
# Required for lunch-roulette (Kakao Maps)
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_api_key
```

## Testing

E2E tests use Page Object Model pattern:
- `e2e/pages/` - Page objects extending `BasePage`
- `e2e/scenarios/` - User flow specs by category
- `e2e/smart/` - Cross-cutting quality tests

Run single test file:
```bash
pnpm exec playwright test e2e/scenarios/calculator/salary-calculator.spec.ts
```

## Claude Development Rules

### UI Work

When creating or modifying UI components, use the `frontend-for-opus-4.5` skill for production-quality design patterns.

```
/frontend-for-opus-4.5
```

### App Routes

All 16 apps are at root-level routes:
- `/salary-calculator`, `/rent-calculator`, `/gpa-calculator`, `/dutch-pay`
- `/ideal-worldcup`, `/balance-game`, `/chosung-quiz`, `/ladder-game`, `/bingo-game`
- `/live-voting`, `/random-picker`, `/team-divider`, `/lunch-roulette`
- `/group-order`, `/id-validator`, `/student-network`

## App-Code-Test Quick Reference

> 전체 매핑은 `APP_INDEX.yaml` 참조

### 카테고리별 앱 찾기

| 카테고리 | 앱 | 코드 경로 | E2E 테스트 |
|---------|-----|----------|-----------|
| **Calculator** | salary-calculator | `src/app/salary-calculator/` | `e2e/scenarios/calculator/` |
| | rent-calculator | `src/app/rent-calculator/` | `e2e/scenarios/calculator/` |
| | dutch-pay | `src/app/dutch-pay/` | `e2e/scenarios/calculator/` |
| | gpa-calculator | `src/app/gpa-calculator/` | `e2e/scenarios/calculator/` |
| | id-validator | `src/app/id-validator/` | `e2e/scenarios/calculator/` |
| **Game** | balance-game | `src/app/balance-game/` | `e2e/scenarios/game/` |
| | bingo-game | `src/app/bingo-game/` | `e2e/scenarios/game/` |
| | ladder-game | `src/app/ladder-game/` | `e2e/scenarios/game/` |
| | chosung-quiz | `src/app/chosung-quiz/` | - |
| | ideal-worldcup | `src/app/ideal-worldcup/` | - |
| **Utility** | random-picker | `src/app/random-picker/` | `e2e/scenarios/utility/` |
| | team-divider | `src/app/team-divider/` | `e2e/scenarios/utility/` |
| | live-voting | `src/app/live-voting/` | `e2e/scenarios/utility/` |
| | lunch-roulette | `src/app/lunch-roulette/` | - |
| **Realtime** | audience-engage | `src/app/audience-engage/` | `e2e/scenarios/multiuser/` |
| **Social** | student-network | `src/app/student-network/` | - |

### 기능으로 앱 찾기

```yaml
실시간 동기화: live-voting, audience-engage, bingo-game
계산/정산: salary-calculator, rent-calculator, dutch-pay, gpa-calculator
랜덤 선택: random-picker, ladder-game, team-divider, lunch-roulette
QR 코드: live-voting, student-network, audience-engage
Canvas 애니메이션: random-picker, ladder-game
```

## V2 Data Architecture (2024-12-25)

### 3-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: CORE (RDB Fixed)                                  │
│  institutions → workspaces → contacts, attendance           │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: CONTENT (JSONB Flexible)                          │
│  session_elements → element_responses → element_aggregates  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: CRM (Extended Fields)                             │
│  contacts (40+ fields), course_history, interaction_logs    │
└─────────────────────────────────────────────────────────────┘
```

### Migrations Applied
- `020_core_v2_institutions_workspaces.sql` - Core layer
- `021_flexible_elements.sql` - Content layer (JSONB)
- `022_contacts_extended_fields.sql` - CRM layer

### Element Types (18+)
```typescript
type ElementType =
  | 'poll' | 'quiz' | 'word_cloud' | 'balance_game'
  | 'ladder' | 'qna' | 'survey' | 'bingo'
  | 'ideal_worldcup' | 'team_divider' | 'personality_test'
  | 'this_or_that' | 'chosung_quiz' | 'realtime_quiz'
  | 'human_bingo' | 'reaction' | 'ranking' | 'open_ended';
```

### Key Files
- `src/types/database.ts` - V2 TypeScript 타입 정의
- `docs/ARCHITECTURE_V2.md` - 아키텍처 상세 스펙
- `docs/V2_IMPLEMENTATION_TASKS.md` - 구현 태스크
- `prd/00-v2-data-architecture.md` - V2 PRD

## Related Docs

- `README.md` - Quick start and app list
- `APPS_DOCUMENTATION.md` - Full app catalog
- `APP_INDEX.yaml` - **앱-코드-테스트 매핑 인덱스** (AI 에이전트용)
- `E2E_TEST_PLAN.md` - Testing strategy
- `prd/*.md` - Product requirements for each app
- `docs/BRANDING_RESEARCH_DAJAM.md` - Dajam 브랜딩 가이드라인
- `docs/ARCHITECTURE_V2.md` - V2 아키텍처 스펙
- `docs/V2_IMPLEMENTATION_TASKS.md` - V2 구현 태스크
- `docs/FOLDER_STRUCTURE_PROPOSAL.md` - 폴더 구조 개선 제안

## Authentication (Supabase SSR)

### 주요 파일
- `src/lib/supabase/client.ts` - 브라우저 클라이언트 (`createBrowserClient`)
- `src/lib/supabase/server.ts` - 서버 클라이언트 (`createServerClient`)
- `src/components/auth/AuthProvider.tsx` - 클라이언트 인증 상태 관리
- `src/app/(auth)/auth/signout/route.ts` - 로그아웃 서버 API

### 로그아웃 구현 (2024-12-24 수정)

**중요**: Next.js SSR 환경에서 Supabase 로그아웃은 **서버 API**를 통해 처리해야 함.

```tsx
// ❌ 클라이언트에서 직접 호출 - 쿠키가 제대로 정리되지 않음
await supabase.auth.signOut();

// ✅ 서버 API를 통해 로그아웃
// AuthProvider.tsx
const signOut = useCallback(async () => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/auth/signout';
  document.body.appendChild(form);
  form.submit();
}, []);
```

**서버 라우트** (`/auth/signout/route.ts`):
```ts
export async function POST(req: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/', req.url), { status: 302 });
}
```

### 인증 흐름
1. OAuth 로그인 → `/auth/callback` → 세션 쿠키 설정
2. `AuthProvider`가 `onAuthStateChange`로 세션 상태 감지
3. 로그아웃 → POST `/auth/signout` → 서버에서 쿠키 삭제 → 홈 리다이렉트

## Competitor Reference: 위라이브온 (WeLiveOn)

경쟁 제품 기능 비교 및 Dajam 대응 현황:

| 위라이브온 기능 | Dajam 현황 | Element Type |
|--------------|-----------|--------------|
| 아이스브레이킹 | ✅ 구현완료 | quiz, word_cloud, poll |
| 사전/사후 테스트 | ⏳ 개발필요 | quiz + 결과 비교 기능 |
| 만족도 조사 | ✅ 구현완료 | survey |
| 퀴즈 대결 | ✅ 구현완료 | realtime_quiz |
| 질의 응답 (Q&A) | ✅ 구현완료 | qna |
| 강연 자료 공유 | ✅ 구현완료 | audience-engage slide sync |
| 경품 추첨 | ✅ 개별앱 존재 | random_picker (element화 필요) |

**추가 개발 필요 기능**:
- 사전/사후 테스트 결과 비교 분석
- 경품 추첨 element 타입 추가
- 리모콘 모드 (발표자용 간편 제어)

## Work In Progress (2024-12-25)

### V2 Data Architecture 완료

**완료된 작업**:
1. ✅ Phase 1-3 DB 마이그레이션 완료 (020, 021, 022)
2. ✅ TypeScript 타입 정의 완료 (`src/types/database.ts`)
3. ✅ V2 아키텍처 문서화 완료

**다음 단계** (Phase 4):
1. Element Editor Component (`src/app/audience-engage/components/ElementEditor.tsx`)
2. Realtime Hooks (`useSessionElements`, `useElementResponses`)
3. Element Response Components (Poll, Quiz, WordCloud 등)
4. CRM Dashboard UI

### 이전 이슈: Audience Engage E2E 테스트 (미해결)

**문제**: `joinSession` 함수가 null 반환
**상태**: V2 작업 우선, 추후 재검토
