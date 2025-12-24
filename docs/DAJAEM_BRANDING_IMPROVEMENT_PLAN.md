# 다잼(DaJaem) 브랜딩, 아이덴티티, 상품화 개선 계획서

> **Version 2.1** | 작성일: 2025-12-23
> **목표**: SeolCoding Apps를 "다잼(DaJaem)" 브랜드로 재탄생시켜 한국 시장 최적화된 인터랙티브 플랫폼으로 포지셔닝

---

## 목차

1. [Executive Summary](#1-executive-summary)
2. [현재 상태 분석](#2-현재-상태-분석)
3. [브랜드 아이덴티티 체계](#3-브랜드-아이덴티티-체계)
4. [비주얼 아이덴티티 시스템 (VIS)](#4-비주얼-아이덴티티-시스템-vis)
5. [버벌 아이덴티티 및 UX 라이팅](#5-버벌-아이덴티티-및-ux-라이팅)
6. [상품화 전략](#6-상품화-전략)
7. [기술 구현 명세](#7-기술-구현-명세)
8. [경쟁사 대비 차별화 전략](#8-경쟁사-대비-차별화-전략)
9. [구현 로드맵](#9-구현-로드맵)
10. [부록](#10-부록)

---

## 1. Executive Summary

### 1.1 핵심 변환

| 구분 | As-Is (SeolCoding Apps) | To-Be (다잼 DaJaem) |
|------|-------------------------|---------------------|
| **브랜드명** | SeolCoding Apps | 다잼 (DaJaem) |
| **포지셔닝** | "22개 실용 웹 앱 모음" | "침묵을 깨는 한국형 소통 OS" |
| **타겟** | 개인 사용자 중심 | B2G/B2B/Education 3-Track |
| **핵심 가치** | 기능 제공 | 심리적 안전 + 행정 효율화 |
| **시각 언어** | 혼재된 색상 체계 | DaJaem Green/Yellow 기반 통합 |

### 1.2 브랜드 에센스

```
"다(多)양한 사람들이 잼(재미)있게 소통하는 공간"
= 다잼 (DaJaem)
```

**Brand Promise**: "침묵을 깨는 가장 안전하고 위트 있는 방법"

**Brand Persona**: 국민 MC 유재석형 '재치꾼(Jaechikkun)'
- 격식을 갖추되 적재적소에 위트
- 참여자 배려, 매끄러운 진행
- 실력 있는 전문가이면서 친근한 이웃

---

## 2. 현재 상태 분석

### 2.1 기존 자산

**강점 (Strengths)**:
- ✅ 22개 앱의 완성된 기능 셋
- ✅ Supabase Realtime 기반 실시간 인프라
- ✅ Next.js 15 + Tailwind CSS 최신 스택
- ✅ DaJaem 컬러 팔레트 일부 적용 (`tailwind.config.ts`)
- ✅ 다크 모드 네이티브 지원 (`globals.css`)

**개선 필요 (Gaps)**:
- ❌ 브랜드 네이밍 미정립 (SeolCoding vs 다잼)
- ❌ 앱 간 시각적 일관성 부족
- ❌ 한국형 UX 라이팅 미적용
- ❌ 요금제/상품화 전략 부재
- ❌ B2G 시장 진입 준비 미흡 (HWP 호환 등)

### 2.2 기존 CSS 변수 현황 (globals.css)

```css
/* 현재 적용된 DaJaem 색상 */
--color-dajaem-green: #03C75A;
--color-dajaem-teal: #005F55;
--color-dajaem-yellow: #FFD600;
--color-dajaem-red: #DE354C;
--color-dajaem-purple: #7000FF;
--color-dajaem-grey: #F5F7F8;
```

### 2.3 앱 티어 분석

| Tier | 앱 수 | 상품화 우선순위 | 수익 잠재력 |
|------|-------|-----------------|-------------|
| 🎯 Platform | 1 (audience-engage) | 최고 | ★★★★★ |
| 🔥 Core | 8 | 높음 | ★★★★☆ |
| ⚡ High | 3 | 중간 | ★★★☆☆ |
| 📊 Medium | 3 | 낮음 | ★★☆☆☆ |
| 🔧 Utility | 7 | Freemium | ★☆☆☆☆ |

---

## 3. 브랜드 아이덴티티 체계

### 3.1 브랜드 아키텍처

```
다잼 (DaJaem)
├── DaJaem Platform (통합 플랫폼)
│   └── Audience Engage
├── DaJaem Live (실시간 멀티유저)
│   ├── Live Voting
│   ├── Realtime Quiz
│   ├── Group Order
│   ├── Bingo Game
│   ├── This or That
│   ├── Word Cloud
│   ├── Personality Test
│   └── Human Bingo
├── DaJaem Play (게이미피케이션)
│   ├── Balance Game
│   ├── Ideal Worldcup
│   ├── Ladder Game
│   └── Chosung Quiz
├── DaJaem Connect (커넥션)
│   ├── Student Network
│   └── Team Divider
└── DaJaem Tools (유틸리티)
    ├── Salary Calculator
    ├── Rent Calculator
    ├── GPA Calculator
    ├── Dutch Pay
    ├── Random Picker
    ├── Lunch Roulette
    └── ID Validator
```

### 3.2 서브 브랜드 네이밍 (한글화)

| 영문 | 한글 브랜드명 | 슬로건 |
|------|--------------|--------|
| Audience Engage | 다잼 무대 | "무대 위의 모든 소통" |
| Live Voting | 다잼 투표 | "손끝에서 시작되는 민주주의" |
| Realtime Quiz | 다잼 퀴즈 | "지금 바로, 맞춤 퀴즈 대결" |
| Group Order | 다잼 주문 | "함께 시키고, 편하게 계산" |
| Bingo Game | 다잼 빙고 | "빙고! 승리의 한 줄" |
| This or That | 다잼 양자택일 | "이것 vs 저것, 결정하세요" |
| Word Cloud | 다잼 키워드 | "우리의 생각을 한눈에" |
| Balance Game | 다잼 밸런스 | "당신의 선택은?" |
| Ideal Worldcup | 다잼 월드컵 | "나의 이상형을 찾아서" |

### 3.3 타겟 페르소나

#### 페르소나 1: 김주무관 (B2G)
- **프로필**: 35세, 공공기관 교육담당, 과장급
- **고통점**: HWP 문서 변환, 행정 보고서 작성, 연말 예산 소진
- **니즈**: "HWP 파일 그대로 퀴즈로 변환하고, 결과를 공문 양식으로 내보내고 싶어요"
- **핵심 메시지**: "HWP 매직 패스 - 드래그 한 번으로 끝"

#### 페르소나 2: 박부장 (B2B)
- **프로필**: 48세, 대기업 팀장, MZ세대 관리 고민
- **고통점**: 침묵하는 회의, 소통 단절, 세대 갈등
- **니즈**: "회의 때마다 조용하기만 한데, 어떻게 하면 의견을 들을 수 있을까요?"
- **핵심 메시지**: "가면 모드 - 계급장 떼고 솔직하게"

#### 페르소나 3: 이다잼 (Education)
- **프로필**: 22세, 대학생, 조별과제 리더
- **니즈**: "지루한 발표 NO! 도파민 터지는 상호작용"
- **핵심 메시지**: "폼 미쳤다! - 예능 같은 발표"

---

## 4. 비주얼 아이덴티티 시스템 (VIS)

### 4.1 컬러 시스템

#### Primary Colors

| 역할 | 색상명 | Hex | HSL | 사용 가이드 |
|------|--------|-----|-----|-------------|
| Primary | DaJaem Green | `#03C75A` | 149, 97%, 40% | 주요 CTA, 로고, 성공 |
| Primary Dark | Deep Teal | `#005F55` | 168, 100%, 19% | 다크모드 배경, 헤더 |
| Primary Light | Mint | `#E8FAF0` | 149, 70%, 95% | 배경 하이라이트 |

#### Secondary Colors

| 역할 | 색상명 | Hex | HSL | 사용 가이드 |
|------|--------|-----|-----|-------------|
| Secondary | Energy Yellow | `#FFD600` | 50, 100%, 50% | 강조, 경고, 주목 |
| Secondary Light | Cream | `#FFFDE7` | 56, 100%, 95% | 배경 악센트 |

#### Accent Colors

| 역할 | 색상명 | Hex | 사용 가이드 |
|------|--------|-----|-------------|
| Accent Hot | Infrared Red | `#DE354C` | 랭킹, 긴급, 1위 |
| Accent Cool | Electric Purple | `#7000FF` | 익명모드, Z세대 타겟 |
| Accent Neutral | Ocean Blue | `#0066FF` | 링크, 정보 |

#### Semantic Colors

| 역할 | Hex | 사용처 |
|------|-----|--------|
| Success | `#03C75A` | 정답, 완료 |
| Warning | `#FFD600` | 주의, 시간경고 |
| Error | `#DE354C` | 오답, 에러 |
| Info | `#0066FF` | 안내, 힌트 |

#### Grayscale

| 단계 | Hex | 사용처 |
|------|-----|--------|
| Gray 50 | `#FAFAFA` | 페이지 배경 |
| Gray 100 | `#F5F7F8` | 카드 배경 |
| Gray 200 | `#E5E7EB` | 보더, 구분선 |
| Gray 500 | `#6B7280` | 보조 텍스트 |
| Gray 900 | `#111827` | 메인 텍스트 |

### 4.2 타이포그래피 시스템

#### 폰트 스택

```css
/* 본문 - 시스템 최적화 */
--font-body: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 디스플레이 - 예능 감성 */
--font-display: 'Jalnan', 'Noto Sans KR', sans-serif;

/* 숫자/데이터 - 명확한 가독성 */
--font-mono: 'SF Mono', 'JetBrains Mono', monospace;
```

#### 타입 스케일

| 레벨 | Size | Weight | Line-height | 사용처 |
|------|------|--------|-------------|--------|
| Display XL | 4rem (64px) | 800 | 1.1 | 히어로 헤드라인 |
| Display L | 3rem (48px) | 700 | 1.2 | 섹션 타이틀 |
| Display M | 2rem (32px) | 700 | 1.3 | 퀴즈 문제 |
| Heading | 1.5rem (24px) | 600 | 1.4 | 카드 타이틀 |
| Body L | 1.125rem (18px) | 400 | 1.6 | 중요 본문 |
| Body M | 1rem (16px) | 400 | 1.6 | 기본 본문 |
| Body S | 0.875rem (14px) | 400 | 1.5 | 보조 텍스트 |
| Caption | 0.75rem (12px) | 500 | 1.4 | 레이블, 캡션 |

### 4.3 UI 컴포넌트 가이드라인

#### 버튼

```tsx
// Primary Button
className="bg-dajaem-green hover:bg-dajaem-green/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-dajaem-green/25 transition-all hover:scale-[1.02] active:scale-[0.98]"

// Secondary Button
className="bg-dajaem-yellow hover:bg-dajaem-yellow/90 text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-dajaem-yellow/25"

// Ghost Button
className="border-2 border-dajaem-green text-dajaem-green hover:bg-dajaem-green/10 px-6 py-3 rounded-xl font-semibold"
```

#### 카드

```tsx
// Standard Card (Light Mode)
className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-dajaem-green/20 transition-all"

// Featured Card
className="bg-gradient-to-br from-dajaem-green to-dajaem-teal text-white rounded-2xl p-6 shadow-xl"

// Dark Mode Card
className="dark:bg-dajaem-teal dark:border-dajaem-green/30 dark:shadow-dajaem-green/10"
```

#### 입력 필드

```tsx
// Text Input
className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-dajaem-green focus:ring-4 focus:ring-dajaem-green/20 outline-none transition-all"

// PIN Code Input
className="w-16 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-dajaem-yellow focus:ring-4 focus:ring-dajaem-yellow/20"
```

### 4.4 애니메이션 가이드라인

#### 이징 함수

```css
/* 표준 이징 */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);

/* 지속 시간 */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

#### 피드백 애니메이션

```css
/* 정답 애니메이션 */
@keyframes correct-answer {
  0% { transform: scale(1); background-color: var(--color-dajaem-green); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 오답 애니메이션 */
@keyframes wrong-answer {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* 랭킹 상승 */
@keyframes rank-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
```

### 4.5 아이콘 시스템

**기본 아이콘셋**: Lucide React (현재 사용 중)

**커스텀 아이콘 필요 목록**:
- 다잼 로고 (그린 말풍선 + 별)
- 가면 모드 아이콘 (복면가왕 모티브)
- HWP 매직 패스 아이콘

---

## 5. 버벌 아이덴티티 및 UX 라이팅

### 5.1 톤앤보이스 가이드

| 상황 | 기존 (관료적) | 다잼 스타일 |
|------|--------------|-------------|
| 로딩 | "로딩 중..." | "잠시만요, 준비 중!" |
| 성공 | "제출되었습니다" | "제출 완료!" |
| 에러 | "오류가 발생했습니다" | "앗, 다시 한번 시도해볼까요?" |
| 빈 상태 | "데이터가 없습니다" | "아직 아무도 참여하지 않았어요" |
| 대기 | "대기 중입니다" | "참여자를 기다리는 중..." |

### 5.2 상황별 피드백 멘트

#### 퀴즈 정답/오답

```typescript
const correctFeedbacks = [
  "와우! 혹시 천재?",
  "폼 미쳤다!",
  "정확해요!",
  "역시 센스쟁이!",
  "똑똑이 등장!",
];

const incorrectFeedbacks = [
  "아깝다! 까비!",
  "동공지진...",
  "괜찮아요, 다음 문제 노려봐요!",
  "아슬아슬했어요!",
  "다음엔 분명히!",
];
```

#### 랭킹 변동

```typescript
const rankingMessages = {
  first: "🏆 1등! 넘버원의 자리를 지켜요!",
  up: "🚀 {n}등 상승! 치고 올라가는 중!",
  down: "📉 {n}등 하락... 다음 문제에서 역전!",
  same: "🎯 현재 {n}등! 유지 중!",
};
```

#### 참여 유도

```typescript
const engagementMessages = {
  waiting: "지금 입장하면 선착순 혜택이!",
  lowParticipation: "조용하네요? 익명 모드로 솔직하게!",
  highEngagement: "와! 분위기 대박! 계속 가보자!",
};
```

### 5.3 버튼 레이블 가이드

| 액션 | 기존 | 다잼 스타일 |
|------|------|------------|
| 시작 | "시작" | "지금 시작하기" |
| 참여 | "참여" | "나도 참여할래" |
| 제출 | "제출" | "보내기" |
| 다음 | "다음" | "다음으로" |
| 결과 | "결과 보기" | "결과 확인하기" |
| 공유 | "공유" | "친구에게 알리기" |

---

## 6. 상품화 전략

### 6.1 요금제 구조

#### Free (무료)

| 항목 | 제한 |
|------|------|
| 세션당 참여자 | 최대 30명 |
| 월간 세션 | 무제한 |
| 퀴즈/투표 수 | 세션당 10개 |
| 데이터 보관 | 7일 |
| 브랜딩 | 다잼 워터마크 |

#### Pro (월 19,900원 / 연 199,000원)

| 항목 | 제공 |
|------|------|
| 세션당 참여자 | 최대 100명 |
| 월간 세션 | 무제한 |
| 퀴즈/투표 수 | 무제한 |
| 데이터 보관 | 1년 |
| 브랜딩 | 워터마크 제거 |
| HWP 임포트 | ✅ |
| 결과 내보내기 | PDF, Excel |

#### Enterprise (견적 문의 / 연 단위)

| 항목 | 제공 |
|------|------|
| 세션당 참여자 | 1,000명+ |
| 동시 세션 | 무제한 |
| 데이터 보관 | 무제한 |
| HWP 리포트 수출 | ✅ |
| SSO/SAML 연동 | ✅ |
| 전용 고객지원 | ✅ |
| SLA 보장 | 99.9% |
| 온프레미스 옵션 | 별도 협의 |

### 6.2 B2G 시장 진입 전략

#### Phase 1: 인증 획득
- [ ] GS인증 (Good Software) 획득
- [ ] CSAP (Cloud Security Assurance Program) 준비
- [ ] 조달청 나라장터 디지털서비스몰 등록

#### Phase 2: 파일럿 운영
- [ ] 교육청 시범 사업 제안
- [ ] 공무원 연수원 협력
- [ ] 지자체 주민참여 플랫폼 연계

#### Phase 3: 확산
- [ ] 학교장터(S2B) 등록
- [ ] 전자세금계산서 발행 자동화
- [ ] 예산 집행 맞춤 결제 (3월 시작, 2월 종료)

### 6.3 Killer Feature: HWP 매직 패스

```
[사용자 플로우]

1. HWP 파일 드래그앤드롭
   └── "다잼 HWP 매직 패스" 버튼 클릭

2. AI 분석 (3~5초)
   └── 문서 내 문제 형식 자동 인식
   └── 객관식, 단답형, OX 자동 분류

3. 퀴즈 생성 미리보기
   └── 수정/삭제 가능
   └── 난이도 자동 태깅

4. 세션 생성
   └── QR코드 + 6자리 코드 자동 생성
```

### 6.4 마케팅 훅

| 시즌 | 캠페인 | 타겟 |
|------|--------|------|
| 2~3월 | "새 학기, 새 소통" | 교사, 교수 |
| 6월 | "상반기 결산 회의 업그레이드" | 기업 HR |
| 9월 | "워크숍 시즌 필수템" | 기업 교육 |
| 11~12월 | "잔여 예산 스마트 소진" | 공공기관 |

---

## 7. 기술 구현 명세

### 7.1 CSS 변수 업데이트 (globals.css)

```css
:root {
  /* ===== DaJaem Brand Colors ===== */

  /* Primary */
  --dajaem-green: 149 97% 40%;
  --dajaem-green-light: 149 70% 95%;
  --dajaem-teal: 168 100% 19%;

  /* Secondary */
  --dajaem-yellow: 50 100% 50%;
  --dajaem-yellow-light: 56 100% 95%;

  /* Accent */
  --dajaem-red: 352 74% 53%;
  --dajaem-purple: 267 100% 50%;
  --dajaem-blue: 220 100% 50%;

  /* Semantic (HSL) */
  --color-success: var(--dajaem-green);
  --color-warning: var(--dajaem-yellow);
  --color-error: var(--dajaem-red);
  --color-info: var(--dajaem-blue);

  /* ===== Shadows ===== */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-glow-green: 0 0 20px rgb(3 199 90 / 0.25);
  --shadow-glow-yellow: 0 0 20px rgb(255 214 0 / 0.25);

  /* ===== Animation ===== */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
}

.dark {
  /* Dark mode specific overrides */
  --background: 168 100% 11.8%;
  --card: 168 100% 15%;
  --border: 168 60% 25%;
}
```

### 7.2 Tailwind 설정 업데이트 (tailwind.config.ts)

```typescript
const config: Config = {
  theme: {
    extend: {
      colors: {
        dajaem: {
          green: {
            DEFAULT: '#03C75A',
            light: '#E8FAF0',
            dark: '#029547',
          },
          teal: {
            DEFAULT: '#005F55',
            light: '#007A6D',
            dark: '#004540',
          },
          yellow: {
            DEFAULT: '#FFD600',
            light: '#FFFDE7',
            dark: '#CCB100',
          },
          red: '#DE354C',
          purple: '#7000FF',
          blue: '#0066FF',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        display: ['Jalnan', 'Noto Sans KR', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(3, 199, 90, 0.25)',
        'glow-yellow': '0 0 20px rgba(255, 214, 0, 0.25)',
      },
      animation: {
        'correct': 'correct-answer 0.5s ease-out',
        'wrong': 'wrong-answer 0.4s ease-out',
        'rank-up': 'rank-up 0.6s ease-out',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
    },
  },
};
```

### 7.3 컴포넌트 마이그레이션 체크리스트

#### 공통 컴포넌트

- [ ] `<Button />` - 다잼 컬러 적용
- [ ] `<Card />` - 뉴모피즘 스타일 적용
- [ ] `<Input />` - 포커스 링 색상 통일
- [ ] `<Badge />` - 피드백 뱃지 신규 추가
- [ ] `<Toast />` - 예능 스타일 멘트 적용

#### 앱별 컴포넌트

- [ ] `QuizScene` - 피드백 애니메이션 강화
- [ ] `VotingScene` - 실시간 그래프 컬러 통일
- [ ] `LeaderBoard` - 랭킹 애니메이션 추가
- [ ] `JoinSession` - 온보딩 UX 개선

---

## 8. 경쟁사 대비 차별화 전략

### 8.1 기능 비교 매트릭스

| 기능 | Kahoot | Slido | 퀴즈앤 | 다잼 Ver 2.0 |
|------|--------|-------|--------|-------------|
| HWP 임포트 | ❌ | ❌ | ❌ | ✅ 매직패스 |
| 초성 퀴즈 | ❌ | ❌ | ✅ | ✅ |
| 익명 모드 | ❌ | ✅ | ❌ | ✅ 가면모드 |
| 다크 모드 | ❌ | ✅ | ❌ | ✅ 네이티브 |
| 예능 피드백 | ❌ | ❌ | ❌ | ✅ |
| HWP 리포트 | ❌ | ❌ | ❌ | ✅ |
| 웨일 연동 | ❌ | ❌ | ✅ | 🔜 계획 중 |

### 8.2 핵심 차별점 3가지

1. **HWP 네이티브**: 공공기관/학교의 95% 문서인 HWP를 드래그앤드롭으로 퀴즈 변환
2. **가면 모드**: 한국 조직 문화의 침묵을 깨는 익명성 + 재미 요소
3. **예능 UX**: 토스의 간결함 + 예능의 위트 = 유일무이한 톤앤매너

---

## 9. 구현 로드맵

### Phase 1: 브랜드 기반 구축 (4주)

**Week 1-2: 디자인 시스템**
- [ ] CSS 변수 및 Tailwind 설정 업데이트
- [ ] 컬러 토큰 통합
- [ ] 폰트 시스템 정비 (Pretendard + Jalnan)

**Week 3-4: 핵심 컴포넌트**
- [ ] 버튼/카드/인풋 컴포넌트 리팩토링
- [ ] 애니메이션 라이브러리 구축
- [ ] 다크 모드 전면 점검

### Phase 2: UX 라이팅 적용 (2주)

**Week 5-6**
- [ ] 피드백 멘트 데이터베이스 구축
- [ ] 상황별 메시지 컴포넌트 개발
- [ ] A/B 테스트 프레임워크 준비

### Phase 3: Killer Feature 개발 (6주)

**Week 7-12**
- [ ] HWP 파서 개발/연동
- [ ] AI 기반 문제 생성 로직
- [ ] 가면 모드 UI/UX 구현

### Phase 4: 상품화 (4주)

**Week 13-16**
- [ ] 결제 시스템 연동 (토스페이먼츠)
- [ ] 요금제 관리 대시보드
- [ ] 라이선스 키 시스템

### Phase 5: B2G 진입 (8주)

**Week 17-24**
- [ ] GS인증 준비 및 심사
- [ ] 나라장터 등록
- [ ] 파일럿 운영

---

## 10. 부록

### 10.1 디자인 에셋 체크리스트

- [ ] 다잼 로고 (SVG, PNG @1x/2x/3x)
- [ ] 앱 아이콘 세트 (각 서브 브랜드별)
- [ ] 소셜 공유 이미지 (OG Image 템플릿)
- [ ] 프레젠테이션 템플릿 (영업용)
- [ ] 이메일 템플릿 (뉴스레터, 알림)

### 10.2 경쟁사 참고 URL

| 서비스 | URL | 벤치마킹 포인트 |
|--------|-----|-----------------|
| Kahoot | kahoot.com | 게이미피케이션 UX |
| Slido | slido.com | Q&A 시스템 |
| 퀴즈앤 | quizn.show | 초성 퀴즈, 보드 |
| 심플로우 | symflow.com | 발표 싱크 |
| 땡기지 | thankage.com | 대규모 동시접속 |
| 젭퀴즈 | zep.us/quiz | HWP+AI |

### 10.3 측정 지표 (KPIs)

| 지표 | 현재 | 목표 (6개월) |
|------|------|-------------|
| MAU | - | 10,000 |
| 유료 전환율 | - | 3% |
| 세션당 참여율 | - | 85% |
| NPS | - | 50+ |
| 평균 세션 시간 | - | 15분 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 2.0 | 2025-12-23 | AI Assistant | 초안 작성 |
| 2.1 | 2025-12-23 | AI Assistant | 상품화 전략 추가, 로드맵 구체화 |

---

*이 문서는 한국형 인터랙티브 ARS 시장 분석 보고서와 다잼 브랜딩 가이드라인 Ver 2.0을 기반으로 작성되었습니다.*
