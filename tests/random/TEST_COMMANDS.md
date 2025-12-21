# Quick Test Commands - Random Apps

## 빠른 실행 가이드

### 1️⃣ 전체 Random 카테고리 테스트

```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps

# 모든 random 앱 테스트 (헤드리스)
pnpm test tests/random/

# UI 모드로 실행 (추천 - 디버깅 쉬움)
pnpm test:ui tests/random/

# 헤드드 모드 (브라우저 보이기)
pnpm test:headed tests/random/
```

---

### 2️⃣ 개별 앱 테스트

#### Lunch Roulette (점심 룰렛)
```bash
# 기본 실행
pnpm test tests/random/lunch-roulette.spec.ts

# UI 모드
pnpm test:ui tests/random/lunch-roulette.spec.ts

# 디버그 모드 (한 줄씩 실행)
pnpm test:debug tests/random/lunch-roulette.spec.ts

# 특정 테스트만 실행 (grep 사용)
pnpm test tests/random/lunch-roulette.spec.ts -g "위치 권한"
```

#### Random Picker (랜덤 뽑기)
```bash
pnpm test tests/random/random-picker.spec.ts
pnpm test:ui tests/random/random-picker.spec.ts
pnpm test tests/random/random-picker.spec.ts -g "룰렛 회전"
```

#### Ladder Game (사다리 타기)
```bash
pnpm test tests/random/ladder-game.spec.ts
pnpm test:ui tests/random/ladder-game.spec.ts
pnpm test tests/random/ladder-game.spec.ts -g "애니메이션"
```

#### Team Divider (팀 나누기)
```bash
pnpm test tests/random/team-divider.spec.ts
pnpm test:ui tests/random/team-divider.spec.ts
pnpm test tests/random/team-divider.spec.ts -g "QR 코드"
```

---

### 3️⃣ 브라우저별 테스트

```bash
# Chromium만
pnpm test tests/random/ --project=chromium

# Mobile (iPhone 14 시뮬레이션)
pnpm test tests/random/ --project=mobile

# 둘 다 실행 (기본)
pnpm test tests/random/
```

---

### 4️⃣ 특정 테스트 그룹만 실행

```bash
# "초기 상태" 테스트만
pnpm test tests/random/ -g "초기 상태"

# "Edge Cases" 테스트만
pnpm test tests/random/ -g "Edge Cases"

# "반응형" 테스트만
pnpm test tests/random/ -g "반응형"

# "접근성" 테스트만
pnpm test tests/random/ -g "접근성"

# "성능" 테스트만
pnpm test tests/random/ -g "성능"
```

---

### 5️⃣ 디버깅 옵션

```bash
# 스크린샷 모드 (항상 캡처)
pnpm test tests/random/ --screenshot=on

# 비디오 녹화 (항상)
pnpm test tests/random/ --video=on

# 트레이스 모드 (상세 로그)
pnpm test tests/random/ --trace=on

# 느린 모션 (1초 지연)
pnpm test tests/random/ --headed --slow-mo=1000
```

---

### 6️⃣ 재시도 및 병렬 실행

```bash
# 실패 시 2번 재시도
pnpm test tests/random/ --retries=2

# 워커 수 지정 (병렬 실행)
pnpm test tests/random/ --workers=4

# 순차 실행 (디버깅 시 유용)
pnpm test tests/random/ --workers=1
```

---

### 7️⃣ 리포트 및 결과

```bash
# HTML 리포트 생성 (기본)
pnpm test tests/random/

# 리포트 보기
pnpm exec playwright show-report

# JSON 리포트
pnpm test tests/random/ --reporter=json

# JUnit XML (CI/CD 통합)
pnpm test tests/random/ --reporter=junit
```

---

## 앱별 개발 서버 실행

테스트 전에 각 앱의 개발 서버를 실행해야 합니다:

```bash
# Lunch Roulette
pnpm --filter lunch-roulette dev
# → http://localhost:5173/mini-apps/lunch-roulette/

# Random Picker
pnpm --filter random-picker dev
# → http://localhost:5173/mini-apps/random-picker/

# Ladder Game
pnpm --filter ladder-game dev
# → http://localhost:5173/mini-apps/ladder-game/

# Team Divider
pnpm --filter team-divider dev
# → http://localhost:5173/mini-apps/team-divider/
```

**참고**: Vite는 기본적으로 포트 5173을 사용하며, 충돌 시 자동으로 다음 포트를 사용합니다.

---

## 개발 워크플로우 예시

### 시나리오 1: 새 기능 개발 후 테스트

```bash
# 1. Lunch Roulette 개발 서버 시작 (터미널 1)
pnpm --filter lunch-roulette dev

# 2. 테스트 UI 모드 실행 (터미널 2)
pnpm test:ui tests/random/lunch-roulette.spec.ts

# 3. 코드 수정 → 저장 → 테스트 자동 재실행 (watch 모드)
```

### 시나리오 2: 버그 수정 디버깅

```bash
# 1. 앱 서버 실행
pnpm --filter random-picker dev

# 2. 디버그 모드로 실패한 테스트 실행
pnpm test:debug tests/random/random-picker.spec.ts -g "항목 삭제"

# 3. 브레이크포인트 설정하고 한 줄씩 실행
```

### 시나리오 3: CI/CD 전 검증

```bash
# 1. 전체 빌드
pnpm build

# 2. 전체 테스트 (CI 모드)
CI=true pnpm test tests/random/

# 3. 리포트 확인
pnpm exec playwright show-report
```

---

## Playwright Inspector 사용법

```bash
# 디버그 모드 실행
pnpm test:debug tests/random/lunch-roulette.spec.ts

# Inspector 창에서:
# - Step Over (F10): 다음 단계로
# - Resume (F8): 계속 실행
# - Pick Locator: 요소 선택기 자동 생성
# - Record: 새로운 테스트 녹화
```

---

## Codegen으로 새 테스트 작성

```bash
# 앱 서버 실행 후
pnpm exec playwright codegen http://localhost:5173/mini-apps/lunch-roulette/

# 브라우저에서 클릭/입력 → 자동으로 코드 생성
# 생성된 코드를 spec.ts 파일에 복사
```

---

## 트러블슈팅

### ❌ 문제: "baseURL not responding"

```bash
# 해결: 앱 서버가 실행 중인지 확인
pnpm --filter lunch-roulette dev

# 또는 playwright.config.ts의 webServer 설정 확인
```

### ❌ 문제: "Timeout waiting for element"

```typescript
// 해결: timeout 증가
await expect(element).toBeVisible({ timeout: 10000 }); // 10초
```

### ❌ 문제: "Permission denied (geolocation)"

```typescript
// 해결: 권한 부여
await page.context().grantPermissions(['geolocation']);
await page.context().setGeolocation({ latitude: 37.5666805, longitude: 126.9784147 });
```

### ❌ 문제: 플레이키(Flaky) 테스트

```bash
# 해결: 3번 재시도
pnpm test tests/random/lunch-roulette.spec.ts --retries=3

# 또는 waitForTimeout 대신 조건 기반 대기 사용
await expect(element).toBeVisible(); // ✅ Good
await page.waitForTimeout(5000);    // ❌ Bad
```

---

## 성능 측정

```bash
# Lighthouse 통합 (선택적)
pnpm exec playwright test tests/random/ --reporter=html

# 테스트 실행 시간 측정
time pnpm test tests/random/

# 느린 테스트 찾기
pnpm test tests/random/ --reporter=list --timeout=5000
```

---

## 추가 리소스

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [프로젝트 README](./README.md)
- [CLAUDE.md](/Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/CLAUDE.md)

---

**작성일**: 2024-12-20
**테스트 커버리지**: 2,161 lines across 4 apps
**예상 실행 시간**: ~5-10분 (전체 suite)
