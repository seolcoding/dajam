# SeolCoding Apps - 미니 앱 모음

> **"소규모 인원이 같은 공간에서, 모바일/PC/오프라인 경험을 하나로 묶어 서로의 의견을 통합하는 앱"**

16개의 실용적인 웹 앱을 모아놓은 Next.js 15 프로젝트입니다.

## 💡 핵심 가치

- **🔄 실시간 인터랙션** - 같은 공간의 사람들이 동시에 참여
- **📱 디바이스 통합** - 모바일/PC/태블릿 동일 경험
- **⚡ 즉시 참여** - QR코드/6자리 코드로 회원가입 없이 참여
- **📊 의견 통합** - 투표, 선택, 순위를 시각적으로 집계

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 📱 포함된 앱 (16개)

### 🔥 Core - 실시간 멀티유저 (3개)
- **실시간 투표** - QR 코드로 즉시 참여, 3가지 투표 유형
- **단체 주문** - 실시간 주문 집계, 정산 자동화
- **빙고 게임** - 호스트/플레이어 모드, 실시간 동기화

### ⚡ High - 의견 통합 + 공유 (3개)
- **밸런스 게임** - 양자택일 투표, 통계 시각화
- **이상형 월드컵** - 토너먼트 대결, 결과 공유
- **수강생 네트워킹** - 관심사 매칭, 룸 기반 교류

### 📊 Medium - 같이하기 (오프라인) (3개)
- **사다리 게임** - 공정한 추첨, 결과 공유
- **팀 나누기** - Fisher-Yates 알고리즘, QR/PDF 내보내기
- **초성 퀴즈** - 멀티플레이어 모드 지원

### 🔧 Utility - 개인 도구 (7개)
- **급여 계산기** - 2025년 기준 4대보험 & 세금 계산
- **전월세 계산기** - 전세↔월세 변환 및 비용 비교
- **학점 계산기** - 학기별 GPA 관리 및 시뮬레이터
- **더치페이** - N빵 정산 금액 자동 계산
- **랜덤 뽑기** - 암호학적으로 안전한 룰렛
- **점심 룰렛** - Kakao Maps 기반 맛집 추천
- **신분증 검증기** - 주민번호/사업자/법인번호 검증

## 🛠️ 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **Database:** Dexie (IndexedDB)
- **Animation:** Framer Motion, CSS Keyframes

## 📦 주요 의존성

```json
{
  "next": "15.1.0",
  "react": "19.0.0",
  "zustand": "5.0.3",
  "recharts": "2.15.0",
  "es-hangul": "2.3.8",
  "dexie": "4.2.1",
  "framer-motion": "12.23.26",
  "react-custom-roulette": "1.4.1",
  "react-dropzone": "14.3.8",
  "canvas-confetti": "1.9.3"
}
```

## 🌍 환경 변수

### 필수 (점심 룰렛)
```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_api_key
```

Kakao API 키 발급: https://developers.kakao.com/

## 🧪 테스트

### 전체 앱 HTTP 테스트
```bash
./test-all-routes.sh
```

### 개별 앱 테스트
브라우저에서 각 URL 접속:
- http://localhost:3000/salary-calculator
- http://localhost:3000/rent-calculator
- ... (전체 목록은 APPS_DOCUMENTATION.md 참조)

## 🏗️ 빌드

### 개발 빌드
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm run start
```

## 📂 프로젝트 구조

```
seolcoding-apps/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 (앱 갤러리)
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css                 # 전역 CSS + 애니메이션
│   │   ├── salary-calculator/          # 개별 앱 디렉토리
│   │   ├── ... (16개 앱)
│   ├── components/
│   │   └── ui/                         # shadcn/ui 컴포넌트
│   └── lib/
│       └── utils.ts                    # 유틸리티
├── public/                             # 정적 파일
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

## 🎨 UI/UX 특징

- **현대적인 디자인** - 그라디언트, 블러, 섀도우 효과
- **부드러운 애니메이션** - Framer Motion, CSS Keyframes
- **반응형** - Mobile-first 디자인
- **접근성** - WCAG AA 준수 (Radix UI)
- **다크모드 지원** (전역 CSS 설정)

## 📄 관련 문서

- **APPS_DOCUMENTATION.md** - 전체 앱 목록 및 URL
- **VERIFICATION_REPORT.md** - 마이그레이션 검증 리포트
- **MIGRATION_PLAN.md** - 마이그레이션 계획서

## 🤝 기여

이슈 및 PR 환영합니다!

## 📜 라이선스

MIT License

## 👨‍💻 제작

SeolCoding - https://seolcoding.com
