# Game Category E2E Tests

## 개요

이 디렉토리는 mini-apps의 게임 카테고리 앱들에 대한 종합적인 Playwright E2E 테스트를 포함합니다.

## 테스트 대상 앱

### 1. 이상형 월드컵 (ideal-worldcup)
- **URL**: `http://localhost:5173/mini-apps/ideal-worldcup/`
- **파일**: `ideal-worldcup.spec.ts`
- **테스트 스위트**: 15개
- **주요 기능**:
  - 토너먼트 생성 및 이미지 업로드
  - 1:1 대결 매치 시스템
  - 뒤로가기 및 히스토리 관리
  - 결과 화면 및 공유

### 2. 밸런스 게임 (balance-game)
- **URL**: `http://localhost:5173/mini-apps/balance-game/`
- **파일**: `balance-game.spec.ts`
- **테스트 스위트**: 16개
- **주요 기능**:
  - 카테고리별 질문 필터링
  - 커스텀 질문 생성 및 공유
  - 투표 결과 차트 (Recharts)
  - 스와이프 제스처 (모바일)
  - 로컬스토리지 기반 투표 기록

### 3. 초성 퀴즈 (chosung-quiz)
- **URL**: `http://localhost:5173/mini-apps/chosung-quiz/`
- **파일**: `chosung-quiz.spec.ts`
- **테스트 스위트**: 13개
- **주요 기능**:
  - 카테고리, 난이도, 문제 수 설정
  - 타이머 및 점수 시스템
  - 힌트 시스템 (점수 차감)
  - 한글 초성 추출 (es-hangul)
  - 정답/오답 피드백

### 4. 빙고 게임 (bingo-game)
- **URL**: `http://localhost:5173/mini-apps/bingo-game/`
- **파일**: `bingo-game.spec.ts`
- **테스트 스위트**: 17개
- **주요 기능**:
  - 호스트/플레이어 모드
  - 그리드 크기 (3x3, 4x4, 5x5)
  - 빙고 타입 (숫자, 테마, 커스텀)
  - 게임 코드 생성 및 참여
  - 실시간 멀티플레이어
  - 다크모드 지원

## 테스트 범위

### 1. Edge Cases
각 앱에서 다음 엣지 케이스를 테스트합니다:

#### 입력 검증
- ✅ 빈 입력 (empty strings)
- ✅ 공백만 있는 입력 (whitespace only)
- ✅ 특수문자 포함 입력
- ✅ 매우 긴 문자열 (200+ characters)
- ✅ 이모지 포함 입력
- ✅ 최대/최소 값 초과

#### 파일 처리 (이상형 월드컵)
- ✅ 잘못된 파일 형식
- ✅ 매우 큰 파일 (10MB+)
- ✅ 이미지 업로드 제한

#### URL 및 라우팅 (밸런스 게임)
- ✅ 존재하지 않는 ID
- ✅ URL 직접 접근
- ✅ 잘못된 해시 라우팅

#### 시간 관련 (초성 퀴즈)
- ✅ 타이머 카운트다운
- ✅ 시간 초과 처리
- ✅ 빠른 답변 제출

#### 멀티플레이어 (빙고 게임)
- ✅ 유효하지 않은 게임 코드
- ✅ 중복 단어 처리
- ✅ 실시간 동기화

### 2. UI Tests

#### 반응형 디자인
모든 앱에서 다음 뷰포트 테스트:
- **모바일**: 375×667 (iPhone SE)
- **태블릿**: 768×1024 (iPad)
- **데스크톱**: 1920×1080 (Full HD)

#### 버튼 상태
- ✅ Hover 효과
- ✅ Focus 상태
- ✅ Disabled 상태
- ✅ Active/Selected 상태

#### 로딩 및 전환
- ✅ 페이지 전환 애니메이션
- ✅ 로딩 스피너
- ✅ 프로그레스 바 업데이트

#### 에러 표시
- ✅ 경고 메시지 (alert)
- ✅ 인라인 에러 메시지
- ✅ 토스트 알림

### 3. 접근성 (Accessibility)

모든 앱에서 WCAG 준수 테스트:

#### 키보드 네비게이션
- ✅ Tab 키로 포커스 이동
- ✅ Enter/Space로 버튼 클릭
- ✅ 자동 포커스 (입력 필드)

#### 시맨틱 HTML
- ✅ 적절한 heading 레벨
- ✅ 버튼 vs 링크 구분
- ✅ Form 요소 레이블 연결

#### 스크린 리더
- ✅ Alt 텍스트 (이미지)
- ✅ ARIA 속성
- ✅ Role 속성

#### 시각적 피드백
- ✅ 포커스 인디케이터
- ✅ 색상 대비
- ✅ 비활성화 상태 명확성

### 4. E2E User Journeys

#### 이상형 월드컵
```
홈 → 토너먼트 생성 → 이미지 업로드 → 게임 시작 → 매치 플레이 → 결과 확인 → 공유
```

#### 밸런스 게임
```
홈 → 카테고리 선택 → 질문 선택 → 선택지 클릭 → 결과 차트 확인 → 공유
홈 → 질문 만들기 → 폼 작성 → 생성 → 공유 URL 복사 → 바로 플레이
```

#### 초성 퀴즈
```
설정 → 카테고리/난이도/문제수 선택 → 게임 시작 → 정답 입력 → 힌트 사용 → 결과 확인
```

#### 빙고 게임
```
메뉴 → 호스트 모드 → 게임 설정 → 게임 시작 → 셀 마킹 → 빙고 완성
메뉴 → 플레이어 모드 → 코드 입력 → 게임 참여 → 빙고 플레이
```

### 5. Multi-user Scenarios (빙고 게임)

#### 두 브라우저 컨텍스트 테스트
```typescript
test('호스트와 플레이어', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const playerContext = await browser.newContext();

  // 호스트: 게임 생성 → 코드 발급
  // 플레이어: 코드 입력 → 게임 참여
  // 실시간 동기화 확인
});
```

## 테스트 실행

### 전체 게임 테스트 실행
```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps

# 모든 게임 테스트 실행
pnpm test tests/game/

# 특정 앱만 테스트
pnpm test tests/game/ideal-worldcup.spec.ts
pnpm test tests/game/balance-game.spec.ts
pnpm test tests/game/chosung-quiz.spec.ts
pnpm test tests/game/bingo-game.spec.ts
```

### UI 모드로 실행
```bash
pnpm test:ui tests/game/
```

### 헤드리스 모드 (CI/CD)
```bash
pnpm test --headed tests/game/
```

### 디버그 모드
```bash
pnpm test:debug tests/game/ideal-worldcup.spec.ts
```

## 개발 서버 요구사항

테스트 실행 전에 각 앱의 개발 서버가 실행되어야 합니다:

```bash
# 터미널 1: 이상형 월드컵
pnpm --filter ideal-worldcup dev

# 터미널 2: 밸런스 게임
pnpm --filter balance-game dev

# 터미널 3: 초성 퀴즈
pnpm --filter chosung-quiz dev

# 터미널 4: 빙고 게임
pnpm --filter bingo-game dev
```

또는 `playwright.config.ts`의 `webServer` 설정으로 자동 시작.

## 테스트 구조

### 공통 패턴

```typescript
test.describe('앱 이름 - 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 초기화
    await page.goto(BASE_URL);
  });

  test('테스트 케이스 설명', async ({ page }) => {
    // 1. Arrange: 테스트 데이터 준비
    // 2. Act: 사용자 액션 수행
    // 3. Assert: 결과 검증
  });
});
```

### 헬퍼 함수 예시

```typescript
// 이미지 생성 헬퍼
async function createTestImage(name: string) {
  const pngBuffer = Buffer.from('...', 'base64');
  return { name, mimeType: 'image/png', buffer: pngBuffer };
}

// 게임 완료 헬퍼
async function completeAllQuestions(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await page.getByRole('button', { name: /패스/ }).click();
    await page.waitForTimeout(1500);
  }
}
```

## 테스트 커버리지

### 이상형 월드컵
- ✅ 홈 화면 (2 tests)
- ✅ 토너먼트 생성 Edge Cases (7 tests)
- ✅ 이미지 업로드 (3 tests)
- ✅ 반응형 UI (5 tests)
- ✅ 접근성 (4 tests)
- ✅ E2E 플로우 (3 tests)
- ✅ 결과 화면 (5 tests)
- ✅ 게임 상태 관리 (3 tests)
- ✅ 네트워크 에러 (2 tests)
- ✅ 버튼 상태 (3 tests)
- ✅ 매치 화면 (4 tests)
- ✅ 성능 (3 tests)

**총 44개 테스트 케이스**

### 밸런스 게임
- ✅ 홈 화면 (4 tests)
- ✅ 질문 선택 (3 tests)
- ✅ 게임 플레이 (4 tests)
- ✅ 반응형 UI (3 tests)
- ✅ 스와이프 제스처 (2 tests)
- ✅ 결과 화면 (5 tests)
- ✅ 커스텀 질문 생성 (8 tests)
- ✅ 로컬스토리지 (3 tests)
- ✅ 접근성 (3 tests)
- ✅ 네트워크/성능 (3 tests)
- ✅ 차트 표시 (3 tests)
- ✅ 공유 기능 (2 tests)

**총 43개 테스트 케이스**

### 초성 퀴즈
- ✅ 게임 설정 (6 tests)
- ✅ 게임 플레이 (10 tests)
- ✅ 힌트 시스템 (5 tests)
- ✅ 결과 화면 (4 tests)
- ✅ 반응형 UI (3 tests)
- ✅ 접근성 (6 tests)
- ✅ Edge Cases (6 tests)
- ✅ 난이도별 점수 (3 tests)
- ✅ 성능/네트워크 (3 tests)
- ✅ 한글 라이브러리 (2 tests)

**총 48개 테스트 케이스**

### 빙고 게임
- ✅ 메뉴 화면 (4 tests)
- ✅ 호스트 게임 설정 (11 tests)
- ✅ 호스트 게임 진행 (7 tests)
- ✅ 플레이어 참여 (7 tests)
- ✅ 반응형 UI (4 tests)
- ✅ 다크모드 (2 tests)
- ✅ 애니메이션 (3 tests)
- ✅ Edge Cases (4 tests)
- ✅ 접근성 (4 tests)
- ✅ 멀티플레이어 (2 tests)
- ✅ 성능 (3 tests)
- ✅ 빙고 완성 조건 (4 tests)

**총 55개 테스트 케이스**

## 전체 통계

- **총 테스트 파일**: 4개
- **총 테스트 스위트**: 61개
- **총 테스트 케이스**: 190개
- **예상 실행 시간**: ~15분 (전체, 병렬 실행 시)

## 주의사항

### 1. 테스트 데이터
- 이미지 업로드 테스트는 실제 이미지 파일 또는 Base64 인코딩 필요
- 커스텀 질문/단어는 테스트마다 고유 ID 생성
- 게임 코드는 6자리 랜덤 생성

### 2. 타이밍
- 애니메이션 완료 대기: `page.waitForTimeout(300-500)`
- 피드백 메시지 대기: `page.waitForTimeout(1500)`
- 타이머 테스트는 실제 시간 소요 (또는 모킹 필요)

### 3. 실시간 기능
- 멀티플레이어 테스트는 WebSocket/실시간 통신 구현에 의존
- 두 개의 브라우저 컨텍스트 사용
- 네트워크 지연 고려

### 4. 로컬스토리지
- 테스트 간 격리를 위해 `beforeEach`에서 초기화
- 브라우저 컨텍스트별로 독립적

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests - Game Apps

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: |
          cd agents/mini-apps
          pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run Game Tests
        run: |
          cd agents/mini-apps
          pnpm test tests/game/

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: agents/mini-apps/playwright-report/
```

## 추가 개선 사항

### 단기 (1-2주)
- [ ] 테스트 데이터 픽스처 분리
- [ ] 공통 헬퍼 함수 라이브러리
- [ ] 스크린샷 스냅샷 테스트
- [ ] Visual Regression Testing

### 중기 (1개월)
- [ ] 성능 벤치마크 테스트
- [ ] 접근성 자동 스캔 (axe-core)
- [ ] 크로스 브라우저 테스트 (Firefox, Safari)
- [ ] 모바일 디바이스 에뮬레이션

### 장기 (3개월)
- [ ] 부하 테스트 (멀티플레이어)
- [ ] E2E 테스트 커버리지 리포트
- [ ] 테스트 자동 생성 (AI 기반)
- [ ] 실제 디바이스 테스트 (BrowserStack)

## 문의 및 기여

테스트 관련 문의나 개선 제안은 이슈 또는 PR로 제출해주세요.

### 테스트 작성 가이드라인

1. **명확한 테스트 이름**: 무엇을 테스트하는지 설명
2. **독립적인 테스트**: 다른 테스트에 의존하지 않음
3. **AAA 패턴**: Arrange, Act, Assert
4. **적절한 대기**: `waitForSelector` 대신 `expect().toBeVisible()` 선호
5. **한글 주석**: 복잡한 로직은 한글로 설명

---

**작성일**: 2024-12-20
**작성자**: Claude (Opus 4.5)
**버전**: 1.0.0
