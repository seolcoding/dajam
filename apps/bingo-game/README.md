# Bingo Game (빙고 게임)

오프라인 레크리에이션, 파티, 교육 현장에서 활용 가능한 빙고 게임입니다.

## 기능

### 게임 모드

1. **호스트 모드**
   - 게임 생성 및 설정
   - 아이템 호출 (수동/랜덤/자동)
   - 게임 코드 공유
   - 호출 기록 관리

2. **플레이어 모드**
   - 게임 코드로 참여
   - 자동 빙고판 생성
   - 셀 터치 마킹
   - 빙고 자동 감지

### 빙고 타입

1. **숫자 빙고**
   - 3x3: 1-9
   - 4x4: 1-16
   - 5x5: 1-25

2. **테마 빙고**
   - 동물 (25개)
   - 과일 (16개)
   - 국가 (25개)
   - 색깔 (9개)
   - K-POP (16개)
   - 스포츠 (16개)
   - 음식 (25개)

3. **커스텀 빙고**
   - 사용자 정의 단어 리스트
   - 줄바꿈으로 구분

### 주요 기능

#### 호스트 기능
- **게임 코드 생성**: 6자리 고유 코드 자동 생성
- **수동 호출**: 호스트가 직접 아이템 선택
- **랜덤 호출**: 남은 아이템 중 랜덤 선택
- **자동 호출**: 3-10초 간격으로 자동 호출
- **호출 기록**: 최근 20개 아이템 표시
- **진행 상황**: 전체/호출된 아이템 개수 및 진행률

#### 플레이어 기능
- **자동 빙고판 생성**: Fisher-Yates 셔플 알고리즘
- **터치 마킹**: 셀 클릭으로 마킹/해제
- **빙고 자동 감지**: 가로/세로/대각선 실시간 체크
- **빙고 애니메이션**: 완성된 라인 강조 표시
- **승리 모달**: 빙고 성공 시 축하 화면

#### 공통 기능
- **사운드 효과**: 마킹, 호출, 빙고 사운드
- **다크 모드**: 자동 테마 전환 지원
- **반응형 디자인**: 모바일/태블릿/데스크톱 최적화

## 기술 스택

- **React 19**: UI 컴포넌트
- **TypeScript**: 타입 안전성
- **Zustand**: 상태 관리
- **Framer Motion**: 애니메이션
- **Tailwind CSS v4**: 스타일링
- **Vite 7**: 빌드 도구
- **Web Audio API**: 사운드 효과

## 핵심 알고리즘

### 1. 빙고 판정 알고리즘

**시간 복잡도**: O(N) - N은 그리드 크기
**공간 복잡도**: O(N²)

```typescript
// 카운터 기반 빙고 체크
- rowCounts[]: 각 행의 마킹된 셀 수
- colCounts[]: 각 열의 마킹된 셀 수
- diagCount1: 주 대각선 (\)
- diagCount2: 부 대각선 (/)

// 빙고 완성 조건
if (count === gridSize) {
  // 빙고!
}
```

**최적화**:
- HashMap으로 O(1) 아이템 검색
- 중복 라인 체크 방지

### 2. Fisher-Yates Shuffle

**시간 복잡도**: O(n)
**공간 복잡도**: O(1) (in-place)

```typescript
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
```

**특징**:
- 완벽한 무작위 순열 생성
- 모든 순열이 동일한 확률로 발생
- Seeded random 지원 (재현 가능)

### 3. 승리 조건

1. **Single Line**: 1줄 완성
2. **Double Line**: 2줄 완성
3. **Triple Line**: 3줄 완성
4. **Four Corners**: 네 모서리 모두 마킹
5. **Full House**: 전체 완성

## 프로젝트 구조

```
src/
├── components/
│   ├── MenuScreen.tsx           # 메인 메뉴
│   ├── GameSetupScreen.tsx      # 게임 설정 (호스트)
│   ├── JoinGameScreen.tsx       # 게임 참여 (플레이어)
│   ├── HostScreen.tsx           # 호스트 화면
│   ├── PlayerScreen.tsx         # 플레이어 화면
│   ├── BingoGrid.tsx            # 빙고판 그리드
│   ├── BingoCell.tsx            # 개별 셀
│   └── BingoSuccessModal.tsx    # 빙고 성공 모달
├── stores/
│   └── useBingoStore.ts         # Zustand 스토어
├── utils/
│   ├── bingoAlgorithm.ts        # 빙고 판정 알고리즘
│   ├── shuffleAlgorithm.ts      # 셔플 알고리즘
│   ├── gameCodeGenerator.ts     # 게임 코드 생성
│   └── soundEffects.ts          # 사운드 재생
├── types/
│   └── bingo.types.ts           # 타입 정의
├── data/
│   └── themePresets.ts          # 테마 프리셋
└── App.tsx                      # 라우팅
```

## 개발 가이드

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 미리보기

```bash
pnpm preview
```

## 데모 모드 주의사항

현재 버전은 **로컬 데모 모드**로 작동합니다:

- 호스트와 플레이어 간 실시간 연결 없음
- 게임 코드는 형식 검증만 수행
- 각 플레이어가 독립적인 빙고판 생성
- 호출 기능은 호스트 화면에서만 작동

### 실제 서비스 구현 시

실시간 멀티플레이어를 위해서는:
1. WebSocket 또는 Firebase Realtime Database
2. 호스트 호출을 모든 플레이어에게 브로드캐스트
3. 플레이어 빙고 성공 시 전체 알림
4. 리더보드 및 순위 시스템

## UI 가이드라인 준수

- ✅ 배경색: `bg-gray-50` 또는 `bg-white` (그라디언트 금지)
- ✅ 버튼: `bg-blue-600 hover:bg-blue-700 text-white`
- ✅ Shadcn UI 컴포넌트 사용 가능
- ✅ 다크 모드 지원
- ✅ 반응형 디자인

## 참고 문서

- PRD: `/Users/sdh/Dev/02_production/seolcoding.com/agents/mini-apps/prd/14-bingo-game.md`
- Framer Motion: https://www.framer.com/motion/
- Zustand: https://github.com/pmndrs/zustand
- Fisher-Yates Shuffle: https://en.wikipedia.org/wiki/Fisher–Yates_shuffle

## 라이선스

MIT License
