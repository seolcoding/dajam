# 사다리 타기 (Ladder Lottery)

공정한 랜덤 추첨을 위한 사다리 타기 게임

## 기능

- **참가자 관리**: 2-8명의 참가자 입력 및 관리
- **결과 설정**: 각 참가자에 대응하는 결과 항목 설정
- **사다리 생성**: 랜덤 알고리즘으로 공정한 사다리 생성
- **Canvas 렌더링**: HTML Canvas를 사용한 고품질 시각화
- **경로 추적**: 클릭 시 경로 확인 (애니메이션 구현 예정)
- **테마 지원**: 밝은/어두운/컬러풀 테마 선택
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 사용 방법

### 개발 모드

```bash
pnpm --filter ladder-game dev
```

서버 시작 후 http://localhost:5173/mini-apps/ladder-game/ 접속

### 프로덕션 빌드

```bash
pnpm --filter ladder-game build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

## 기술 스택

- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Zustand**: 경량 상태 관리
- **Canvas API**: 사다리 시각화
- **Framer Motion**: 결과 모달 애니메이션
- **Tailwind CSS**: 스타일링
- **@mini-apps/ui**: 공용 UI 컴포넌트

## 구조

```
src/
├── components/
│   └── ladder-game/
│       ├── LadderGame.tsx       # 메인 컴포넌트
│       ├── InputPanel.tsx       # 참가자/결과 입력
│       ├── LadderCanvas.tsx     # Canvas 렌더링
│       ├── ControlPanel.tsx     # 컨트롤 패널
│       └── ResultModal.tsx      # 결과 모달
├── hooks/
│   ├── useLadderCanvas.ts       # Canvas 렌더링 훅
│   └── usePathAnimation.ts      # 경로 애니메이션 훅
├── lib/
│   ├── ladder/
│   │   ├── types.ts             # 타입 정의
│   │   ├── generator.ts         # 사다리 생성 알고리즘
│   │   ├── tracer.ts            # 경로 추적 알고리즘
│   │   ├── renderer.ts          # Canvas 렌더링
│   │   └── easing.ts            # Easing 함수
│   └── store.ts                 # Zustand 스토어
└── App.tsx
```

## 알고리즘

### 사다리 생성

1. 각 세로선이 최소 1개 이상의 가로선을 가지도록 보장
2. 가로선 간 최소 간격 유지 (충돌 방지)
3. 동일 행에 인접한 가로선 금지
4. 균등한 수직 분포로 clustering 방지

### 경로 추적

1. 시작 열에서 출발
2. 위에서 아래로 내려가며 가로선 탐색
3. 가로선을 만나면 반대편으로 이동
4. 최종 도착 열이 결과

## 향후 개선 사항

- [ ] 실시간 경로 애니메이션 구현
- [ ] 순차/일괄/수동 공개 모드 구현
- [ ] URL 공유 기능
- [ ] 결과 저장 및 히스토리
- [ ] 사운드 효과
- [ ] 통계 기능

## 라이선스

MIT
