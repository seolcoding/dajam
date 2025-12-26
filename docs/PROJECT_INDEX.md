# Dajam 프로젝트 인덱스

> **최종 업데이트**: 2024-12-26
> **버전**: 2.1.0

## 개요

**다잼(Dajam)** - 다함께 재미있게! 침묵을 깨는 실시간 인터랙션 플랫폼

- **URL**: https://dajam.seolcoding.com
- **스택**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **상태관리**: Zustand 5
- **백엔드**: Supabase (Auth, Database, Realtime)
- **결제**: Toss Payments

---

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 라우트 그룹
│   │   ├── auth/callback/        # OAuth 콜백
│   │   └── login/                # 로그인 페이지
│   ├── (dashboard)/              # 대시보드 라우트 그룹
│   │   └── dashboard/            # 사용자 대시보드
│   ├── (marketing)/              # 마케팅 페이지 그룹
│   │   └── page.tsx              # 홈페이지
│   ├── (admin)/                  # 관리자 라우트 그룹
│   │   └── admin/                # 관리자 대시보드
│   ├── api/                      # API 라우트
│   │   ├── payments/             # 결제 API
│   │   └── webhooks/             # 웹훅
│   ├── apps/                     # 앱 갤러리
│   ├── pricing/                  # 가격 페이지
│   └── [앱들...]                 # 21개 미니앱
├── components/                   # 공유 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트
│   ├── auth/                     # 인증 컴포넌트
│   ├── dashboard/                # 대시보드 컴포넌트
│   ├── marketing/                # 마케팅 컴포넌트
│   ├── subscription/             # 구독 컴포넌트
│   └── common/                   # 공통 컴포넌트
├── features/                     # 기능별 모듈
│   └── interactions/             # 인터랙션 기능
│       ├── quiz/                 # 퀴즈
│       ├── word-cloud/           # 워드클라우드
│       ├── this-or-that/         # 이거저거
│       ├── personality/          # 성격테스트
│       ├── bingo/                # 빙고
│       └── common/               # 공통 컴포넌트
├── hooks/                        # 커스텀 훅
│   └── subscription/             # 구독 관련 훅
├── lib/                          # 유틸리티 라이브러리
│   ├── supabase/                 # Supabase 클라이언트
│   ├── realtime/                 # 실시간 통신
│   └── toss/                     # 결제 연동
└── types/                        # 타입 정의
```

---

## 앱 목록 (21개)

### 핵심 앱 (Core)
| 앱 | 경로 | 설명 | 실시간 |
|----|------|------|:------:|
| Live Voting | `/live-voting` | 실시간 투표 | ✅ |
| Group Order | `/group-order` | 그룹 주문 | ✅ |
| Bingo Game | `/bingo-game` | 빙고 게임 | ✅ |
| Human Bingo | `/human-bingo` | 사람 빙고 | ✅ |

### 인터랙션 앱 (High)
| 앱 | 경로 | 설명 | 실시간 |
|----|------|------|:------:|
| Balance Game | `/balance-game` | 밸런스 게임 | ✅ |
| Ideal Worldcup | `/ideal-worldcup` | 이상형 월드컵 | ✅ |
| This or That | `/this-or-that` | 이거 vs 저거 | ✅ |
| Word Cloud | `/word-cloud` | 워드클라우드 | ✅ |
| Realtime Quiz | `/realtime-quiz` | 실시간 퀴즈 | ✅ |
| Personality Test | `/personality-test` | 성격 테스트 | ✅ |
| Student Network | `/student-network` | 학생 네트워크 | ✅ |
| Audience Engage | `/audience-engage` | 청중 참여 | ✅ |

### 오프라인/유틸리티 앱 (Medium)
| 앱 | 경로 | 설명 |
|----|------|------|
| Ladder Game | `/ladder-game` | 사다리 게임 |
| Team Divider | `/team-divider` | 팀 나누기 |
| Chosung Quiz | `/chosung-quiz` | 초성 퀴즈 |
| Random Picker | `/random-picker` | 랜덤 선택기 |
| Lunch Roulette | `/lunch-roulette` | 점심 룰렛 |

### 계산기/도구 앱 (Utility)
| 앱 | 경로 | 설명 |
|----|------|------|
| Salary Calculator | `/salary-calculator` | 연봉 계산기 |
| Rent Calculator | `/rent-calculator` | 월세/전세 비교 |
| GPA Calculator | `/gpa-calculator` | 학점 계산기 |
| Dutch Pay | `/dutch-pay` | 더치페이 |
| ID Validator | `/id-validator` | 주민등록번호 검증 |

---

## 핵심 컴포넌트

### 인증
| 파일 | 설명 |
|------|------|
| `components/auth/AuthProvider.tsx` | 클라이언트 인증 상태 관리 |
| `components/auth/UserMenu.tsx` | 사용자 메뉴 드롭다운 |
| `components/auth/LoginButtons.tsx` | OAuth 로그인 버튼 |
| `app/(auth)/auth/callback/route.ts` | OAuth 콜백 처리 |

### 실시간
| 파일 | 설명 |
|------|------|
| `lib/realtime/hooks/useRealtimeSession.ts` | 실시간 세션 훅 |
| `lib/realtime/utils.ts` | 세션 코드 생성/검증 |
| `lib/supabase/middleware.ts` | 세션 갱신 미들웨어 |

### UI
| 파일 | 설명 |
|------|------|
| `components/ui/*` | shadcn/ui 컴포넌트 |
| `components/dashboard/DashboardHeader.tsx` | 대시보드 헤더 |
| `components/marketing/MarketingHeader.tsx` | 마케팅 헤더 |

---

## API 라우트

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/payments/billing-key` | POST | 빌링키 발급 |
| `/api/payments/subscribe` | POST | 구독 결제 |
| `/api/webhooks/toss` | POST | Toss 웹훅 |

---

## 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# Kakao (점심 룰렛용)
NEXT_PUBLIC_KAKAO_APP_KEY=
```

---

## 스크립트

```bash
# 개발
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버

# 테스트
pnpm test:e2e         # E2E 테스트 (Chromium)
pnpm test:e2e:all     # 전체 브라우저 테스트
pnpm test:e2e:ui      # Playwright UI 모드

# 린트
pnpm lint             # ESLint
```

---

## 기술 스택

### 프론트엔드
- **Next.js 15** - App Router, Server Components
- **React 19** - UI 라이브러리
- **TypeScript 5.7** - 타입 안전성
- **Tailwind CSS 3** - 스타일링
- **Zustand 5** - 상태 관리
- **Framer Motion** - 애니메이션

### 백엔드
- **Supabase** - Auth, Database, Realtime
- **Toss Payments** - 결제

### UI 컴포넌트
- **shadcn/ui** - Radix UI 기반 컴포넌트
- **Lucide React** - 아이콘
- **Recharts** - 차트

### 테스트
- **Playwright** - E2E 테스트
- **Vitest** - 단위 테스트

---

## 관련 문서

- [CLAUDE.md](../CLAUDE.md) - 개발 가이드라인
- [AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md) - 인증 트러블슈팅
- [E2E_TEST_PLAN.md](../E2E_TEST_PLAN.md) - 테스트 계획
- [BRANDING_RESEARCH_DAJAM.md](./BRANDING_RESEARCH_DAJAM.md) - 브랜딩 가이드

---

## 통계

| 항목 | 수치 |
|------|------|
| TypeScript 파일 | 460+ |
| 앱 수 | 21개 |
| 실시간 앱 | 12개 |
| E2E Page Objects | 19개 |
| E2E Scenario Tests | 22개 |
| 테스트 케이스 | 950+ |
| 테스트 통과율 | 96% |

---

## 테스트 매핑 (APP_INDEX.yaml)

앱-코드-테스트 매핑 정보는 프로젝트 루트의 `APP_INDEX.yaml`에서 확인할 수 있습니다.

```yaml
# 앱별 테스트 찾기
apps:
  salary-calculator:
    tests:
      page_object: e2e/pages/calculator/salary.page.ts
      scenarios: e2e/scenarios/calculator/salary-calculator.spec.ts
```
