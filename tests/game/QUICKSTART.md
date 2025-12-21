# Game Tests - Quick Start Guide

## 빠른 실행

### 1단계: 개발 서버 시작

```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps

# 모든 앱 동시 실행 (권장)
pnpm dev

# 또는 개별 앱 실행
pnpm --filter ideal-worldcup dev    # Port 5173
pnpm --filter balance-game dev      # Port 5174
pnpm --filter chosung-quiz dev      # Port 5175
pnpm --filter bingo-game dev        # Port 5176
```

### 2단계: 테스트 실행

```bash
# 모든 게임 테스트 실행
pnpm test tests/game/

# UI 모드로 실행 (시각적 디버깅)
pnpm test:ui tests/game/

# 특정 앱만 테스트
pnpm test tests/game/ideal-worldcup.spec.ts
pnpm test tests/game/balance-game.spec.ts
pnpm test tests/game/chosung-quiz.spec.ts
pnpm test tests/game/bingo-game.spec.ts

# 특정 테스트 스위트만 실행
pnpm test tests/game/ideal-worldcup.spec.ts -g "홈 화면"
pnpm test tests/game/balance-game.spec.ts -g "커스텀 질문"
```

## 주요 테스트 명령어

### 디버깅
```bash
# 브라우저를 띄워서 실행 (headed mode)
pnpm test:headed tests/game/ideal-worldcup.spec.ts

# 디버그 모드 (step-by-step)
pnpm test:debug tests/game/ideal-worldcup.spec.ts

# 특정 테스트만 디버그
pnpm test:debug tests/game/ideal-worldcup.spec.ts -g "정상적으로 로드됨"
```

### 리포트
```bash
# 테스트 실행 후 리포트 보기
pnpm exec playwright show-report

# 특정 브라우저만 테스트
pnpm test tests/game/ --project=chromium
pnpm test tests/game/ --project=mobile
```

### 스크린샷/비디오
```bash
# 실패 시 스크린샷 자동 저장 (기본값)
# 위치: test-results/

# 모든 테스트 스크린샷 저장
pnpm test tests/game/ --screenshot=on

# 비디오 녹화
pnpm test tests/game/ --video=on
```

## 테스트 범위 요약

### 이상형 월드컵 (44 tests)
- ✅ 토너먼트 생성 및 이미지 업로드
- ✅ 매치 플레이 및 뒤로가기
- ✅ 결과 화면 및 공유
- ✅ 반응형 UI (모바일/태블릿/데스크톱)
- ✅ 접근성 (키보드, 스크린리더)

### 밸런스 게임 (43 tests)
- ✅ 카테고리별 질문 필터링
- ✅ 커스텀 질문 생성 및 공유
- ✅ 투표 결과 차트 (Recharts)
- ✅ 스와이프 제스처 (모바일)
- ✅ 로컬스토리지 투표 기록

### 초성 퀴즈 (48 tests)
- ✅ 게임 설정 (카테고리/난이도/문제수)
- ✅ 타이머 및 점수 시스템
- ✅ 힌트 시스템 (점수 차감)
- ✅ 한글 초성 처리 (es-hangul)
- ✅ 정답/오답 피드백

### 빙고 게임 (55 tests)
- ✅ 호스트/플레이어 모드
- ✅ 그리드 크기 (3x3, 4x4, 5x5)
- ✅ 빙고 타입 (숫자, 테마, 커스텀)
- ✅ 멀티플레이어 실시간 동기화
- ✅ 다크모드 지원

**총 190개 테스트 케이스**

## 문제 해결

### 테스트 실패 시

1. **서버가 실행 중인지 확인**
   ```bash
   # 각 앱의 포트 확인
   lsof -i :5173  # ideal-worldcup
   lsof -i :5174  # balance-game
   lsof -i :5175  # chosung-quiz
   lsof -i :5176  # bingo-game
   ```

2. **브라우저 캐시 문제**
   ```bash
   # Playwright 브라우저 재설치
   pnpm exec playwright install --with-deps
   ```

3. **타임아웃 에러**
   ```bash
   # playwright.config.ts에서 timeout 증가
   # use: { timeout: 30000 } → timeout: 60000
   ```

4. **포트 충돌**
   ```bash
   # 이미 사용 중인 포트 종료
   kill $(lsof -ti:5173)
   ```

### 일반적인 에러

#### "Timed out waiting for..."
- 개발 서버가 시작되지 않았거나 느림
- `playwright.config.ts`의 `webServer.timeout` 증가

#### "Element not found"
- 실제 UI 구현과 테스트 selector 불일치
- `data-testid` 속성 추가 또는 수정 필요

#### "Navigation timeout"
- 네트워크 문제 또는 앱 로딩 느림
- `page.goto()` timeout 옵션 조정

## 베스트 프랙티스

### 1. 테스트 작성 시
```typescript
// ✅ 좋은 예: 명확한 테스트 이름
test('빈 제목으로 제출 시 경고 메시지 표시', async ({ page }) => {
  // ...
});

// ❌ 나쁜 예: 모호한 테스트 이름
test('테스트1', async ({ page }) => {
  // ...
});
```

### 2. Selector 우선순위
```typescript
// 1순위: Role-based (접근성)
page.getByRole('button', { name: '시작' })

// 2순위: Label (폼 요소)
page.getByLabel('이름')

// 3순위: Text
page.getByText('안녕하세요')

// 4순위: Test ID
page.locator('[data-testid="submit-button"]')

// 최후: CSS/XPath
page.locator('.btn-primary')
```

### 3. 대기 방법
```typescript
// ✅ 좋은 예: 자동 대기
await expect(page.getByText('로딩 완료')).toBeVisible();

// ❌ 나쁜 예: 하드코딩된 대기
await page.waitForTimeout(3000);
```

### 4. 테스트 격리
```typescript
test.describe('게임', () => {
  // 각 테스트 전에 초기화
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // 로컬스토리지 초기화
    await page.evaluate(() => localStorage.clear());
  });

  test('테스트1', async ({ page }) => {
    // 독립적으로 실행
  });
});
```

## 유용한 팁

### 디버깅 도구
```typescript
// 1. 페이지 상태 확인
await page.pause(); // Inspector 열기

// 2. 콘솔 로그 확인
page.on('console', msg => console.log(msg.text()));

// 3. 스크린샷 촬영
await page.screenshot({ path: 'debug.png' });

// 4. HTML 덤프
const html = await page.content();
console.log(html);
```

### 조건부 실행
```typescript
// 특정 조건에서만 테스트
test.skip(process.env.CI !== 'true', '로컬에서만 실행');

// 특정 브라우저만
test.skip(({ browserName }) => browserName !== 'chromium');
```

### 병렬 실행 제어
```typescript
// 순차 실행 (데이터베이스 테스트 등)
test.describe.serial('순차 테스트', () => {
  test('테스트1', async ({ page }) => { });
  test('테스트2', async ({ page }) => { });
});

// 재시도 설정
test('불안정한 테스트', async ({ page }) => {
  test.slow(); // timeout 3배 증가
});
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev)
- [테스트 베스트 프랙티스](https://playwright.dev/docs/best-practices)
- [상세 가이드](./README.md)

---

**업데이트**: 2024-12-20
