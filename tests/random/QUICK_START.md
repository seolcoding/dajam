# 🚀 Quick Start - Random Apps E2E Tests

**5분 안에 테스트 시작하기**

---

## ⚡ 빠른 실행 (3단계)

### 1️⃣ 앱 서버 실행 (터미널 1)

```bash
cd /Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps

# 테스트할 앱 선택 (하나만 실행)
pnpm --filter lunch-roulette dev
# 또는
pnpm --filter random-picker dev
# 또는
pnpm --filter ladder-game dev
# 또는
pnpm --filter team-divider dev
```

### 2️⃣ 테스트 실행 (터미널 2)

```bash
# UI 모드 (추천 - 시각적으로 확인)
pnpm test:ui tests/random/

# 또는 헤드리스 모드 (빠름)
pnpm test tests/random/
```

### 3️⃣ 결과 확인

- UI 모드: 자동으로 브라우저 열림
- 헤드리스: `pnpm exec playwright show-report`

---

## 🎯 개별 앱 테스트

### Lunch Roulette
```bash
# 1. 앱 실행
pnpm --filter lunch-roulette dev

# 2. 테스트
pnpm test:ui tests/random/lunch-roulette.spec.ts
```

### Random Picker
```bash
pnpm --filter random-picker dev
pnpm test:ui tests/random/random-picker.spec.ts
```

### Ladder Game
```bash
pnpm --filter ladder-game dev
pnpm test:ui tests/random/ladder-game.spec.ts
```

### Team Divider
```bash
pnpm --filter team-divider dev
pnpm test:ui tests/random/team-divider.spec.ts
```

---

## 🐛 디버깅

```bash
# Inspector 모드 (한 줄씩 실행)
pnpm test:debug tests/random/lunch-roulette.spec.ts

# 헤드드 모드 (브라우저 보이기)
pnpm test:headed tests/random/

# 특정 테스트만
pnpm test tests/random/lunch-roulette.spec.ts -g "위치 권한"
```

---

## 📁 파일 구조

```
tests/random/
├── lunch-roulette.spec.ts    (313 lines, ~40 tests)
├── random-picker.spec.ts     (562 lines, ~55 tests)
├── ladder-game.spec.ts       (574 lines, ~45 tests)
├── team-divider.spec.ts      (712 lines, ~60 tests)
├── README.md                  (상세 가이드)
├── TEST_COMMANDS.md           (명령어 레퍼런스)
├── TEST_SUMMARY.md            (통계 및 요약)
└── QUICK_START.md            (이 파일)
```

---

## 🔥 자주 사용하는 명령어

```bash
# 전체 테스트
pnpm test tests/random/

# UI 모드
pnpm test:ui tests/random/

# 특정 앱만
pnpm test tests/random/lunch-roulette.spec.ts

# 실패 시 스크린샷
pnpm test tests/random/ --screenshot=on

# 느린 모션 (디버깅)
pnpm test:headed tests/random/ --slow-mo=1000

# 리포트 보기
pnpm exec playwright show-report
```

---

## ⚙️ 포트 설정

각 앱은 다음 포트를 사용합니다:

| 앱 | 포트 | URL |
|---|------|-----|
| Lunch Roulette | 5177 | http://localhost:5177/mini-apps/lunch-roulette/ |
| Random Picker | 5178 | http://localhost:5178/mini-apps/random-picker/ |
| Ladder Game | 5179 | http://localhost:5179/mini-apps/ladder-game/ |
| Team Divider | 5180 | http://localhost:5180/mini-apps/team-divider/ |

**참고**: Vite는 포트가 사용 중이면 자동으로 다음 포트를 사용합니다.

---

## 🆘 문제 해결

### "baseURL not responding" 에러
```bash
# 해결: 앱 서버가 실행 중인지 확인
pnpm --filter lunch-roulette dev
```

### "Timeout" 에러
```bash
# 해결: timeout 증가
pnpm test tests/random/ --timeout=60000
```

### 플레이키(Flaky) 테스트
```bash
# 해결: 재시도 옵션
pnpm test tests/random/ --retries=3
```

---

## 📚 더 알아보기

- **상세 가이드**: [README.md](./README.md)
- **명령어 레퍼런스**: [TEST_COMMANDS.md](./TEST_COMMANDS.md)
- **통계 및 요약**: [TEST_SUMMARY.md](./TEST_SUMMARY.md)
- **프로젝트 가이드**: [CLAUDE.md](../../CLAUDE.md)

---

## ✅ 체크리스트

테스트 실행 전:
- [ ] pnpm install 완료
- [ ] 앱 서버 실행 중
- [ ] 포트 충돌 없음
- [ ] Playwright 설치 완료 (`pnpm exec playwright install`)

첫 실행 시:
- [ ] `pnpm install` (루트에서)
- [ ] `pnpm exec playwright install --with-deps` (브라우저 설치)
- [ ] 앱 서버 실행 확인

---

**작성일**: 2024-12-20
**예상 소요 시간**: 첫 실행 10분, 이후 5분 이내
