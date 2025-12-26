# 폴더 구조 개선 제안

## 현재 문제점

1. **평면적 구조**: 모든 앱이 `src/app/` 루트에 있어 카테고리 구분 어려움
2. **테스트 매핑 불일치**: E2E 테스트는 카테고리별로 나뉘어 있지만 소스 코드는 아님
3. **명명 규칙 불일치**: 일부 앱은 `-game`, 일부는 `-calculator` 접미사 없음

## 제안 옵션

### 옵션 A: Route Group 활용 (권장)

Next.js App Router의 Route Groups `(folder)`를 사용하여 URL 변경 없이 논리적 그룹화.

```
src/app/
├── (auth)/                    # 인증 관련
│   ├── login/
│   └── auth/
│
├── (dashboard)/               # 대시보드 (기존 유지)
│   └── dashboard/
│
├── (core)/                    # 🔥 Core Tier - 실시간 멀티유저
│   ├── live-voting/
│   ├── audience-engage/
│   ├── bingo-game/
│   └── group-order/
│
├── (games)/                   # 🎮 게임류
│   ├── balance-game/
│   ├── ideal-worldcup/
│   ├── ladder-game/
│   ├── chosung-quiz/
│   └── personality-test/
│
├── (calculators)/             # 🧮 계산기류
│   ├── salary-calculator/
│   ├── rent-calculator/
│   ├── gpa-calculator/
│   └── dutch-pay/
│
├── (utilities)/               # 🔧 유틸리티
│   ├── random-picker/
│   ├── team-divider/
│   ├── lunch-roulette/
│   └── id-validator/
│
└── (social)/                  # 👥 소셜/네트워킹
    └── student-network/
```

**장점**:
- URL 구조 변경 없음 (`/salary-calculator` 유지)
- IDE에서 카테고리별 탐색 용이
- E2E 테스트 구조와 일치

**단점**:
- 기존 import 경로 변경 필요
- 마이그레이션 작업 필요

---

### 옵션 B: 접두사 기반 명명 규칙 (최소 변경)

폴더를 이동하지 않고, 명명 규칙과 인덱스 파일로 관리.

```
src/app/
├── core-live-voting/          # 접두사로 카테고리 표시
├── core-audience-engage/
├── game-balance/
├── game-bingo/
├── calc-salary/
├── calc-rent/
├── util-random-picker/
└── util-team-divider/
```

**장점**:
- 구현 간단
- 파일 탐색기에서 알파벳 순 정렬 시 그룹화

**단점**:
- URL 변경 필요 (`/core-live-voting`)
- SEO/기존 링크 영향

---

### 옵션 C: 인덱스 파일 기반 (현상 유지 + 문서화)

폴더 구조는 유지하고, `APP_INDEX.yaml`과 `CLAUDE.md`로 매핑 관리.

```
src/app/                       # 기존 구조 유지
├── balance-game/
├── bingo-game/
├── dutch-pay/
...

+ APP_INDEX.yaml               # 앱-코드-테스트 매핑
+ CLAUDE.md                    # AI 에이전트용 가이드
```

**장점**:
- 기존 코드 변경 없음
- 즉시 적용 가능

**단점**:
- IDE에서 물리적 그룹화 안됨
- 문서 유지보수 필요

---

## E2E 테스트 구조 정렬

현재 테스트는 이미 카테고리별로 잘 정리되어 있음:

```
e2e/
├── pages/                     # Page Object Models
│   ├── calculator/            # 계산기 앱 PO
│   ├── game/                  # 게임 앱 PO
│   ├── utility/               # 유틸리티 앱 PO
│   └── multiuser/             # 멀티유저 앱 PO
│
├── scenarios/                 # 시나리오 테스트
│   ├── calculator/
│   ├── game/
│   ├── utility/
│   ├── multiuser/
│   └── edge-cases/
│
└── smart/                     # 품질 테스트
    ├── accessibility.spec.ts
    ├── responsive.spec.ts
    └── performance.spec.ts
```

### 테스트-앱 매핑 테이블

| 카테고리 | 앱 | Page Object | Scenario |
|---------|-----|-------------|----------|
| calculator | salary-calculator | `salary.page.ts` | `salary-calculator.spec.ts` |
| calculator | rent-calculator | - | `rent-calculator.spec.ts` |
| calculator | dutch-pay | `dutch-pay.page.ts` | `dutch-pay.spec.ts` |
| calculator | id-validator | `id-validator.page.ts` | `id-validator.spec.ts` |
| game | balance-game | `balance-game.page.ts` | `balance-game.spec.ts` |
| game | bingo-game | `bingo.page.ts` | `bingo-game.spec.ts` |
| game | ladder-game | `ladder.page.ts` | `ladder-game.spec.ts` |
| utility | random-picker | `random-picker.page.ts` | `random-picker.spec.ts` |
| utility | team-divider | `team-divider.page.ts` | `team-divider.spec.ts` |
| utility | live-voting | `live-voting.page.ts` | `live-voting.spec.ts` |
| multiuser | audience-engage | - | `presentation-e2e.spec.ts` |

---

## 권장 구현 순서

### Phase 1: 즉시 적용 (옵션 C)
1. ✅ `APP_INDEX.yaml` 생성 완료
2. `CLAUDE.md`에 Quick Reference 섹션 추가
3. IDE에서 검색 최적화 (.vscode/settings.json)

### Phase 2: 점진적 마이그레이션 (옵션 A)
1. 새 앱부터 Route Group 적용
2. 기존 앱 점진적 이동
3. Import 경로 자동 업데이트 스크립트

### Phase 3: 테스트 커버리지 확장
1. 누락된 Page Object 생성
2. 앱별 시나리오 테스트 추가
3. 카테고리별 통합 테스트

---

## IDE 설정 권장사항

### VS Code 워크스페이스 설정

```json
// .vscode/settings.json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.tsx": "${capture}.test.tsx, ${capture}.spec.tsx",
    "page.tsx": "*.tsx, *.ts"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/test-results": true
  }
}
```

### 폴더 아이콘 테마 추천
- Material Icon Theme + 커스텀 폴더 아이콘

---

## 결론

**단기**: 옵션 C (APP_INDEX.yaml + 문서화) - 현재 구조 유지하며 인덱싱 개선
**장기**: 옵션 A (Route Groups) - 점진적으로 물리적 구조 개선

현재 16개 앱 규모에서는 옵션 C로 충분하며, 앱이 더 늘어나면 옵션 A로 마이그레이션 권장.
