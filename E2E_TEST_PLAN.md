# E2E Test Plan - SeolCoding Apps

## Overview

Playwright 기반 End-to-End 테스트 계획서

**참고 자료:**
- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Playwright Best Practices 2025](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/)
- APPS_DOCUMENTATION.md (앱별 테스트 시나리오)
- ARCHITECTURE_SPEC.md (기술 아키텍처)

---

## Test Strategy

### 1. Test Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  ← 사용자 플로우 검증 (Playwright)
        │   (16 apps)     │
        ├─────────────────┤
        │ Integration     │  ← 컴포넌트 통합 검증
        │   Tests         │
        ├─────────────────┤
        │    Unit Tests   │  ← 유틸리티 함수 검증
        │                 │
        └─────────────────┘
```

### 2. Test Categories

| Category | Description | Tools |
|----------|-------------|-------|
| **Scenario Tests** | 사용자 시나리오 기반 E2E | Playwright |
| **UI Tests** | 컴포넌트 렌더링 검증 | Playwright |
| **Smart Tests** | 접근성, 반응형, 성능 | axe-core, Lighthouse |

---

## Best Practices Applied

### From [Playwright 2025 Guide](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/)

1. **Page Object Model (POM)**: 각 앱별 Page Object 클래스 생성
2. **Auto-waiting**: 수동 wait 대신 Playwright 내장 대기 활용
3. **Test Fixtures**: 공통 설정 및 정리 로직 분리
4. **Parallel Execution**: CI에서 병렬 테스트 실행
5. **Visual Regression**: 스크린샷 기반 UI 검증

### From [Next.js Testing Docs](https://nextjs.org/docs/app/guides/testing)

1. **E2E for async Server Components**: SSG/SSR 컴포넌트는 E2E로 테스트
2. **webServer config**: Next.js dev server 자동 시작
3. **Production build testing**: 실제 환경과 유사한 테스트

---

## Test Structure

```
e2e/
├── fixtures/
│   ├── test-fixtures.ts      # 공통 fixtures
│   └── app-fixtures.ts       # 앱별 fixtures
├── pages/                    # Page Object Models
│   ├── base.page.ts          # 기본 페이지 클래스
│   ├── home.page.ts          # 홈페이지
│   ├── calculator/           # 계산기 앱
│   │   ├── salary.page.ts
│   │   ├── rent.page.ts
│   │   ├── gpa.page.ts
│   │   └── dutch-pay.page.ts
│   ├── game/                 # 게임 앱
│   │   ├── ideal-worldcup.page.ts
│   │   ├── balance-game.page.ts
│   │   ├── chosung-quiz.page.ts
│   │   ├── ladder-game.page.ts
│   │   └── bingo-game.page.ts
│   └── utility/              # 유틸리티 앱
│       ├── live-voting.page.ts
│       ├── random-picker.page.ts
│       ├── team-divider.page.ts
│       ├── lunch-roulette.page.ts
│       ├── group-order.page.ts
│       ├── id-validator.page.ts
│       └── student-network.page.ts
├── scenarios/                # 시나리오 테스트
│   ├── calculator/
│   │   ├── salary-calculator.spec.ts
│   │   ├── rent-calculator.spec.ts
│   │   ├── gpa-calculator.spec.ts
│   │   └── dutch-pay.spec.ts
│   ├── game/
│   │   ├── ideal-worldcup.spec.ts
│   │   ├── balance-game.spec.ts
│   │   ├── chosung-quiz.spec.ts
│   │   ├── ladder-game.spec.ts
│   │   └── bingo-game.spec.ts
│   └── utility/
│       ├── live-voting.spec.ts
│       ├── random-picker.spec.ts
│       ├── team-divider.spec.ts
│       ├── lunch-roulette.spec.ts
│       ├── group-order.spec.ts
│       ├── id-validator.spec.ts
│       └── student-network.spec.ts
├── smart/                    # 스마트 테스트
│   ├── accessibility.spec.ts # 접근성 테스트
│   ├── responsive.spec.ts    # 반응형 테스트
│   └── performance.spec.ts   # 성능 테스트
└── utils/
    ├── test-utils.ts         # 공통 유틸리티
    └── test-data.ts          # 테스트 데이터
```

---

## App-Specific Test Scenarios

### Category 1: 계산기 (4개)

#### 1.1 급여 계산기 (`/salary-calculator`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 연봉 입력 후 계산 | 1. 연봉 5000만원 입력 2. 계산 버튼 클릭 | 실수령액, 4대보험, 세금 표시 |
| 차트 렌더링 | 계산 완료 후 | 공제 항목 차트 표시 |
| 시뮬레이터 | 슬라이더 조작 | 실시간 결과 업데이트 |
| 부양가족 설정 | 부양가족 수 변경 | 세금 공제 반영 |

#### 1.2 전월세 계산기 (`/rent-calculator`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 전세→월세 변환 | 1. 전세금 입력 2. 금리 설정 | 월세 환산액 표시 |
| 비용 비교 | 입력 완료 후 | 2년 비용 비교 차트 |
| 슬라이더 작동 | 금리 슬라이더 조작 | 실시간 계산 |

#### 1.3 학점 계산기 (`/gpa-calculator`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 학기 추가 | 1. 학기 추가 버튼 2. 과목 입력 | 학기 카드 추가 |
| GPA 계산 | 과목/학점 입력 후 | 평점 계산 결과 |
| 데이터 저장 | 입력 후 새로고침 | IndexedDB에서 복원 |

#### 1.4 더치페이 (`/dutch-pay`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 참가자 추가 | 이름 입력 후 추가 | 참가자 목록 표시 |
| 지출 추가 | 금액, 항목, 분배 설정 | 지출 목록 표시 |
| 정산 계산 | 모든 입력 후 | 최적화된 정산 결과 |

---

### Category 2: 게임 (5개)

#### 2.1 이상형 월드컵 (`/ideal-worldcup`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 토너먼트 생성 | 1. 제목 입력 2. 이미지 업로드 | 토너먼트 준비 완료 |
| 매치 진행 | 두 후보 중 선택 | 다음 라운드 진행 |
| 우승자 결정 | 최종 매치 완료 | 우승자 표시 + 공유 |

#### 2.2 밸런스 게임 (`/balance-game`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 카테고리 선택 | 6개 중 선택 | 해당 질문 세트 로드 |
| 선택 진행 | A/B 선택 | 다음 질문 표시 |
| 결과 확인 | 모든 질문 완료 | 선택 통계 차트 |

#### 2.3 초성 퀴즈 (`/chosung-quiz`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 게임 시작 | 카테고리 선택 | 초성 문제 표시 |
| 타이머 작동 | 게임 진행 중 | 카운트다운 표시 |
| 정답 입력 | 정답 제출 | 정답/오답 피드백 |
| 힌트 사용 | 힌트 버튼 클릭 | 글자 힌트 표시 |

#### 2.4 사다리 게임 (`/ladder-game`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 참가자 입력 | 이름 입력 | 참가자 표시 |
| 결과 입력 | 결과 항목 입력 | 결과 표시 |
| 사다리 생성 | 생성 버튼 클릭 | Canvas 사다리 렌더링 |
| 경로 추적 | 참가자 클릭 | 애니메이션 경로 표시 |

#### 2.5 빙고 게임 (`/bingo-game`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 호스트 모드 | 새 게임 생성 | 빙고판 + 게임 코드 |
| 플레이어 모드 | 코드로 참여 | 빙고판 표시 |
| 셀 선택 | 셀 클릭 | 선택 표시 |
| 빙고 감지 | 한 줄 완성 | 빙고 알림 |

---

### Category 3: 유틸리티 (7개)

#### 3.1 실시간 투표 (`/live-voting`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 투표 생성 | 제목, 옵션 입력 | 투표 페이지 + QR |
| QR 코드 | 생성 완료 | QR 코드 표시 |
| 투표 참여 | 옵션 선택 | 결과 업데이트 |
| 실시간 동기화 | 다른 탭에서 투표 | 즉시 반영 |

#### 3.2 랜덤 뽑기 (`/random-picker`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 항목 추가 | 항목 입력 | 휠에 항목 추가 |
| 휠 회전 | 돌리기 버튼 | 애니메이션 회전 |
| 결과 표시 | 회전 완료 | 당첨 결과 모달 |
| 히스토리 | 여러 번 회전 | 결과 히스토리 |

#### 3.3 팀 나누기 (`/team-divider`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 참가자 입력 | 이름 입력 | 참가자 목록 |
| 팀 수 설정 | 팀 수 선택 | 설정 반영 |
| 팀 분배 | 분배 버튼 | 랜덤 팀 결과 |
| QR/PDF | 내보내기 | QR 코드, PDF 다운로드 |

#### 3.4 점심 룰렛 (`/lunch-roulette`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 위치 권한 | 앱 로드 | 위치 권한 요청 |
| 카테고리 선택 | 룰렛 돌리기 | 음식 카테고리 선택 |
| 맛집 검색 | 카테고리 결정 | Kakao API 결과 (API 키 필요) |

#### 3.5 단체 주문 (`/group-order`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 주문방 생성 | 정보 입력 | 주문방 + QR 코드 |
| 참여 | QR 스캔 | 주문 페이지 |
| 주문 추가 | 메뉴 입력 | 실시간 집계 |
| 주문서 | 마감 후 | 전체 주문 요약 |

#### 3.6 신분증 검증기 (`/id-validator`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 주민번호 검증 | 번호 입력 | 유효성 결과 |
| 사업자번호 검증 | 번호 입력 | 유효성 결과 |
| 테스트 번호 생성 | 생성 버튼 | 유효한 테스트 번호 |
| 자동 포맷팅 | 입력 중 | 하이픈 자동 삽입 |

#### 3.7 수강생 네트워킹 (`/student-network`)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| 프로필 생성 | 정보 입력 | 프로필 카드 |
| 룸 생성 | 생성 버튼 | 룸 코드 생성 |
| 룸 참여 | 코드 입력 | 룸 입장 |
| 관심사 매칭 | 참가자 입장 후 | 매칭 점수 표시 |

---

## Smart Tests

### Accessibility (접근성)

```typescript
// axe-core 기반 접근성 검사
test('모든 앱 WCAG 2.1 AA 준수', async ({ page }) => {
  for (const route of APP_ROUTES) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
});
```

**검사 항목:**
- 키보드 네비게이션
- 스크린 리더 호환성
- 색상 대비
- ARIA 레이블

### Responsive (반응형)

| Viewport | Width | Height | 검사 항목 |
|----------|-------|--------|-----------|
| Mobile | 375px | 667px | 가로 스크롤 없음, 터치 타겟 크기 |
| Tablet | 768px | 1024px | 레이아웃 변경 |
| Desktop | 1280px | 720px | 전체 UI 표시 |
| Widescreen | 1920px | 1080px | 중앙 정렬 |

### Performance (성능)

```typescript
// Core Web Vitals 측정
test('LCP < 2.5s, FID < 100ms, CLS < 0.1', async ({ page }) => {
  await page.goto('/');
  const metrics = await measureWebVitals(page);
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.fid).toBeLessThan(100);
  expect(metrics.cls).toBeLessThan(0.1);
});
```

---

## Test Execution

### Local Development

```bash
# 테스트 실행
npm run test:e2e

# UI 모드
npm run test:e2e:ui

# 특정 앱만 테스트
npm run test:e2e -- --grep "salary-calculator"

# 병렬 실행 (4 workers)
npm run test:e2e -- --workers=4
```

### CI/CD (GitHub Actions)

```yaml
- name: Run E2E Tests
  run: |
    npm run build
    npm run test:e2e
  env:
    CI: true
```

---

## Test Data

### 계산기 테스트 데이터

```typescript
const SALARY_TEST_DATA = {
  annual: [30_000_000, 50_000_000, 80_000_000, 100_000_000],
  dependents: [1, 2, 3, 4],
};

const RENT_TEST_DATA = {
  deposit: [100_000_000, 200_000_000, 300_000_000],
  rate: [3.5, 4.0, 4.5, 5.0],
};
```

### 게임 테스트 데이터

```typescript
const PARTICIPANTS = ['김철수', '이영희', '박민수', '최수진'];
const GAME_OPTIONS = ['A', 'B'];
```

---

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Scenario Coverage | 100% | 0% |
| UI Coverage | 90% | 0% |
| Accessibility | 100% pass | N/A |
| Responsive | 4 viewports | N/A |

---

## Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| Phase 1 | 환경 설정 + POM 패턴 | 1 session |
| Phase 2 | 계산기 앱 테스트 (4개) | 1 session |
| Phase 3 | 게임 앱 테스트 (5개) | 1 session |
| Phase 4 | 유틸리티 앱 테스트 (7개) | 1 session |
| Phase 5 | 스마트 테스트 + CI 연동 | 1 session |

---

## Sources

- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Playwright E2E Guide 2025](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/)
- [Efficient E2E Testing for Next.js](https://ray.run/blog/testing-nextjs-apps-using-playwright)
- [Building 100+ Test Cases](https://dev.to/bugslayer/building-a-comprehensive-e2e-test-suite-with-playwright-lessons-from-100-test-cases-171k)
