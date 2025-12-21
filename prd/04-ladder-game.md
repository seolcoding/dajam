# 사다리 타기 (Ladder Lottery)

## 1. 개요

사다리 타기(Amidakuji, Ghost Leg)는 한국 회식 문화와 일상에서 널리 사용되는 공정한 랜덤 추첨 도구입니다. 종이에 그려서 사용하던 전통적인 방식을 웹으로 구현하여 언제 어디서나 모바일과 데스크톱에서 사용할 수 있도록 합니다.

### 핵심 가치
- **공정성**: 완전한 랜덤 알고리즘으로 조작 불가능한 결과 보장
- **재미**: 경로 추적 애니메이션으로 결과 확인 과정의 긴장감 극대화
- **편의성**: 종이 없이 즉시 사용 가능, 모바일 터치 최적화
- **활용성**: 점심/저녁 내기, 벌칙 정하기, 마니또 뽑기 등 다양한 상황에서 활용

### 사용 시나리오
1. 회식 후 1차/2차 비용 분담자 결정
2. 점심 메뉴 결정 또는 식비 내는 사람 정하기
3. 팀 빌딩 활동에서 마니또 매칭
4. 벌칙 게임 참가자 선정
5. 소규모 경품 추첨

## 2. 유사 서비스 분석

### 2.1 주요 경쟁 서비스

#### [사다리타기 게임 (apps.ojj.kr)](https://apps.ojj.kr/)
- **특징**: 간단한 UI, 개별 GO 버튼으로 결과 확인
- **장점**: 빠른 로딩, 직관적 인터페이스
- **단점**: 모바일에서 가로 스크롤 발생, 애니메이션 부족

#### [사다리타기 게임 | 온라인 꽝 찾기 (url.kr)](https://url.kr/p/ghost-leg/)
- **특징**: 모바일/PC 모두 지원
- **장점**: 깔끔한 디자인, 반응형 레이아웃
- **단점**: 커스터마이징 옵션 제한적

#### 카카오톡 사다리타기
- **특징**: 카카오톡 내 미니게임
- **장점**: 별도 앱 설치 불필요, 친구들과 즉시 공유
- **단점**: 카카오톡 의존성, 독립 사용 불가

#### Google Play 앱들 (Ladder Lottery Game)
- **특징**: 네이티브 앱, 2-9명 참가자 지원
- **장점**: 오프라인 사용 가능, 셔플 기능
- **단점**: 앱 설치 필요, 웹 대비 접근성 낮음

### 2.2 차별화 전략

| 기능 | 기존 서비스 | 본 프로젝트 |
|------|------------|------------|
| 애니메이션 | 정적 또는 간단한 효과 | **부드러운 경로 추적 애니메이션** |
| 모바일 최적화 | 가로 스크롤, 버튼 작음 | **터치 친화적 UI, 반응형 캔버스** |
| 커스터마이징 | 제한적 | **참가자/결과 자유 입력, 색상 테마** |
| 결과 공개 | 즉시 공개 또는 일괄 공개 | **단계별 공개 + 긴장감 연출** |
| 공유 | 제한적 | **URL 복사, 스크린샷 저장** |

## 3. 오픈소스 라이브러리

### 3.1 Canvas/SVG 렌더링

#### Konva.js (Canvas)
- **장점**: React 통합 우수 (react-konva), 이벤트 처리 간편, 레이어 관리
- **단점**: 번들 크기 큼 (~200KB)
- **사용 여부**: ❌ (프로젝트 규모 대비 오버스펙)

#### Fabric.js (Canvas)
- **장점**: 강력한 캔버스 객체 모델, 드래그 앤 드롭 지원
- **단점**: 사다리 타기에는 과도한 기능
- **사용 여부**: ❌

#### Native Canvas API
- **장점**: 제로 디펜던시, 가볍고 빠름, 모던 브라우저 완벽 지원
- **단점**: 저수준 API, 직접 구현 필요
- **사용 여부**: ✅ **채택** (프로젝트 요구사항에 적합)

### 3.2 애니메이션 라이브러리

#### [Framer Motion](https://www.framer.com/motion/)
- **장점**: React 19 완벽 호환, 선언적 API, SSR 지원
- **단점**: Canvas 애니메이션에는 부적합 (DOM 중심)
- **사용 여부**: ⚠️ (UI 전환 애니메이션에만 사용)

#### [GSAP (GreenSock)](https://gsap.com/)
- **장점**: 고성능, Canvas/SVG 애니메이션 강력, Timeline 제어 우수
- **단점**: 상용 라이선스 필요 (무료는 제한적)
- **사용 여부**: ❌ (라이선스 이슈)

#### [Motion One](https://motion.dev/)
- **장점**: 경량 (~5KB), Web Animations API 기반, React SVG 애니메이션 지원
- **단점**: Canvas 애니메이션은 직접 구현 필요
- **사용 여부**: ⚠️ (SVG 옵션 고려 시 사용)

#### [Vivus.js](https://maxwellito.github.io/vivus/)
- **장점**: SVG path 그리기 애니메이션 전문, 디펜던시 없음, 경량
- **단점**: React 통합 불편, SVG 전용
- **사용 여부**: ❌

#### requestAnimationFrame (Native)
- **장점**: 네이티브 API, 60fps 보장, Canvas와 완벽 호환
- **단점**: 타이밍 제어 직접 구현 필요
- **사용 여부**: ✅ **채택** (Canvas 경로 추적 애니메이션)

### 3.3 최종 선택

```typescript
// 채택된 기술 스택
{
  rendering: "Canvas API (CanvasRenderingContext2D)",
  animation: "requestAnimationFrame + custom easing",
  uiTransition: "Framer Motion (optional, for modals/toasts)",
  stateManagement: "React 19 useState/useReducer",
  styling: "Tailwind CSS v4"
}
```

## 4. 기술 스택

### 4.1 Core
- **Build Tool**: Vite 6.0+ (fast HMR, optimized builds)
- **Framework**: React 19 (with new hooks: useOptimistic, useTransition)
- **Language**: TypeScript 5.7+ (strict mode, no `any` types)
- **Styling**: Tailwind CSS v4 (JIT compiler, custom design tokens)

### 4.2 Rendering & Animation
- **Canvas API**: `CanvasRenderingContext2D` for drawing ladder
- **Animation**: `requestAnimationFrame` + custom cubic-bezier easing
- **Responsive**: `ResizeObserver` for canvas resizing

### 4.3 State Management
- **Local State**: React 19 `useState`, `useReducer`
- **Derived State**: `useMemo` for ladder generation
- **Animation State**: Custom `useAnimationFrame` hook

### 4.4 Development Tools
- **Linter**: ESLint 9 + TypeScript ESLint
- **Formatter**: Prettier 3.4
- **Type Checking**: `tsc --noEmit` in CI/CD
- **Testing**: Vitest (optional, for algorithm testing)

## 5. 핵심 기능 및 구현

### 5.1 참가자/결과 입력

#### 기능 요구사항
- 최소 2명, 최대 8명 참가자 지원
- 참가자 이름과 결과 항목 자유 입력 (한글/영문/이모지)
- 입력 필드 동적 추가/삭제
- 입력값 실시간 유효성 검증 (중복 검사, 공백 검사)

#### UI 구성
```typescript
interface InputConfig {
  participants: string[];  // ["철수", "영희", "민수"]
  results: string[];       // ["당첨", "꽝1", "꽝2"]
}

// 검증 로직
function validateInput(config: InputConfig): ValidationResult {
  const errors: string[] = [];

  if (config.participants.length < 2) {
    errors.push("참가자는 최소 2명 이상이어야 합니다");
  }

  if (config.participants.length !== config.results.length) {
    errors.push("참가자 수와 결과 수가 일치해야 합니다");
  }

  const hasDuplicate = (arr: string[]) =>
    new Set(arr).size !== arr.length;

  if (hasDuplicate(config.participants)) {
    errors.push("중복된 참가자 이름이 있습니다");
  }

  return { valid: errors.length === 0, errors };
}
```

### 5.2 사다리 랜덤 생성

#### 알고리즘 요구사항
- 가로선(bridge) 랜덤 배치로 완전한 랜덤 매칭 보장
- 가로선 최소 간격 유지 (시각적 명확성)
- 동일 세로 위치에 인접한 가로선 금지 (경로 중복 방지)
- 모든 세로선이 최소 1개 이상의 가로선 연결 보장

#### 데이터 구조
```typescript
interface Bridge {
  fromColumn: number;  // 시작 열 인덱스 (0-based)
  toColumn: number;    // 종료 열 인덱스 (fromColumn + 1)
  row: number;         // 세로 위치 (0.0 ~ 1.0, 상대 좌표)
}

interface LadderData {
  columnCount: number;      // 세로선 개수 (참가자 수)
  bridges: Bridge[];        // 가로선 배열
  rowHeight: number;        // 시각적 세로 간격 (px)
  minBridgeGap: number;     // 가로선 최소 간격 (행 단위)
}
```

#### 생성 알고리즘 (TypeScript)
```typescript
/**
 * 사다리 가로선 랜덤 생성 알고리즘
 *
 * @param columnCount - 참가자 수 (세로선 개수)
 * @param density - 가로선 밀도 (0.3 ~ 0.8 권장)
 * @returns 생성된 사다리 데이터
 */
function generateLadder(
  columnCount: number,
  density: number = 0.5
): LadderData {
  const bridges: Bridge[] = [];
  const rows = Math.max(8, columnCount * 2); // 최소 8행, 참가자 수에 비례
  const targetBridgeCount = Math.floor(
    (columnCount - 1) * rows * density
  );

  // 각 세로선이 최소 1개 이상의 가로선을 갖도록 보장
  const minBridgesPerColumn = new Array(columnCount - 1).fill(0);

  // 1단계: 각 열에 최소 1개씩 강제 배치
  for (let col = 0; col < columnCount - 1; col++) {
    const row = Math.floor(Math.random() * rows);
    bridges.push({
      fromColumn: col,
      toColumn: col + 1,
      row: row / rows
    });
    minBridgesPerColumn[col]++;
  }

  // 2단계: 남은 가로선 랜덤 배치
  const remainingCount = targetBridgeCount - bridges.length;
  const minGap = 2; // 최소 2행 간격

  for (let i = 0; i < remainingCount; i++) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const col = Math.floor(Math.random() * (columnCount - 1));
      const row = Math.random();

      // 충돌 검사: 동일 행에 인접한 가로선이 있는지 확인
      const hasConflict = bridges.some(bridge => {
        const rowDiff = Math.abs(bridge.row * rows - row * rows);
        const isAdjacentColumn =
          Math.abs(bridge.fromColumn - col) <= 1;
        return isAdjacentColumn && rowDiff < minGap;
      });

      if (!hasConflict) {
        bridges.push({ fromColumn: col, toColumn: col + 1, row });
        break;
      }

      attempts++;
    }
  }

  // 행 순서로 정렬 (위에서 아래로)
  bridges.sort((a, b) => a.row - b.row);

  return {
    columnCount,
    bridges,
    rowHeight: 50, // 50px 기본 높이
    minBridgeGap: minGap
  };
}
```

### 5.3 Canvas 렌더링

#### 렌더링 사양
- 반응형 캔버스: 컨테이너 크기에 맞춰 자동 조정
- Retina 디스플레이 지원: `devicePixelRatio` 고려
- 색상 테마: Tailwind 디자인 토큰 사용
- 참가자/결과 텍스트 중앙 정렬, 다국어 폰트 지원

#### 렌더링 함수
```typescript
interface CanvasConfig {
  width: number;           // 캔버스 실제 너비
  height: number;          // 캔버스 실제 높이
  padding: number;         // 여백
  lineWidth: number;       // 선 두께
  colors: {
    line: string;          // 세로선/가로선 색상
    text: string;          // 텍스트 색상
    highlight: string;     // 애니메이션 경로 강조 색상
    background: string;    // 배경색
  };
}

function drawLadder(
  ctx: CanvasRenderingContext2D,
  ladder: LadderData,
  participants: string[],
  results: string[],
  config: CanvasConfig
): void {
  const { width, height, padding, lineWidth, colors } = config;
  const { columnCount, bridges, rowHeight } = ladder;

  // 캔버스 초기화
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  // 컬럼 간격 계산
  const usableWidth = width - padding * 2;
  const columnGap = usableWidth / (columnCount - 1);
  const totalHeight = bridges.length > 0
    ? Math.max(...bridges.map(b => b.row)) * rowHeight * columnCount
    : rowHeight * 8;

  // 1. 세로선 그리기
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  for (let i = 0; i < columnCount; i++) {
    const x = padding + i * columnGap;
    const y1 = padding + 40; // 참가자 텍스트 아래
    const y2 = padding + 40 + totalHeight;

    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }

  // 2. 가로선 그리기
  ctx.lineWidth = lineWidth;
  bridges.forEach(bridge => {
    const x1 = padding + bridge.fromColumn * columnGap;
    const x2 = padding + bridge.toColumn * columnGap;
    const y = padding + 40 + bridge.row * totalHeight;

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  });

  // 3. 참가자 이름 (상단)
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  participants.forEach((name, i) => {
    const x = padding + i * columnGap;
    const y = padding + 20;
    ctx.fillText(name, x, y);
  });

  // 4. 결과 텍스트 (하단)
  results.forEach((result, i) => {
    const x = padding + i * columnGap;
    const y = padding + 40 + totalHeight + 20;
    ctx.fillText(result, x, y);
  });
}

// React 컴포넌트 통합
function useLadderCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  ladder: LadderData,
  participants: string[],
  results: string[]
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const config: CanvasConfig = {
      width: rect.width,
      height: rect.height,
      padding: 40,
      lineWidth: 2,
      colors: {
        line: '#374151',      // Tailwind gray-700
        text: '#111827',      // Tailwind gray-900
        highlight: '#3b82f6', // Tailwind blue-500
        background: '#ffffff'
      }
    };

    drawLadder(ctx, ladder, participants, results, config);

    // ResizeObserver로 반응형 처리
    const resizeObserver = new ResizeObserver(() => {
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      ctx.scale(dpr, dpr);
      config.width = newRect.width;
      config.height = newRect.height;
      drawLadder(ctx, ladder, participants, results, config);
    });

    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [canvasRef, ladder, participants, results]);
}
```

### 5.4 경로 추적 애니메이션

#### 애니메이션 사양
- **Duration**: 2-3초 (사다리 복잡도에 비례)
- **Easing**: Cubic-bezier (0.4, 0.0, 0.2, 1.0) - ease-in-out
- **Frame Rate**: 60fps (requestAnimationFrame)
- **Visual Effects**:
  - 경로 강조 (두꺼운 선 + 색상 변화)
  - 현재 위치에 원형 마커 애니메이션
  - 결과 도달 시 페이드인 효과

#### 경로 추적 알고리즘
```typescript
interface PathPoint {
  x: number;
  y: number;
  direction: 'down' | 'right' | 'left';
}

/**
 * 사다리 경로 추적 알고리즘
 *
 * @param startColumn - 시작 열 인덱스
 * @param ladder - 사다리 데이터
 * @param config - 캔버스 설정
 * @returns 경로 포인트 배열
 */
function tracePath(
  startColumn: number,
  ladder: LadderData,
  config: CanvasConfig
): PathPoint[] {
  const path: PathPoint[] = [];
  const { columnCount, bridges, rowHeight } = ladder;
  const { padding } = config;

  const usableWidth = config.width - padding * 2;
  const columnGap = usableWidth / (columnCount - 1);
  const totalHeight = bridges.length > 0
    ? Math.max(...bridges.map(b => b.row)) * rowHeight * columnCount
    : rowHeight * 8;

  let currentColumn = startColumn;
  let currentY = padding + 40; // 시작 위치

  // 시작점 추가
  path.push({
    x: padding + currentColumn * columnGap,
    y: currentY,
    direction: 'down'
  });

  // 가로선 순회 (위에서 아래로)
  bridges.forEach(bridge => {
    const bridgeY = padding + 40 + bridge.row * totalHeight;

    // 현재 열에 연결된 가로선인지 확인
    if (bridge.fromColumn === currentColumn) {
      // 가로선 시작점 도달
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'down'
      });

      // 가로선 이동 (오른쪽)
      currentColumn = bridge.toColumn;
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'right'
      });
    } else if (bridge.toColumn === currentColumn) {
      // 가로선 종료점 도달
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'down'
      });

      // 가로선 이동 (왼쪽)
      currentColumn = bridge.fromColumn;
      path.push({
        x: padding + currentColumn * columnGap,
        y: bridgeY,
        direction: 'left'
      });
    }
  });

  // 종료점 추가 (결과 위치)
  path.push({
    x: padding + currentColumn * columnGap,
    y: padding + 40 + totalHeight,
    direction: 'down'
  });

  return path;
}

/**
 * 경로 애니메이션 커스텀 훅
 */
function usePathAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  ladder: LadderData,
  startColumn: number,
  config: CanvasConfig,
  onComplete: (resultColumn: number) => void
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const animate = useCallback(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const path = tracePath(startColumn, ladder, config);
    const duration = 2500; // 2.5초
    const startTime = performance.now();

    setIsAnimating(true);

    function drawFrame(currentTime: number) {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      // Cubic-bezier easing (ease-in-out)
      const easedProgress = cubicBezier(0.4, 0.0, 0.2, 1.0)(rawProgress);
      setProgress(easedProgress);

      // 현재 경로 위치 계산
      const totalDistance = calculateTotalDistance(path);
      const currentDistance = totalDistance * easedProgress;
      const currentPoint = getPointAtDistance(path, currentDistance);

      // 캔버스 다시 그리기
      drawLadder(ctx!, ladder, participants, results, config);

      // 지나간 경로 강조
      drawHighlightedPath(ctx!, path, currentPoint, config);

      // 현재 위치 마커
      drawMarker(ctx!, currentPoint.x, currentPoint.y, config);

      if (rawProgress < 1) {
        requestAnimationFrame(drawFrame);
      } else {
        setIsAnimating(false);
        const resultColumn = path[path.length - 1].x;
        const columnIndex = Math.round(
          (resultColumn - config.padding) /
          ((config.width - config.padding * 2) / (ladder.columnCount - 1))
        );
        onComplete(columnIndex);
      }
    }

    requestAnimationFrame(drawFrame);
  }, [canvasRef, ladder, startColumn, config, onComplete]);

  return { animate, isAnimating, progress };
}

// Cubic Bezier Easing 함수
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  return (t: number): number => {
    // Simplified cubic-bezier calculation
    const cx = 3 * p1x;
    const bx = 3 * (p2x - p1x) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    function sampleCurveY(t: number) {
      return ((ay * t + by) * t + cy) * t;
    }

    return sampleCurveY(t);
  };
}

// 경로 총 거리 계산
function calculateTotalDistance(path: PathPoint[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// 특정 거리에서의 포인트 계산
function getPointAtDistance(path: PathPoint[], distance: number): PathPoint {
  let accumulated = 0;

  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i - 1].x;
    const dy = path[i].y - path[i - 1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segmentLength >= distance) {
      const remaining = distance - accumulated;
      const ratio = remaining / segmentLength;

      return {
        x: path[i - 1].x + dx * ratio,
        y: path[i - 1].y + dy * ratio,
        direction: path[i - 1].direction
      };
    }

    accumulated += segmentLength;
  }

  return path[path.length - 1];
}

// 강조된 경로 그리기
function drawHighlightedPath(
  ctx: CanvasRenderingContext2D,
  path: PathPoint[],
  currentPoint: PathPoint,
  config: CanvasConfig
): void {
  ctx.strokeStyle = config.colors.highlight;
  ctx.lineWidth = config.lineWidth * 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    const point = path[i];

    // 현재 포인트를 넘어서면 중단
    if (
      (point.y > currentPoint.y && path[i - 1].direction === 'down') ||
      (Math.abs(point.x - currentPoint.x) < 1 &&
       Math.abs(point.y - currentPoint.y) < 1)
    ) {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      break;
    }

    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
}

// 현재 위치 마커 그리기
function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: CanvasConfig
): void {
  const radius = 8;

  // 외곽 원 (그림자)
  ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // blue-500 with opacity
  ctx.beginPath();
  ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
  ctx.fill();

  // 내부 원
  ctx.fillStyle = config.colors.highlight;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // 중심점
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius / 2, 0, Math.PI * 2);
  ctx.fill();
}
```

### 5.5 결과 공개 타이밍

#### 공개 모드 옵션
1. **즉시 공개**: 애니메이션 없이 결과 즉시 표시
2. **순차 공개**: 한 명씩 차례대로 애니메이션 실행
3. **일괄 공개**: 모든 참가자 동시에 애니메이션 (비동기 처리)
4. **수동 공개**: 각 참가자 클릭 시 개별 애니메이션

#### 구현
```typescript
type RevealMode = 'instant' | 'sequential' | 'simultaneous' | 'manual';

interface RevealState {
  mode: RevealMode;
  revealed: boolean[];  // 각 참가자 공개 여부
  current: number;      // 현재 공개 중인 참가자 인덱스
}

function useRevealController(
  participantCount: number,
  mode: RevealMode,
  onRevealComplete: (results: number[]) => void
) {
  const [state, setState] = useState<RevealState>({
    mode,
    revealed: new Array(participantCount).fill(false),
    current: -1
  });

  const revealNext = useCallback(() => {
    if (state.current >= participantCount - 1) {
      onRevealComplete(/* 전체 결과 */);
      return;
    }

    setState(prev => ({
      ...prev,
      current: prev.current + 1,
      revealed: prev.revealed.map((r, i) =>
        i === prev.current + 1 ? true : r
      )
    }));
  }, [state.current, participantCount, onRevealComplete]);

  const revealAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      revealed: new Array(participantCount).fill(true),
      current: participantCount - 1
    }));
    onRevealComplete(/* 전체 결과 */);
  }, [participantCount, onRevealComplete]);

  return { state, revealNext, revealAll };
}
```

### 5.6 모바일 터치 최적화

#### 터치 이벤트 처리
```typescript
function useTouchOptimization(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onTap: (x: number, y: number) => void
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // 스크롤 방지
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();

      // 탭 감지 (이동 거리 < 10px, 시간 < 300ms)
      const distance = Math.sqrt(
        Math.pow(touchEndX - touchStartX, 2) +
        Math.pow(touchEndY - touchStartY, 2)
      );
      const duration = touchEndTime - touchStartTime;

      if (distance < 10 && duration < 300) {
        const rect = canvas.getBoundingClientRect();
        const x = touchEndX - rect.left;
        const y = touchEndY - rect.top;
        onTap(x, y);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasRef, onTap]);
}
```

#### 모바일 UI 조정
- 최소 터치 영역: 44x44px (iOS HIG 권장)
- 입력 필드 폰트 크기: 16px 이상 (자동 줌 방지)
- 버튼 간격: 최소 8px
- 캔버스 하단 여백: Safe Area 고려

## 6. 데이터 모델

```typescript
// ========== Core Data Types ==========

interface Participant {
  id: string;           // UUID
  name: string;         // 참가자 이름
  order: number;        // 표시 순서 (0-based)
}

interface Result {
  id: string;           // UUID
  label: string;        // 결과 라벨 ("당첨", "꽝" 등)
  order: number;        // 표시 순서 (0-based)
}

interface Bridge {
  id: string;           // UUID
  fromColumn: number;   // 시작 열 인덱스
  toColumn: number;     // 종료 열 인덱스 (fromColumn + 1)
  row: number;          // 세로 위치 (0.0 ~ 1.0)
}

interface LadderConfig {
  density: number;      // 가로선 밀도 (0.3 ~ 0.8)
  theme: 'light' | 'dark' | 'colorful';
  revealMode: RevealMode;
}

// ========== Application State ==========

interface LadderState {
  participants: Participant[];
  results: Result[];
  ladder: LadderData | null;  // null = 아직 생성 안됨
  config: LadderConfig;

  // Animation State
  isAnimating: boolean;
  currentAnimatingIndex: number;  // -1 = 애니메이션 없음

  // Reveal State
  revealed: Map<string, string>;  // participantId -> resultId
}

// ========== Local Storage Schema ==========

interface SavedLadder {
  version: '1.0';
  timestamp: number;
  state: LadderState;
}

// LocalStorage Key: 'seolcoding:ladder-game:latest'
```

## 7. 핵심 알고리즘

### 7.1 사다리 가로선 랜덤 생성

```typescript
/**
 * 개선된 사다리 생성 알고리즘 (균등 분포 보장)
 *
 * - 각 세로선이 최소 1개 이상의 가로선을 가짐
 * - 가로선 간 최소 간격 유지
 * - 동일 행에 인접한 가로선 금지
 * - 균등한 수직 분포 (clustering 방지)
 */
function generateBalancedLadder(
  columnCount: number,
  options: {
    density?: number;        // 0.3 ~ 0.8 (기본 0.5)
    minGap?: number;         // 최소 행 간격 (기본 2)
    ensureAllConnected?: boolean;  // 모든 세로선 연결 보장 (기본 true)
  } = {}
): LadderData {
  const {
    density = 0.5,
    minGap = 2,
    ensureAllConnected = true
  } = options;

  const rows = Math.max(10, columnCount * 3); // 충분한 세로 공간
  const targetBridgeCount = Math.floor(
    (columnCount - 1) * rows * density
  );

  const bridges: Bridge[] = [];
  const bridgesByColumn: Map<number, number[]> = new Map();

  // 초기화: 각 열별 가로선 행 위치 추적
  for (let col = 0; col < columnCount - 1; col++) {
    bridgesByColumn.set(col, []);
  }

  // === STEP 1: 최소 연결 보장 ===
  if (ensureAllConnected) {
    for (let col = 0; col < columnCount - 1; col++) {
      // 각 열에 균등하게 분포된 위치에 가로선 배치
      const row = Math.floor((col + 0.5) * rows / columnCount);
      bridges.push({
        id: crypto.randomUUID(),
        fromColumn: col,
        toColumn: col + 1,
        row: row / rows
      });
      bridgesByColumn.get(col)!.push(row);
    }
  }

  // === STEP 2: 남은 가로선 배치 ===
  const remainingCount = targetBridgeCount - bridges.length;
  let attempts = 0;
  const maxAttempts = remainingCount * 50;

  while (bridges.length < targetBridgeCount && attempts < maxAttempts) {
    attempts++;

    // 랜덤 열 선택 (가로선이 적은 열 우선)
    const col = selectColumnWithBias(bridgesByColumn, columnCount);
    const row = Math.floor(Math.random() * rows);

    // === 충돌 검사 ===
    if (hasConflict(col, row, bridgesByColumn, minGap, rows)) {
      continue;
    }

    // 가로선 추가
    bridges.push({
      id: crypto.randomUUID(),
      fromColumn: col,
      toColumn: col + 1,
      row: row / rows
    });
    bridgesByColumn.get(col)!.push(row);
  }

  // 정렬 (위에서 아래로)
  bridges.sort((a, b) => a.row - b.row);

  return {
    columnCount,
    bridges,
    rowHeight: 50,
    minBridgeGap: minGap
  };
}

// 가로선이 적은 열에 우선 배치 (Weighted Random Selection)
function selectColumnWithBias(
  bridgesByColumn: Map<number, number[]>,
  columnCount: number
): number {
  const counts = Array.from(bridgesByColumn.values()).map(arr => arr.length);
  const maxCount = Math.max(...counts);
  const weights = counts.map(count => maxCount - count + 1);

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }

  return columnCount - 2; // fallback
}

// 충돌 검사 (인접 열, 최소 간격)
function hasConflict(
  col: number,
  row: number,
  bridgesByColumn: Map<number, number[]>,
  minGap: number,
  totalRows: number
): boolean {
  // 1. 동일 열 검사
  const sameColBridges = bridgesByColumn.get(col) || [];
  for (const existingRow of sameColBridges) {
    if (Math.abs(existingRow - row) < minGap) {
      return true;
    }
  }

  // 2. 인접 열 검사 (col-1, col+1)
  for (const adjacentCol of [col - 1, col + 1]) {
    if (adjacentCol < 0 || adjacentCol >= bridgesByColumn.size) {
      continue;
    }

    const adjacentBridges = bridgesByColumn.get(adjacentCol) || [];
    for (const existingRow of adjacentBridges) {
      if (Math.abs(existingRow - row) < minGap) {
        return true;
      }
    }
  }

  return false;
}
```

### 7.2 경로 추적 알고리즘 (최적화 버전)

```typescript
/**
 * 경로 추적 알고리즘 (O(n) 시간 복잡도)
 *
 * @param startColumn - 시작 열 인덱스 (0-based)
 * @param ladder - 사다리 데이터
 * @returns 결과 열 인덱스 및 경로 포인트
 */
interface TraceResult {
  endColumn: number;        // 도착 열 인덱스
  path: PathPoint[];        // 애니메이션용 경로 포인트
  bridgesCrossed: Bridge[]; // 통과한 가로선 목록
}

function tracePathOptimized(
  startColumn: number,
  ladder: LadderData
): TraceResult {
  const { bridges, columnCount } = ladder;
  const path: PathPoint[] = [];
  const bridgesCrossed: Bridge[] = [];

  let currentColumn = startColumn;
  let currentRow = 0; // 0.0 ~ 1.0

  // 시작점
  path.push({ x: 0, y: 0, direction: 'down' });

  // 가로선은 이미 row 순으로 정렬되어 있음
  for (const bridge of bridges) {
    // 현재 열과 관련 있는 가로선만 처리
    if (bridge.fromColumn === currentColumn) {
      // 가로선 시작점 도달
      path.push({ x: 0, y: bridge.row, direction: 'down' });

      // 오른쪽으로 이동
      currentColumn = bridge.toColumn;
      path.push({ x: 1, y: bridge.row, direction: 'right' });

      bridgesCrossed.push(bridge);
      currentRow = bridge.row;
    } else if (bridge.toColumn === currentColumn) {
      // 가로선 종료점 도달
      path.push({ x: 0, y: bridge.row, direction: 'down' });

      // 왼쪽으로 이동
      currentColumn = bridge.fromColumn;
      path.push({ x: -1, y: bridge.row, direction: 'left' });

      bridgesCrossed.push(bridge);
      currentRow = bridge.row;
    }
    // 관련 없는 가로선은 무시
  }

  // 종료점
  path.push({ x: 0, y: 1.0, direction: 'down' });

  return {
    endColumn: currentColumn,
    path,
    bridgesCrossed
  };
}

/**
 * 모든 참가자의 결과를 한 번에 계산 (O(n * m))
 * n = 참가자 수, m = 가로선 수
 */
function calculateAllResults(ladder: LadderData): number[] {
  const results: number[] = [];

  for (let col = 0; col < ladder.columnCount; col++) {
    const { endColumn } = tracePathOptimized(col, ladder);
    results.push(endColumn);
  }

  return results;
}

/**
 * 결과 검증: 1:1 매칭 확인 (bijection)
 */
function validateResults(results: number[], columnCount: number): boolean {
  const resultSet = new Set(results);

  // 1. 모든 결과가 유효한 열 인덱스인가?
  for (const result of results) {
    if (result < 0 || result >= columnCount) {
      return false;
    }
  }

  // 2. 중복 없이 1:1 매칭되는가?
  return resultSet.size === columnCount;
}
```

### 7.3 애니메이션 타이밍 제어

```typescript
/**
 * 사다리 복잡도 기반 동적 애니메이션 시간 계산
 */
function calculateAnimationDuration(
  path: PathPoint[],
  baseSpeed: number = 100 // px/s
): number {
  const totalDistance = calculateTotalDistance(path);
  const baseDuration = (totalDistance / baseSpeed) * 1000; // ms

  // 최소 1.5초, 최대 4초로 제한
  return Math.max(1500, Math.min(4000, baseDuration));
}

/**
 * 다중 애니메이션 스케줄링 (순차 공개)
 */
async function animateSequentially(
  participants: Participant[],
  ladder: LadderData,
  animateOne: (index: number) => Promise<void>,
  delayBetween: number = 500 // ms
): Promise<void> {
  for (let i = 0; i < participants.length; i++) {
    await animateOne(i);
    if (i < participants.length - 1) {
      await delay(delayBetween);
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## 8. 컴포넌트 구조

```
src/
├── components/
│   ├── LadderGame/
│   │   ├── LadderGame.tsx              # 최상위 컨테이너
│   │   ├── InputPanel.tsx              # 참가자/결과 입력 패널
│   │   ├── LadderCanvas.tsx            # Canvas 렌더링 컴포넌트
│   │   ├── ControlPanel.tsx            # 시작/리셋 버튼, 옵션
│   │   ├── ResultModal.tsx             # 결과 표시 모달
│   │   └── index.ts
│   └── ui/                             # 재사용 가능한 UI 컴포넌트
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useLadder.ts                    # 사다리 생성 로직
│   ├── usePathAnimation.ts             # 경로 애니메이션 훅
│   ├── useCanvas.ts                    # Canvas 렌더링 훅
│   └── useTouchOptimization.ts         # 터치 이벤트 처리
├── lib/
│   ├── ladder/
│   │   ├── generator.ts                # 사다리 생성 알고리즘
│   │   ├── tracer.ts                   # 경로 추적 알고리즘
│   │   ├── renderer.ts                 # Canvas 렌더링 함수
│   │   ├── animator.ts                 # 애니메이션 유틸리티
│   │   └── types.ts                    # 타입 정의
│   └── utils/
│       ├── easing.ts                   # Easing 함수
│       ├── canvas.ts                   # Canvas 유틸리티
│       └── storage.ts                  # LocalStorage 헬퍼
├── App.tsx
└── main.tsx
```

### 컴포넌트 계층 구조

```typescript
<LadderGame>
  <InputPanel>
    <ParticipantInput />
    <ResultInput />
    <AddButton />
    <RemoveButton />
  </InputPanel>

  <ControlPanel>
    <StartButton />
    <ResetButton />
    <OptionsDropdown>
      <DensitySlider />
      <ThemeSelector />
      <RevealModeSelector />
    </OptionsDropdown>
  </ControlPanel>

  <LadderCanvas
    ladder={ladder}
    participants={participants}
    results={results}
    animationState={animationState}
  />

  <ResultModal
    isOpen={showResult}
    participant={currentParticipant}
    result={matchedResult}
  />
</LadderGame>
```

### 주요 컴포넌트 Props

```typescript
// LadderGame.tsx
interface LadderGameProps {
  initialParticipants?: string[];
  initialResults?: string[];
  autoStart?: boolean;
  onComplete?: (results: Map<string, string>) => void;
}

// LadderCanvas.tsx
interface LadderCanvasProps {
  ladder: LadderData;
  participants: Participant[];
  results: Result[];
  animationState: {
    isAnimating: boolean;
    currentIndex: number;
    progress: number;
  };
  theme: 'light' | 'dark' | 'colorful';
  onAnimationComplete?: (resultIndex: number) => void;
}

// InputPanel.tsx
interface InputPanelProps {
  participants: string[];
  results: string[];
  onParticipantsChange: (participants: string[]) => void;
  onResultsChange: (results: string[]) => void;
  maxCount?: number;  // 기본 8
  minCount?: number;  // 기본 2
}

// ControlPanel.tsx
interface ControlPanelProps {
  disabled: boolean;
  config: LadderConfig;
  onStart: () => void;
  onReset: () => void;
  onConfigChange: (config: Partial<LadderConfig>) => void;
}
```

## 9. 추가 기능 (향후 확장)

### 9.1 URL 공유
- 참가자/결과 데이터를 Base64로 인코딩하여 URL 쿼리스트링에 포함
- 짧은 URL 생성 (선택적)

### 9.2 결과 저장 및 히스토리
- LocalStorage에 최근 10개 게임 저장
- 히스토리 페이지에서 과거 결과 조회

### 9.3 사운드 효과
- 경로 이동 시 클릭음
- 결과 도달 시 효과음
- 음소거 옵션

### 9.4 다양한 테마
- 다크 모드
- 컬러풀 테마 (각 경로별 다른 색상)
- 축제 테마 (파티클 효과)

### 9.5 통계
- 각 결과가 나올 확률 표시 (이론적으로는 균등)
- 실제 결과 분포 히스토그램

---

## 참고 자료

### 유사 서비스
- [사다리타기 게임 (apps.ojj.kr)](https://apps.ojj.kr/)
- [사다리타기 게임 | 온라인 꽝 찾기](https://url.kr/p/ghost-leg/)
- [Ghost leg - Wikipedia](https://en.wikipedia.org/wiki/Ghost_leg)

### 라이브러리 및 도구
- [Framer Motion - React Animation](https://www.framer.com/motion/)
- [GSAP - GreenSock Animation Platform](https://gsap.com/)
- [Motion One - Web Animations API](https://motion.dev/)
- [Vivus.js - SVG Animation](https://maxwellito.github.io/vivus/)
- [svg-path-commander - TypeScript SVG Tools](https://github.com/thednp/svg-path-commander)
- [Canvas API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 기술 문서
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript 5.7 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html)

## 14. MCP 개발 도구

### 14.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 14.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**문서 버전**: 1.0
**작성일**: 2025-12-20
**작성자**: Claude (Anthropic)
**검토 상태**: Draft
