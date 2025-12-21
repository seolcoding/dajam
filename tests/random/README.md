# Random Category Apps - E2E Tests

이 디렉토리는 random 카테고리의 4개 앱에 대한 종합적인 Playwright E2E 테스트를 포함합니다.

## 테스트 대상 앱

### 1. Lunch Roulette (점심 룰렛) - `lunch-roulette.spec.ts`

**기능**: 위치 기반 2단계 룰렛 (카테고리 → 음식점)

**테스트 범위**:
- ✅ 위치 권한 및 Geolocation API
- ✅ 카테고리 룰렛 회전 및 선택
- ✅ Kakao Maps API 연동 (음식점 검색)
- ✅ 음식점 룰렛 및 결과 표시
- ✅ 반경 필터 조정
- ✅ 공유 기능 (SNS, 링크)
- ✅ 에러 처리 (위치 거부, 네트워크 오류, API 실패)
- ✅ 애니메이션 성능

**주요 Edge Cases**:
- 위치 권한 거부 시나리오
- 오프라인 모드
- API 응답 없을 때 처리
- 검색 결과 0개 케이스

---

### 2. Random Picker (랜덤 뽑기) - `random-picker.spec.ts`

**기능**: 룰렛 기반 항목 랜덤 선택

**테스트 범위**:
- ✅ 항목 추가/수정/삭제 (단일 & 일괄)
- ✅ 룰렛 회전 애니메이션
- ✅ 결과 모달 및 컨페티 효과
- ✅ 히스토리 패널 (과거 결과 보기)
- ✅ 설정 패널 (컨페티 on/off 등)
- ✅ 로컬 스토리지 영속성
- ✅ Canvas 렌더링
- ✅ 랜덤성 검증 (분포 테스트)

**주요 Edge Cases**:
- 빈 항목 입력 방지
- 특수문자 항목 (emoji, 기호)
- 매우 긴 텍스트 (100자+)
- 단일 항목 (회전 불가)
- 최대 항목 수 제한

---

### 3. Ladder Game (사다리 타기) - `ladder-game.spec.ts`

**기능**: 사다리 타기 경로 추적 및 결과 매칭

**테스트 범위**:
- ✅ 참가자 & 결과 입력 (동적 추가/삭제)
- ✅ 사다리 생성 알고리즘 (밀도 설정)
- ✅ Canvas 기반 경로 애니메이션
- ✅ 결과 모달 (참가자 → 결과 매칭)
- ✅ 테마 변경 (색상 커스터마이징)
- ✅ 리셋 기능
- ✅ 토스트 알림

**주요 Edge Cases**:
- 참가자 1명 (최소 2명 필요)
- 참가자/결과 개수 불일치
- 중복 이름 허용
- 매우 긴 이름 (50자+)
- 최대 참가자 수 (20명)

---

### 4. Team Divider (팀 나누기) - `team-divider.spec.ts`

**기능**: Fisher-Yates 알고리즘 기반 공정한 팀 분배

**테스트 범위**:
- ✅ 참가자 입력 (단일 & 일괄)
- ✅ 팀 설정 (팀 개수 vs 팀당 인원)
- ✅ 랜덤 셔플 및 분배
- ✅ QR 코드 생성 (팀별)
- ✅ 결과 내보내기 (이미지, 텍스트, CSV)
- ✅ 컨페티 효과
- ✅ 클립보드 복사
- ✅ 랜덤성 검증

**주요 Edge Cases**:
- 참가자 1명 (에러 처리)
- 홀수 인원 + 짝수 팀
- 매우 많은 참가자 (50명+)
- 팀 개수 0 또는 음수 (검증)
- 참가자보다 많은 팀 개수

---

## 테스트 실행 방법

### 1. 전체 random 카테고리 테스트

```bash
# mini-apps 루트에서
pnpm test tests/random/

# UI 모드로 실행
pnpm test:ui tests/random/

# 특정 브라우저만
pnpm test tests/random/ --project=chromium
pnpm test tests/random/ --project=mobile
```

### 2. 개별 앱 테스트

```bash
# Lunch Roulette
pnpm test tests/random/lunch-roulette.spec.ts

# Random Picker
pnpm test tests/random/random-picker.spec.ts

# Ladder Game
pnpm test tests/random/ladder-game.spec.ts

# Team Divider
pnpm test tests/random/team-divider.spec.ts
```

### 3. 헤드리스 모드 (CI/CD)

```bash
# 헤드리스 모드 (기본)
pnpm test tests/random/

# 헤드드 모드 (브라우저 보이기)
pnpm test:headed tests/random/

# 디버그 모드
pnpm test:debug tests/random/lunch-roulette.spec.ts
```

---

## 테스트 구조

각 테스트 파일은 다음 섹션으로 구성됩니다:

### 1. 초기 상태 및 UI
- 페이지 로드 확인
- 주요 UI 요소 가시성
- 초기 버튼 상태

### 2. 입력 기능
- 텍스트 입력
- 버튼 클릭
- 폼 검증
- 일괄 입력 (있을 경우)

### 3. 핵심 기능
- 랜덤 선택/분배
- 애니메이션
- 결과 표시

### 4. 부가 기능
- 히스토리/설정
- 공유/내보내기
- QR 코드

### 5. Edge Cases
- 빈 입력
- 특수문자
- 극단적 값 (매우 크거나 작은 수)
- 중복 데이터

### 6. 반응형 디자인
- 모바일 (375x667)
- 태블릿 (768x1024)
- 데스크톱 (1920x1080)

### 7. 접근성 (Accessibility)
- 레이블 존재
- ARIA 속성
- 키보드 탐색

### 8. 성능
- 로드 시간
- 애니메이션 완료 시간
- 대량 데이터 처리

### 9. 랜덤성 검증 (해당 앱만)
- 여러 번 실행 시 분포
- 모든 항목 선택 가능성

---

## 공통 테스트 패턴

### beforeEach 훅
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  // 초기 데이터 셋업
});
```

### 대기 전략
```typescript
// ❌ 하드코딩 대기 (피하기)
await page.waitForTimeout(5000);

// ✅ 요소 기반 대기 (권장)
await expect(element).toBeVisible({ timeout: 5000 });

// ✅ 네트워크 대기
await page.waitForResponse(response =>
  response.url().includes('/api/') && response.status() === 200
);
```

### 선택자 우선순위
```typescript
// 1순위: Role 기반 (접근성)
page.getByRole('button', { name: /추가/i })

// 2순위: Placeholder/Label
page.getByPlaceholder(/이름/i)
page.getByLabel(/참가자/i)

// 3순위: Text
page.getByText(/팀 나누기/i)

// 최후: CSS/XPath (피하기)
page.locator('.btn-primary')
```

---

## Mock 및 Fixture

### Geolocation Mock (Lunch Roulette)
```typescript
await page.context().grantPermissions(['geolocation']);
await page.context().setGeolocation({
  latitude: 37.5666805,  // 서울시청
  longitude: 126.9784147
});
```

### 클립보드 Mock (Team Divider)
```typescript
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
const text = await page.evaluate(() => navigator.clipboard.readText());
```

### Dialog 핸들링
```typescript
page.on('dialog', dialog => {
  expect(dialog.message()).toContain('예상 메시지');
  dialog.accept();
});
```

---

## CI/CD 통합

### GitHub Actions 예시
```yaml
name: E2E Tests - Random Apps

on:
  push:
    paths:
      - 'agents/mini-apps/apps/lunch-roulette/**'
      - 'agents/mini-apps/apps/random-picker/**'
      - 'agents/mini-apps/apps/ladder-game/**'
      - 'agents/mini-apps/apps/team-divider/**'
      - 'agents/mini-apps/tests/random/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test tests/random/

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 문제 해결 (Troubleshooting)

### 테스트 타임아웃
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000, // 테스트당 30초
  expect: {
    timeout: 10000, // assertion당 10초
  },
});
```

### 플레이키(Flaky) 테스트
- `waitForTimeout()` 사용 최소화
- `toBeVisible({ timeout })` 사용
- 네트워크 요청 완료 대기
- 애니메이션 완료 대기

### Canvas 테스트
```typescript
// Canvas 요소 확인
const canvas = page.locator('canvas');
await expect(canvas).toBeVisible();

// Canvas 내부 클릭 (좌표 기반)
const box = await canvas.boundingBox();
await canvas.click({ position: { x: box.width / 2, y: 20 } });
```

### 모바일 테스트
```typescript
// Viewport 설정
await page.setViewportSize({ width: 375, height: 667 });

// Touch 이벤트 (클릭 대신)
await element.tap();
```

---

## 테스트 커버리지 목표

| 카테고리 | 목표 | 현재 상태 |
|---------|------|----------|
| 기본 UI | 100% | ✅ 완료 |
| 입력 폼 | 100% | ✅ 완료 |
| 핵심 기능 | 100% | ✅ 완료 |
| Edge Cases | 80%+ | ✅ 완료 |
| 반응형 | 100% | ✅ 완료 |
| 접근성 | 80%+ | ✅ 완료 |
| 성능 | 50%+ | ✅ 완료 |

---

## 추가 테스트 예정

### Phase 2 (선택적)
- [ ] Visual Regression Testing (Percy, Chromatic)
- [ ] API Mocking (MSW)
- [ ] 부하 테스트 (k6)
- [ ] Cross-browser Testing (Safari, Firefox)
- [ ] 국제화 테스트 (i18n)

### Phase 3 (고급)
- [ ] Component Testing (Playwright CT)
- [ ] Accessibility Audit (axe-core)
- [ ] Lighthouse CI
- [ ] Storybook Integration

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [프로젝트 CLAUDE.md](/Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/CLAUDE.md)

---

## 기여 가이드

새로운 테스트를 추가할 때:

1. **명확한 테스트 이름**: `'참가자를 추가할 수 있다'`
2. **독립적인 테스트**: 서로 영향을 주지 않도록
3. **적절한 대기**: 하드코딩 대신 조건 기반 대기
4. **한국어 주석**: 복잡한 로직은 한국어로 설명
5. **Edge Case 포함**: 정상 케이스만이 아닌 경계 케이스도 테스트

```typescript
// ✅ Good
test('특수문자가 포함된 이름을 추가할 수 있다', async ({ page }) => {
  const names = ['홍길동(팀장)', '@관리자', '#개발자'];
  // ...
});

// ❌ Bad
test('test1', async ({ page }) => {
  // 무엇을 테스트하는지 불명확
});
```
