# 랜덤 뽑기 룰렛 (Random Picker Wheel)

공정하고 재미있는 랜덤 뽑기 도구. 회식, 수업, 이벤트에서 사용하세요.

## 기능

- 룰렛 휠 시각화 (Canvas API)
- 항목 입력/편집/삭제
- 일괄 입력 (복사/붙여넣기)
- 회전 애니메이션 (3-5초, ease-out-cubic)
- Confetti 효과
- 결과 히스토리 저장 (최대 100개)
- 암호학적 랜덤성 (crypto.getRandomValues)

## 기술 스택

- React 19
- TypeScript
- Zustand (상태 관리)
- Canvas API (휠 렌더링)
- canvas-confetti
- @mini-apps/ui (공용 UI 컴포넌트)

## 개발

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 미리보기
pnpm preview
```

## 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── WheelCanvas.tsx  # 룰렛 휠
│   ├── ItemInput.tsx    # 항목 입력
│   ├── ItemList.tsx     # 항목 리스트
│   ├── BulkInput.tsx    # 일괄 입력
│   ├── ResultModal.tsx  # 결과 모달
│   ├── HistoryPanel.tsx # 히스토리
│   └── SettingsPanel.tsx # 설정
├── lib/                 # 핵심 로직
│   ├── wheel-renderer.ts  # Canvas 렌더링
│   ├── spin-animator.ts   # 회전 애니메이션
│   └── utils.ts           # 유틸리티
├── store/               # Zustand 스토어
│   └── wheel-store.ts
├── types/               # TypeScript 타입
│   └── index.ts
├── App.tsx              # 메인 앱
└── main.tsx             # 진입점
```

## 주요 알고리즘

### 랜덤 선택

```typescript
// crypto.getRandomValues() 사용
const randomBuffer = new Uint32Array(1);
crypto.getRandomValues(randomBuffer);
const targetIndex = randomBuffer[0] % items.length;
```

### 회전 애니메이션

- 지속 시간: 4-6초 (랜덤)
- 회전 수: 5-10바퀴 (랜덤)
- Easing: ease-out-cubic
- 목표 항목 내 랜덤 오프셋 (공정성)

### 색상 생성

```typescript
// Golden Angle (137.508°) 사용하여 색상환 균등 분할
const hue = (index * 137.508) % 360;
return `hsl(${hue}, 70%, 60%)`;
```

## 배포 URL

https://seolcoding.com/mini-apps/random-picker/

## 라이선스

MIT
