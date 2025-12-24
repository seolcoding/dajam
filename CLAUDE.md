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

## Related Docs

- `README.md` - Quick start and app list
- `APPS_DOCUMENTATION.md` - Full app catalog
- `E2E_TEST_PLAN.md` - Testing strategy
- `prd/*.md` - Product requirements for each app
- `docs/BRANDING_RESEARCH_DAJAM.md` - Dajam 브랜딩 가이드라인

## Paused Work (2024-12-23)

### Audience Engage 멀티유저 E2E 테스트 디버깅 (일시 중단)

**문제**: 참여자가 세션에 참여할 때 `joinSession` 함수가 null 반환

**진행 상황**:
1. RLS 정책 수정 완료 (`supabase/migrations/011_allow_anonymous_participants.sql`)
   - 익명 사용자가 public 세션에 참여할 수 있도록 허용
2. 직접 API 호출은 성공 (RLS 정책 정상 작동 확인)
3. `useRealtimeSession` 훅에 디버그 로그 추가됨
4. Dajam 브랜딩 구현 완료 (`tailwind.config.ts`, `globals.css` 등)

**의심 원인**:
- `joinSession` 콜백의 `state.sessionId` 클로저 이슈
- 세션 프리로드 시점과 `joinSession` 호출 시점의 상태 불일치

**재개 시 할 일**:
1. 콘솔 로그로 `state.sessionId` 값 추적
2. `handleJoinSession`에서 `session.id`를 직접 사용하도록 수정 검토
3. E2E 테스트 통과 확인
