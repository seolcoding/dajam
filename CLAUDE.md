# Mini Apps - 서브 워크스페이스 모노레포

## 아키텍처 결정 (2024-12-20)

### 배경

seolcoding.com은 이미 하나의 Git 레포지토리이며, `agents/` 하위에 여러 프로젝트(website, slides, mini-apps)가 존재한다.
mini-apps는 16개의 독립적인 웹앱을 포함하며, 이들 간의 **UI 일관성**이 핵심 요구사항이다.

### 선택지 분석

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| A. 루트 워크스페이스 | seolcoding.com 전체를 pnpm workspace로 | 통합 관리 | Hugo와 혼재, 복잡도 증가 |
| **B. 서브 워크스페이스** | mini-apps만 독립 워크스페이스 | 다른 agents 영향 없음 | 중첩 구조 |
| C. 별도 레포 | mini-apps를 분리 | 완전 독립 | 관리 복잡, 배포 파편화 |

### 결정: 옵션 B - 서브 워크스페이스

mini-apps 폴더 내에서만 pnpm 워크스페이스를 운영한다.
다른 agents(slides, website)에는 영향을 주지 않으며, 빌드 결과물만 배포에 통합한다.

---

## UI 개발 전략: Shadcn UI

### 결정 (2024-12-20, 개정)

**Shadcn UI**를 주요 UI 컴포넌트 라이브러리로 사용한다.

### 왜 Shadcn UI인가?

| 항목 | Shadcn UI | Magic MCP |
|------|-----------|-----------|
| 일관성 | 검증된 디자인 시스템 | 매번 다른 스타일 |
| 코드 소유권 | 100% 소유, 완전 제어 | 생성 후 수정 필요 |
| 접근성 | Radix UI 기반, WCAG 준수 | 보장 안 됨 |
| 커스터마이징 | 테마/CSS 변수로 통일 | 개별 수정 |
| 패딩/마진 | 일관된 spacing scale | 불규칙 |

### 설치 방법

```bash
cd agents/mini-apps/packages/ui
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label dialog
```

### 컴포넌트 추가

```bash
# 개별 컴포넌트 추가
pnpm dlx shadcn@latest add accordion
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add progress

# 필요한 모든 컴포넌트
pnpm dlx shadcn@latest add button card input label dialog tabs progress slider switch checkbox radio-group select dropdown-menu popover tooltip toast avatar badge separator accordion alert alert-dialog
```

### 개발 워크플로우

1. **컴포넌트 필요 시**: `pnpm dlx shadcn@latest add [component]`
2. **자동 설치**: `packages/ui/src/components/ui/`에 저장됨
3. **커스터마이징**: CSS 변수 또는 직접 수정
4. **공유**: `@mini-apps/ui`로 export

---

## 브라우저 테스트: Chrome DevTools MCP

### 결정 (2024-12-20)

**Chrome DevTools MCP**를 사용하여 개발 중 실시간으로 UI를 확인하고 디버깅한다.

### MCP 설정

`.mcp.json` (seolcoding.com 루트):
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 사용 가이드

#### 페이지 탐색
```
mcp__chrome-devtools__navigate_page
- url: "http://localhost:5173"
- 개발 서버 페이지로 이동
```

#### 스냅샷 확인
```
mcp__chrome-devtools__take_snapshot
- 현재 페이지의 접근성 트리 스냅샷
- 요소별 uid 확인 가능
```

#### 스크린샷 캡처
```
mcp__chrome-devtools__take_screenshot
- fullPage: true (전체 페이지)
- uid: "element-id" (특정 요소만)
```

#### 요소 상호작용
```
mcp__chrome-devtools__click
- uid: "button-uid" (스냅샷에서 확인한 uid)

mcp__chrome-devtools__fill
- uid: "input-uid"
- value: "입력할 텍스트"
```

#### 콘솔/네트워크 확인
```
mcp__chrome-devtools__list_console_messages
- 콘솔 로그, 에러 확인

mcp__chrome-devtools__list_network_requests
- API 요청/응답 확인
```

### 개발 워크플로우 (MCP 통합)

1. **앱 실행**: `pnpm --filter app-name dev`
2. **브라우저 연결**: Chrome DevTools MCP로 localhost 접속
3. **UI 확인**: 스냅샷/스크린샷으로 렌더링 확인
4. **상호작용 테스트**: 클릭, 입력 등 동작 확인
5. **디버깅**: 콘솔 로그, 네트워크 요청 분석
6. **반복**: 수정 후 재확인

### 모바일 테스트

```
mcp__chrome-devtools__resize_page
- width: 375
- height: 812
- iPhone X 사이즈로 반응형 테스트
```

---

## 디렉토리 구조

```
agents/mini-apps/                    # 서브 워크스페이스 루트
├── CLAUDE.md                        # 이 파일
├── pnpm-workspace.yaml              # 워크스페이스 정의
├── package.json                     # 루트 스크립트
│
├── packages/                        # 공유 패키지
│   └── ui/                          # @mini-apps/ui
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts           # 빌드 설정
│       ├── tailwind.config.ts       # 공용 Tailwind 설정
│       └── src/
│           ├── index.ts             # 진입점
│           ├── components/
│           │   ├── ui/              # 기본 UI (21st.dev + shadcn 패턴)
│           │   └── shared/          # 앱 공통 (ShareButtons, ResultCard...)
│           ├── hooks/               # 공용 훅
│           ├── lib/                 # 유틸리티 (cn, utils)
│           └── styles/              # CSS 변수, 글로벌 스타일
│
├── apps/                            # 개별 앱들
│   ├── ideal-worldcup/              # 이상형 월드컵
│   ├── lunch-roulette/              # 점심 룰렛
│   ├── random-picker/               # 랜덤 뽑기
│   ├── ladder-game/                 # 사다리 게임
│   ├── team-divider/                # 팀 나누기
│   ├── balance-game/                # 밸런스 게임
│   ├── salary-calculator/           # 연봉 계산기
│   ├── rent-calculator/             # 전월세 계산기
│   ├── gpa-calculator/              # 학점 계산기
│   ├── id-validator/                # 주민번호 검증기
│   ├── live-voting/                 # 실시간 투표
│   ├── student-network/             # 학생 네트워크
│   ├── chosung-quiz/                # 초성 퀴즈
│   ├── bingo-game/                  # 빙고 게임
│   ├── group-order/                 # 공동 주문
│   └── dutch-pay/                   # 더치페이
│
└── prd/                             # PRD 문서 (참조용)
    ├── 01-ideal-worldcup.md
    └── ...
```

---

## 기술 스택 (전체 앱 공통)

| 항목 | 기술 | 버전 |
|------|------|------|
| 런타임 | Node.js | >= 20 |
| 패키지 매니저 | pnpm | >= 9 |
| 프레임워크 | React | 19 |
| 언어 | TypeScript | ~5.9 |
| 스타일링 | Tailwind CSS | v4 |
| 빌드 | Vite | 7+ |
| UI 라이브러리 | **Shadcn UI** | latest |
| UI 기반 | Radix UI + CVA | - |
| 아이콘 | lucide-react | 0.468+ |
| 상태관리 | Zustand | 5+ |

---

## @mini-apps/ui 패키지

### 설계 원칙

1. **Shadcn UI 사용**: 검증된 컴포넌트 + 일관된 디자인 시스템
2. **Radix UI 기반**: 접근성 표준 준수 (WCAG)
3. **코드 소유권**: 복사된 코드를 프로젝트 내 소스로 관리
4. **한국어 최적화**: Pretendard 폰트, 한국어 UX 고려

### 제공 컴포넌트

**기본 UI**:
- Button, Card, Input, Label
- Dialog (Modal), Dropdown, Select
- Tabs, Progress, Slider
- Toast, Tooltip, Avatar
- Checkbox, Radio, Switch
- Accordion, Popover, Separator

**공용 컴포넌트 (shared/)**:
- ShareButtons: SNS 공유 (네이티브, 카카오, 링크복사)
- ResultCard: 결과 이미지 생성용 카드
- NumberInput: 숫자 전용 입력 (천단위 콤마)
- LoadingSpinner: 로딩 상태

### 사용법 (앱에서)

```tsx
// 앱의 package.json
{
  "dependencies": {
    "@mini-apps/ui": "workspace:*"
  }
}

// 컴포넌트 import
import { Button, Card, Input, ShareButtons } from "@mini-apps/ui";

// 스타일 import (앱의 main.tsx)
import "@mini-apps/ui/styles.css";
```

---

## 개발 워크플로우

### 초기 설정

```bash
cd agents/mini-apps
pnpm install                    # 전체 의존성 설치
```

### UI 컴포넌트 개발 (Shadcn UI)

1. **컴포넌트 추가**: `pnpm dlx shadcn@latest add [component]`
2. **자동 저장**: `packages/ui/src/components/ui/` 에 저장됨
3. **export 추가**: `packages/ui/src/index.ts` 에 추가
4. **커스터마이징**: 필요 시 CSS 변수 또는 컴포넌트 직접 수정
5. **빌드**: `pnpm --filter @mini-apps/ui build`

### 앱 개발

```bash
# 특정 앱 개발
pnpm --filter ideal-worldcup dev

# 전체 병렬 개발
pnpm dev
```

### 빌드

```bash
# UI 패키지만 빌드
pnpm build:ui

# 전체 빌드
pnpm build
```

---

## 새 앱 추가 가이드

### 1. 앱 디렉토리 생성

```bash
cd agents/mini-apps/apps
pnpm create vite@latest my-new-app --template react-ts
cd my-new-app
```

### 2. package.json 수정

```json
{
  "name": "my-new-app",
  "dependencies": {
    "@mini-apps/ui": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

### 3. vite.config.ts 설정

```typescript
export default defineConfig({
  base: "/mini-apps/my-new-app/",  // 배포 경로
  // ...
});
```

### 4. Tailwind 설정 확장

```typescript
// tailwind.config.ts
import baseConfig from "@mini-apps/ui/tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",  // UI 패키지 포함
  ],
};
```

### 5. 스타일 import

```tsx
// src/main.tsx
import "@mini-apps/ui/styles.css";
import "./index.css";  // 앱 전용 스타일 (있다면)
```

---

## 아키텍처 로드맵 (2024-12-21)

### Phase 1: 현재 (Vite SPA - 모노레포)
```
seolcoding.com/                    # 단일 Git 레포
├── content/                       # Hugo 포트폴리오
├── agents/
│   ├── mini-apps/                 # 16개 Vite 앱
│   ├── slides/                    # Slidev 프레젠테이션
│   └── website/                   # 기타
└── .github/workflows/deploy.yml   # 통합 빌드
```

### Phase 2: 목표 (리파지토리 분리)

#### 레포지토리 구조
```
seolcoding.com/                    # 레포 1 → GitHub Pages
├── content/ko/                    # Hugo 포트폴리오
├── themes/careercanvas/
├── config.toml
└── .github/workflows/deploy.yml

seolcoding-apps/                   # 레포 2 → Vercel
├── apps/                          # Next.js 앱 (Turborepo)
│   ├── worldcup/                  # 이상형 월드컵
│   ├── quiz/                      # 초성 퀴즈
│   ├── balance/                   # 밸런스 게임
│   ├── calculator/                # 계산기 통합
│   └── ...
├── packages/
│   ├── ui/                        # @seolcoding/ui (Shadcn)
│   ├── db/                        # @seolcoding/db (Drizzle)
│   └── auth/                      # @seolcoding/auth (Supabase)
├── supabase/
│   ├── migrations/                # DB 스키마
│   └── seed.sql                   # 초기 데이터
└── turbo.json                     # Turborepo 설정
```

#### 호스팅 구조
```
seolcoding.com              → GitHub Pages (Hugo)
    │
    └── 링크 연결
           │
           ▼
apps.seolcoding.com         → Vercel (Next.js)
           │
           ▼
      Supabase
      ├── Auth (Google, Kakao 소셜 로그인)
      ├── PostgreSQL (콘텐츠 DB)
      └── Realtime (실시간 투표/게임)
```

### 분리의 장점

| 항목 | 모노레포 (현재) | 분리 (목표) |
|------|----------------|------------|
| **Vercel 연동** | 서브디렉토리 설정 필요 | 루트에서 바로 인식 |
| **CI/CD** | Hugo + Vite 혼재 | 각각 최적화 |
| **빌드 시간** | 전체 빌드 | 변경된 앱만 빌드 |
| **배포** | 한쪽 수정해도 전체 | 독립 배포 |
| **권한 관리** | 전체 접근 | 분리 가능 |

### 기술 스택 변경

| 항목 | 현재 | 목표 |
|------|------|------|
| 프레임워크 | Vite + React SPA | Next.js 15 App Router |
| 모노레포 | pnpm workspace | Turborepo |
| 상태관리 | localStorage | Supabase PostgreSQL |
| 인증 | 없음 | Supabase Auth |
| ORM | 없음 | Drizzle ORM |
| 호스팅 | GitHub Pages | Vercel |
| 캐싱 | 없음 | Vercel Edge + Redis |

### 마이그레이션 단계

#### Step 1: 레포 분리
```bash
# 1. 새 레포 생성
gh repo create seolcoding-apps --public

# 2. Turborepo 초기화
cd seolcoding-apps
pnpm dlx create-turbo@latest

# 3. 기존 앱 복사 (히스토리 없이)
cp -r ../seolcoding.com/agents/mini-apps/apps/* apps/
cp -r ../seolcoding.com/agents/mini-apps/packages/* packages/
```

#### Step 2: Next.js 마이그레이션
1. **Vite → Next.js 변환**: App Router 구조로 재구성
2. **정적 앱 우선**: 계산기류 먼저 (상태 불필요)
3. **DB 연동 앱**: Supabase 스키마 설계 후 마이그레이션

#### Step 3: Vercel 배포
```bash
# Vercel CLI로 배포
vercel link
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel --prod
```

### 마이그레이션 우선순위
1. **정적 계산기류**: salary, rent, gpa (변환 쉬움)
2. **데이터 필요 앱**: chosung-quiz, ideal-worldcup, balance-game
3. **실시간 앱**: live-voting, student-network (Supabase Realtime)

---

## 배포 전략

### Phase 1: 현재 (GitHub Pages - 모노레포)

```yaml
# seolcoding.com/.github/workflows/deploy.yml
- name: Build Mini Apps
  run: |
    cd agents/mini-apps
    pnpm install --frozen-lockfile
    pnpm build

- name: Copy to public
  run: |
    mkdir -p public/apps
    for app in agents/mini-apps/apps/*/; do
      name=$(basename "$app")
      cp -r "$app/dist" "public/apps/$name"
    done
```

**현재 URL 구조**:
- `seolcoding.com/apps/ideal-worldcup/`
- `seolcoding.com/apps/chosung-quiz/`
- `seolcoding.com/apps/salary-calculator/`

### Phase 2: 목표 (분리 후)

#### seolcoding.com (GitHub Pages)
```yaml
# seolcoding.com/.github/workflows/deploy.yml
# Hugo 포트폴리오만 빌드
- name: Build Hugo
  run: hugo --minify

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
```

#### apps.seolcoding.com (Vercel)
```
seolcoding-apps/ (별도 레포)
├── vercel.json
└── apps/
    ├── worldcup/      # /worldcup
    ├── quiz/          # /quiz
    └── calculator/    # /calculator/*
```

**vercel.json**:
```json
{
  "buildCommand": "pnpm turbo build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

**Vercel 환경변수**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 배포 URL 매핑

| 앱 | Phase 1 (현재) | Phase 2 (목표) |
|---|---|---|
| ideal-worldcup | `seolcoding.com/apps/ideal-worldcup/` | `apps.seolcoding.com/worldcup` |
| chosung-quiz | `seolcoding.com/apps/chosung-quiz/` | `apps.seolcoding.com/quiz` |
| balance-game | `seolcoding.com/apps/balance-game/` | `apps.seolcoding.com/balance` |
| salary-calculator | `seolcoding.com/apps/salary-calculator/` | `apps.seolcoding.com/calculator/salary` |
| rent-calculator | `seolcoding.com/apps/rent-calculator/` | `apps.seolcoding.com/calculator/rent` |
| gpa-calculator | `seolcoding.com/apps/gpa-calculator/` | `apps.seolcoding.com/calculator/gpa` |

### 도메인 설정

#### Cloudflare DNS (예시)
```
seolcoding.com        A      185.199.108.153  # GitHub Pages
apps.seolcoding.com   CNAME  cname.vercel-dns.com
```

#### Vercel 도메인
1. Vercel Dashboard → Project Settings → Domains
2. `apps.seolcoding.com` 추가
3. DNS 레코드 확인

---

## 마이그레이션: prompt-tutorial

기존 `prompt-tutorial/`은 현재 mini-apps 루트에 있음.
향후 `apps/prompt-tutorial/`로 이동하고 @mini-apps/ui를 사용하도록 마이그레이션 필요.

**마이그레이션 단계**:
1. `mv prompt-tutorial apps/prompt-tutorial`
2. package.json에 `"@mini-apps/ui": "workspace:*"` 추가
3. 기존 컴포넌트를 @mini-apps/ui로 교체
4. Tailwind 설정 확장

---

## 참고 문서

- PRD 문서: `prd/*.md` (16개 앱 상세 요구사항)
- Shadcn UI: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/primitives
- Tailwind CSS v4: https://tailwindcss.com/docs
