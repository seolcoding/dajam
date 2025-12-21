# SeolCoding Apps - 전체 앱 목록 및 URL

## 개발 서버

```bash
cd /Users/sdh/Dev/02_production/seolcoding-apps
npm run dev
```

**기본 포트:** `http://localhost:3000`

---

## 📱 앱 목록 (총 16개)

### 🧮 계산기 (4개)

| 번호 | 앱 이름 | URL | 주요 기능 |
|------|---------|-----|-----------|
| 1 | 급여 계산기 | `/salary-calculator` | 연봉/월급 실수령액 계산, 4대보험, 세금 계산 |
| 2 | 전월세 계산기 | `/rent-calculator` | 전세↔월세 변환, 2년 비용 비교, 손익분기점 분석 |
| 3 | 학점 계산기 | `/gpa-calculator` | 학기별 GPA 관리, 목표 학점 시뮬레이터 |
| 4 | 더치페이 | `/dutch-pay` | 정산 금액 계산, 거래 추적, 결과 공유 |

### 🎮 게임 (5개)

| 번호 | 앱 이름 | URL | 주요 기능 |
|------|---------|-----|-----------|
| 5 | 이상형 월드컵 | `/ideal-worldcup` | 토너먼트 생성, 이미지 업로드, 우승자 선정 |
| 6 | 밸런스 게임 | `/balance-game` | 36개 질문, 6개 카테고리, 결과 공유 |
| 7 | 초성 퀴즈 | `/chosung-quiz` | 4개 카테고리, 타이머, 힌트 시스템 |
| 8 | 사다리 게임 | `/ladder-game` | 3D 렌더링, 애니메이션 경로 추적 |
| 9 | 빙고 게임 | `/bingo-game` | 호스트/플레이어 모드, 9개 테마 |

### 🔧 유틸리티 (7개)

| 번호 | 앱 이름 | URL | 주요 기능 |
|------|---------|-----|-----------|
| 10 | 실시간 투표 | `/live-voting` | 3가지 투표 유형, QR 코드, 실시간 동기화 |
| 11 | 랜덤 뽑기 | `/random-picker` | Canvas 휠, 암호학적 랜덤, 히스토리 추적 |
| 12 | 팀 나누기 | `/team-divider` | Fisher-Yates 알고리즘, QR 코드, PDF 내보내기 |
| 13 | 점심 룰렛 | `/lunch-roulette` | Kakao Maps API, 위치 기반 검색, 카테고리 룰렛 |
| 14 | 단체 주문 | `/group-order` | 실시간 주문 집계, QR 코드, 주문서 생성 |
| 15 | 신분증 검증기 | `/id-validator` | 주민번호/사업자/법인번호 검증 |
| 16 | 수강생 네트워킹 | `/student-network` | 관심사 매칭, 아이스브레이커, 프로필 카드 |

---

## 🧪 검증 체크리스트

### 계산기 앱

- [ ] **급여 계산기** (`/salary-calculator`)
  - [ ] 연봉 입력 후 실수령액 계산 확인
  - [ ] 차트 렌더링 확인
  - [ ] 시뮬레이터 슬라이더 작동 확인

- [ ] **전월세 계산기** (`/rent-calculator`)
  - [ ] 전세→월세 변환 계산 확인
  - [ ] 비용 비교 차트 확인
  - [ ] 슬라이더 작동 확인

- [ ] **학점 계산기** (`/gpa-calculator`)
  - [ ] 학기 추가 및 과목 입력 확인
  - [ ] GPA 계산 확인
  - [ ] IndexedDB 저장 확인

- [ ] **더치페이** (`/dutch-pay`)
  - [ ] 참가자 추가 확인
  - [ ] 지출 추가 확인
  - [ ] 정산 결과 계산 확인

### 게임 앱

- [ ] **이상형 월드컵** (`/ideal-worldcup`)
  - [ ] 토너먼트 생성 확인
  - [ ] 이미지 업로드 확인
  - [ ] 매치 진행 확인

- [ ] **밸런스 게임** (`/balance-game`)
  - [ ] 카테고리 선택 확인
  - [ ] 질문 표시 및 선택 확인
  - [ ] 결과 차트 확인

- [ ] **초성 퀴즈** (`/chosung-quiz`)
  - [ ] 카테고리 선택 확인
  - [ ] 타이머 작동 확인
  - [ ] 정답/오답 피드백 확인

- [ ] **사다리 게임** (`/ladder-game`)
  - [ ] 참가자/결과 입력 확인
  - [ ] 사다리 렌더링 확인
  - [ ] 경로 애니메이션 확인

- [ ] **빙고 게임** (`/bingo-game`)
  - [ ] 호스트 모드 확인
  - [ ] 플레이어 모드 확인
  - [ ] 빙고 감지 확인

### 유틸리티 앱

- [ ] **실시간 투표** (`/live-voting`)
  - [ ] 투표 생성 확인
  - [ ] QR 코드 생성 확인
  - [ ] 실시간 결과 업데이트 확인

- [ ] **랜덤 뽑기** (`/random-picker`)
  - [ ] 항목 추가 확인
  - [ ] 휠 회전 확인
  - [ ] 결과 표시 확인

- [ ] **팀 나누기** (`/team-divider`)
  - [ ] 참가자 입력 확인
  - [ ] 팀 분배 확인
  - [ ] QR 코드 생성 확인

- [ ] **점심 룰렛** (`/lunch-roulette`)
  - [ ] 위치 권한 확인
  - [ ] 카테고리 룰렛 확인
  - [ ] Kakao API 연동 확인 (API 키 필요)

- [ ] **단체 주문** (`/group-order`)
  - [ ] 주문방 생성 확인
  - [ ] QR 코드 생성 확인
  - [ ] 실시간 주문 집계 확인

- [ ] **신분증 검증기** (`/id-validator`)
  - [ ] 주민번호 검증 확인
  - [ ] 테스트 번호 생성 확인
  - [ ] 자동 포맷팅 확인

- [ ] **수강생 네트워킹** (`/student-network`)
  - [ ] 프로필 생성 확인
  - [ ] 룸 생성/참여 확인
  - [ ] 관심사 매칭 확인

---

## 📝 환경 변수 필요 앱

### lunch-roulette
```env
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_api_key
```
**취득:** https://developers.kakao.com/

---

## 🚀 빌드 및 배포

### 로컬 빌드
```bash
cd /Users/sdh/Dev/02_production/seolcoding-apps
npm run build
```

### 프로덕션 실행
```bash
npm run start
```

### Vercel 배포
```bash
vercel deploy
```

---

## 📂 프로젝트 구조

```
seolcoding-apps/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 (앱 갤러리)
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css                 # 전역 CSS
│   │   ├── salary-calculator/          # 각 앱 디렉토리
│   │   ├── rent-calculator/
│   │   ├── gpa-calculator/
│   │   ├── dutch-pay/
│   │   ├── ideal-worldcup/
│   │   ├── balance-game/
│   │   ├── chosung-quiz/
│   │   ├── ladder-game/
│   │   ├── bingo-game/
│   │   ├── live-voting/
│   │   ├── random-picker/
│   │   ├── team-divider/
│   │   ├── lunch-roulette/
│   │   ├── group-order/
│   │   ├── id-validator/
│   │   └── student-network/
│   ├── components/
│   │   └── ui/                         # shadcn/ui 컴포넌트
│   └── lib/
│       └── utils.ts                    # 유틸리티
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🎯 다음 단계

1. **검증 테스트** - 각 앱 브라우저에서 수동 테스트
2. **빌드 테스트** - `npm run build` 실행하여 프로덕션 빌드 확인
3. **커밋** - 변경사항 커밋
4. **푸시** - GitHub 푸시
5. **배포** - Vercel 배포

---

## 📊 통계

- **총 앱 수:** 16개
- **총 마이그레이션 파일:** 약 200+ 파일
- **추가된 의존성:** 7개
- **신규 생성 컴포넌트:** 2개 (NumberInput, QRCode)
- **프레임워크:** Next.js 15 App Router
- **UI 라이브러리:** shadcn/ui
- **상태 관리:** Zustand (8개 앱)
- **차트:** Recharts (5개 앱)
