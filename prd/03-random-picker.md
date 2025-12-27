# 랜덤 뽑기 룰렛 (Random Picker Wheel)

> ✅ **통합 앱**: 다음 앱들이 이 앱으로 통합됩니다.
> - `lunch-roulette` → 점심 모드 (맛집 + 위치 기반 + 링크 추천)
> - `ladder-game` → 사다리 모드 (1:1 매칭 시각화)
> - 통합 계획: `docs/APP_CONSOLIDATION_PLAN.md` 참조

## 1. 개요

### 1.1 목적
회식, MT, 수업, 이벤트 등에서 사용하는 공정하고 재미있는 뽑기 도구를 제공합니다. 화려한 애니메이션과 효과음으로 사용자에게 몰입감 있는 경험을 제공하며, 결과를 이미지로 저장하여 공유할 수 있습니다.

### 1.2 핵심 가치
- **공정성**: crypto.getRandomValues()를 사용한 암호학적으로 안전한 랜덤 선택
- **재미**: 물리 기반 회전 애니메이션과 효과음으로 몰입감 제공
- **실용성**: 결과 히스토리 저장 및 이미지 다운로드 기능

### 1.3 주요 사용 사례
- 교육: 학생 발표 순서 정하기, 조 편성, 질문 대상자 선정
- 업무: 회의 발표 순서, 팀 빌딩, 경품 추첨
- 이벤트: SNS 경품 이벤트, 파티 게임, 추첨
- 개인: 메뉴 선택, 의사결정 보조

## 2. 유사 서비스 분석

### 2.1 Wheel of Names (wheelofnames.com)
**강점:**
- 간단한 UI/UX (텍스트 입력 → 스핀)
- 암호학적 랜덤성 (crypto.getRandomValues) 보장
- 10,000회 스핀 테스트 도구 제공
- Discord 봇 연동
- OBS/Streamlabs 브라우저 소스 지원
- 클라우드 저장 및 공유 링크

**약점:**
- 결과 이미지 다운로드 기능 없음
- 모바일 UX 개선 필요

### 2.2 Picker Wheel (pickerwheel.com)
**강점:**
- 3가지 모드 (Normal, Elimination, Accumulation)
- 가중치(Weight) 설정 기능
- 이미지 입력 지원
- 결과 히스토리 및 점수 집계
- 공유 링크 생성
- Instagram 댓글 연동

**약점:**
- 복잡한 설정 (초보자에게 어려움)
- 광고 많음
- 프리미엄 플랜 필요한 기능 많음

### 2.3 차별화 전략
1. **간결한 UX**: Wheel of Names의 단순함 + Picker Wheel의 핵심 기능만 선택
2. **한국 시장 특화**: 한국어 UI, 카카오톡 공유, 한국 효과음
3. **결과 공유 강화**: 결과 이미지 자동 생성 및 다운로드
4. **무료 완전 기능**: 광고 없이 모든 기능 무료 제공

## 3. 오픈소스 라이브러리

### 3.1 Canvas 휠 렌더링
**선택: 직접 구현 (Canvas 2D Context API)**
- 이유: 의존성 최소화, 커스터마이징 자유도, 번들 사이즈 최소화
- 대안 1: [spin-wheel](https://github.com/CrazyTim/spin-wheel) (MIT) - 325⭐, Vanilla JS
  - 장점: 검증된 물리 엔진, 테마 지원
  - 단점: TypeScript 네이티브 아님
- 대안 2: [Konva.js](https://konvajs.org/) - 11k⭐
  - 장점: 강력한 Canvas 라이브러리
  - 단점: 오버킬, 번들 사이즈 큼

### 3.2 사운드 효과
**선택: [Howler.js](https://howlerjs.com/) (MIT) - 24k⭐**
- 장점: 크로스 브라우저 오디오, 가볍고 안정적
- 대안: Web Audio API 직접 사용 (너무 low-level)

### 3.3 이미지 생성
**선택: [html-to-image](https://github.com/bubkoo/html-to-image) (MIT) - 5.4k⭐**
- 장점: DOM → PNG/JPEG 변환, 간단한 API
- 대안: [html2canvas](https://html2canvas.hertzen.com/) - 30k⭐ (더 무겁지만 안정적)

### 3.4 Confetti 효과
**선택: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC) - 2.5k⭐**
- 장점: 가벼움, 커스터마이징 가능
- 대안: 직접 구현 (시간 소요)

## 4. 기술 스택

### 4.1 프론트엔드
- **빌드 도구**: Vite 6.x (빠른 개발 서버, 최적화된 빌드)
- **프레임워크**: React 19 (최신 기능 활용)
- **언어**: TypeScript 5.x (타입 안정성)
- **스타일링**: Tailwind CSS v4 (유틸리티 우선, 빠른 개발)

### 4.2 Canvas & 애니메이션
- **Canvas API**: 2D Context (브라우저 네이티브)
- **애니메이션**: requestAnimationFrame (60fps)
- **Easing**: cubic-bezier 함수 (ease-out-cubic)

### 4.3 오디오 & 효과
- **사운드**: Howler.js
- **Confetti**: canvas-confetti
- **이미지 저장**: html-to-image

### 4.4 상태 관리
- **로컬 상태**: React Hooks (useState, useReducer)
- **영구 저장**: localStorage (항목, 설정, 히스토리)

## 5. 핵심 기능 및 구현

### 5.1 이름 입력/관리
**기능:**
- 텍스트 입력 (Enter 키 또는 + 버튼)
- 일괄 입력 (줄바꿈으로 구분된 텍스트 붙여넣기)
- 항목 편집, 삭제, 순서 변경 (Drag & Drop)
- 최대 100개 항목 제한

**구현:**
```typescript
interface WheelItem {
  id: string;
  label: string;
  color: string;
  weight: number; // 기본 1, 가중치 기능용 (추후 확장)
}

interface WheelState {
  items: WheelItem[];
  currentIndex: number | null;
  isSpinning: boolean;
  history: SpinResult[];
}

interface SpinResult {
  id: string;
  selectedItem: WheelItem;
  timestamp: number;
  rotation: number;
}
```

**UI/UX:**
- 왼쪽 사이드바: 항목 리스트 (모바일은 하단)
- 항목별 색상 자동 할당 (HSL 색상환 균등 분할)
- 빈 입력 방지, 중복 항목 경고

### 5.2 룰렛 휠 렌더링 (Canvas)
**기능:**
- 반응형 Canvas (컨테이너에 맞춰 자동 조정)
- 각 항목별 부채꼴(Sector) 렌더링
- 레이블 텍스트 자동 크기 조정 및 회전
- 중앙 스핀 버튼 및 포인터 화살표

**구현:**
```typescript
class WheelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private centerX: number;
  private centerY: number;
  private radius: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const container = this.canvas.parentElement!;
    const size = Math.min(container.clientWidth, container.clientHeight);
    this.canvas.width = size * window.devicePixelRatio;
    this.canvas.height = size * window.devicePixelRatio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.centerX = size / 2;
    this.centerY = size / 2;
    this.radius = size * 0.45; // 90% of container
  }

  drawWheel(items: WheelItem[], rotation: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const anglePerItem = (Math.PI * 2) / items.length;

    items.forEach((item, index) => {
      const startAngle = rotation + index * anglePerItem;
      const endAngle = startAngle + anglePerItem;

      // Draw sector
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = item.color;
      this.ctx.fill();

      // Draw border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw label
      this.drawLabel(item.label, startAngle, endAngle);
    });

    this.drawPointer();
    this.drawCenterButton();
  }

  private drawLabel(text: string, startAngle: number, endAngle: number) {
    const middleAngle = (startAngle + endAngle) / 2;
    const textRadius = this.radius * 0.75;

    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(middleAngle);
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillText(text, textRadius - 10, 0);
    this.ctx.restore();
  }

  private drawPointer() {
    // Top center triangle pointer
    const pointerSize = 30;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX - pointerSize / 2, pointerSize);
    this.ctx.lineTo(this.centerX + pointerSize / 2, pointerSize);
    this.ctx.closePath();
    this.ctx.fillStyle = '#ff4444';
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawCenterButton() {
    const buttonRadius = 50;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, buttonRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#333333';
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // "SPIN" text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('SPIN', this.centerX, this.centerY);
  }
}
```

### 5.3 회전 애니메이션 (Easing)
**물리 기반 회전:**
- 초기 속도: 1500~2500 deg/s (랜덤)
- 감속: cubic-bezier(0.33, 1, 0.68, 1) - ease-out-cubic
- 지속 시간: 4~6초 (랜덤)
- 최종 회전: 5~10 바퀴 (1800~3600도) + 목표 각도

**구현:**
```typescript
interface SpinConfig {
  targetIndex: number; // 선택될 항목 인덱스
  duration: number; // 4000~6000ms
  totalRotations: number; // 5~10 회전
  direction: 1 | -1; // 1: 시계방향, -1: 반시계방향
}

class SpinAnimator {
  private startTime: number = 0;
  private startRotation: number = 0;
  private targetRotation: number = 0;
  private config: SpinConfig | null = null;
  private animationId: number | null = null;

  // Cubic ease-out function
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  spin(
    currentRotation: number,
    items: WheelItem[],
    onUpdate: (rotation: number) => void,
    onComplete: (selectedItem: WheelItem) => void
  ) {
    // 1. Generate cryptographically secure random target
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const targetIndex = randomBytes[0] % items.length;

    // 2. Calculate target rotation
    const anglePerItem = 360 / items.length;
    const targetAngle = targetIndex * anglePerItem;

    // Add random offset within the item's sector (for fairness)
    const randomOffset = (Math.random() - 0.5) * anglePerItem * 0.8;

    // 3. Generate random spin parameters
    const totalRotations = 5 + Math.floor(Math.random() * 6); // 5-10 rotations
    const duration = 4000 + Math.random() * 2000; // 4-6 seconds

    // 4. Calculate final rotation
    // Normalize current rotation to 0-360
    const normalizedCurrent = ((currentRotation % 360) + 360) % 360;

    // Target rotation = full rotations + target angle
    const targetRotation = totalRotations * 360 + targetAngle + randomOffset;

    this.config = {
      targetIndex,
      duration,
      totalRotations,
      direction: 1
    };

    this.startTime = performance.now();
    this.startRotation = currentRotation;
    this.targetRotation = currentRotation + targetRotation;

    // 5. Animation loop
    const animate = (currentTime: number) => {
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Apply easing
      const easedProgress = this.easeOutCubic(progress);

      // Calculate current rotation
      const currentRotation = this.startRotation +
        (this.targetRotation - this.startRotation) * easedProgress;

      onUpdate(currentRotation);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
        onComplete(items[targetIndex]);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
```

**공정성 보장:**
- `crypto.getRandomValues()` 사용 (Math.random() 대신)
- 목표 항목 내에서도 랜덤 오프셋 적용
- 회전 수와 지속 시간 랜덤화로 예측 불가능

### 5.4 효과음
**사운드 타입:**
1. `tick.mp3`: 포인터가 항목을 지나갈 때 (틱틱틱)
2. `spin.mp3`: 회전 시작 (휘익)
3. `win.mp3`: 결과 선정 완료 (딩동댕)

**구현:**
```typescript
import { Howl } from 'howler';

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    this.sounds.set('tick', new Howl({
      src: ['/sounds/tick.mp3'],
      volume: 0.3,
      preload: true
    }));

    this.sounds.set('spin', new Howl({
      src: ['/sounds/spin.mp3'],
      volume: 0.5,
      preload: true
    }));

    this.sounds.set('win', new Howl({
      src: ['/sounds/win.mp3'],
      volume: 0.7,
      preload: true
    }));
  }

  play(soundName: string) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  setVolume(soundName: string, volume: number) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume(volume);
    }
  }
}

// Usage in WheelComponent
const soundManager = new SoundManager();

// On spin start
soundManager.play('spin');

// On tick (currentIndex change)
const checkTick = (newRotation: number, items: WheelItem[]) => {
  const anglePerItem = 360 / items.length;
  const newIndex = Math.floor(((newRotation % 360) + 360) % 360 / anglePerItem);

  if (newIndex !== currentIndex) {
    soundManager.play('tick');
    setCurrentIndex(newIndex);
  }
};

// On spin complete
soundManager.play('win');
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

### 5.5 결과 히스토리
**기능:**
- 스핀 결과 로컬 저장 (최대 100개)
- 날짜/시간, 선택된 항목, 회전 각도 기록
- 히스토리 목록 보기 (최신순)
- 개별 삭제 및 전체 삭제
- CSV 내보내기

**구현:**
```typescript
interface SpinResult {
  id: string;
  selectedItem: WheelItem;
  timestamp: number;
  rotation: number;
  itemsSnapshot: WheelItem[]; // 당시 휠 상태 저장
}

class HistoryManager {
  private static STORAGE_KEY = 'wheel-history';
  private static MAX_HISTORY = 100;

  static save(result: SpinResult) {
    const history = this.load();
    history.unshift(result);

    // Keep only last 100 results
    const trimmed = history.slice(0, this.MAX_HISTORY);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  static load(): SpinResult[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static delete(id: string) {
    const history = this.load();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportToCSV(): string {
    const history = this.load();
    const headers = ['날짜', '시간', '선택된 항목', '회전 각도'];
    const rows = history.map(item => {
      const date = new Date(item.timestamp);
      return [
        date.toLocaleDateString('ko-KR'),
        date.toLocaleTimeString('ko-KR'),
        item.selectedItem.label,
        `${item.rotation.toFixed(2)}°`
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  }
}
```

### 5.6 결과 이미지 생성
**기능:**
- 결과 화면을 PNG 이미지로 변환
- 다운로드 버튼 클릭 시 자동 저장
- 이미지에 포함할 정보: 휠 스크린샷, 선택된 항목, 날짜/시간

**구현:**
```typescript
import { toPng } from 'html-to-image';

class ImageExporter {
  static async captureWheel(
    wheelElement: HTMLElement,
    selectedItem: WheelItem,
    timestamp: number
  ): Promise<void> {
    try {
      // Create result overlay
      const resultOverlay = this.createResultOverlay(selectedItem, timestamp);
      wheelElement.appendChild(resultOverlay);

      // Capture image
      const dataUrl = await toPng(wheelElement, {
        quality: 0.95,
        pixelRatio: 2
      });

      // Remove overlay
      wheelElement.removeChild(resultOverlay);

      // Download image
      const link = document.createElement('a');
      link.download = `random-picker-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to capture image:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  }

  private static createResultOverlay(
    selectedItem: WheelItem,
    timestamp: number
  ): HTMLElement {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      text-align: center;
    `;

    const date = new Date(timestamp);
    overlay.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
        당첨: ${selectedItem.label}
      </div>
      <div style="font-size: 14px; opacity: 0.8;">
        ${date.toLocaleString('ko-KR')}
      </div>
    `;

    return overlay;
  }
}
```

## 6. 데이터 모델

```typescript
// ===== Core Types =====
interface WheelItem {
  id: string;              // UUID
  label: string;           // 표시 텍스트
  color: string;           // HSL color (자동 생성)
  weight: number;          // 가중치 (기본 1, v2에서 사용)
}

interface SpinResult {
  id: string;              // UUID
  selectedItem: WheelItem;
  timestamp: number;       // Unix timestamp
  rotation: number;        // 최종 회전 각도 (degrees)
  itemsSnapshot: WheelItem[]; // 당시 항목 리스트
}

interface WheelSettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  animationDuration: number; // ms (4000-6000)
  colorScheme: 'default' | 'pastel' | 'neon'; // v2
}

// ===== State Management =====
interface WheelState {
  items: WheelItem[];
  currentRotation: number;
  currentIndex: number | null;
  isSpinning: boolean;
  history: SpinResult[];
  settings: WheelSettings;
}

type WheelAction =
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; label: string } }
  | { type: 'REORDER_ITEMS'; payload: WheelItem[] }
  | { type: 'START_SPIN' }
  | { type: 'UPDATE_ROTATION'; payload: number }
  | { type: 'COMPLETE_SPIN'; payload: SpinResult }
  | { type: 'LOAD_HISTORY'; payload: SpinResult[] }
  | { type: 'DELETE_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<WheelSettings> };

// ===== Reducer =====
function wheelReducer(state: WheelState, action: WheelAction): WheelState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: WheelItem = {
        id: crypto.randomUUID(),
        label: action.payload,
        color: generateColor(state.items.length),
        weight: 1
      };
      return {
        ...state,
        items: [...state.items, newItem]
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    }

    case 'START_SPIN': {
      return {
        ...state,
        isSpinning: true
      };
    }

    case 'UPDATE_ROTATION': {
      return {
        ...state,
        currentRotation: action.payload
      };
    }

    case 'COMPLETE_SPIN': {
      return {
        ...state,
        isSpinning: false,
        history: [action.payload, ...state.history]
      };
    }

    // ... 다른 케이스들

    default:
      return state;
  }
}

// ===== Helper Functions =====
function generateColor(index: number): string {
  // HSL 색상환을 균등 분할
  const hue = (index * 137.508) % 360; // Golden angle
  return `hsl(${hue}, 70%, 60%)`;
}
```

## 7. 핵심 알고리즘

### 7.1 공정한 랜덤 선택
```typescript
/**
 * 암호학적으로 안전한 랜덤 인덱스 생성
 * crypto.getRandomValues() 사용하여 예측 불가능한 선택 보장
 */
function getSecureRandomIndex(itemCount: number): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % itemCount;
}

/**
 * 가중치를 고려한 랜덤 선택 (v2)
 */
function getWeightedRandomIndex(items: WheelItem[]): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const randomValue = (randomBuffer[0] / 0xFFFFFFFF) * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += items[i].weight;
    if (randomValue <= cumulativeWeight) {
      return i;
    }
  }

  return items.length - 1; // Fallback
}
```

### 7.2 Easing 함수
```typescript
/**
 * Easing functions for smooth animations
 */
const Easing = {
  // Cubic ease-out: fast start, slow end (권장)
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  // Quart ease-out: 더 부드러운 감속
  easeOutQuart: (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  },

  // Custom ease-out-back: 약간 튕기는 효과
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Linear (테스트용)
  linear: (t: number): number => t
};
```

### 7.3 회전 물리 엔진
```typescript
/**
 * 스핀 파라미터 계산
 */
interface SpinParams {
  targetRotation: number;  // 최종 회전 각도
  duration: number;        // 애니메이션 지속 시간
  easingFn: (t: number) => number;
}

function calculateSpinParams(
  currentRotation: number,
  targetIndex: number,
  itemCount: number
): SpinParams {
  const anglePerItem = 360 / itemCount;

  // 1. 목표 각도 계산
  const targetAngle = targetIndex * anglePerItem;

  // 2. 랜덤 오프셋 (항목 내 랜덤 위치)
  const randomOffset = (Math.random() - 0.5) * anglePerItem * 0.8;

  // 3. 총 회전 수 (5-10 바퀴)
  const totalRotations = 5 + Math.floor(Math.random() * 6);

  // 4. 최종 회전 = 현재 각도 + (전체 회전 * 360) + 목표 각도 + 오프셋
  const targetRotation =
    currentRotation +
    (totalRotations * 360) +
    (360 - (currentRotation % 360)) + // 현재 위치 정규화
    targetAngle +
    randomOffset;

  // 5. 지속 시간 (4-6초)
  const duration = 4000 + Math.random() * 2000;

  return {
    targetRotation,
    duration,
    easingFn: Easing.easeOutCubic
  };
}
```

### 7.4 포인터 충돌 감지
```typescript
/**
 * 현재 포인터가 가리키는 항목 인덱스 계산
 * 포인터는 상단 중앙(0도)에 고정
 */
function getCurrentIndex(rotation: number, itemCount: number): number {
  const anglePerItem = 360 / itemCount;

  // 회전 각도를 0-360 범위로 정규화
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  // 포인터는 0도(상단)에 위치하므로, 회전을 반대로 계산
  const pointerAngle = (360 - normalizedRotation) % 360;

  // 해당 각도가 속한 항목 인덱스 계산
  const index = Math.floor(pointerAngle / anglePerItem);

  return index % itemCount;
}
```

## 8. 컴포넌트 구조

```
src/
├── App.tsx                      # 앱 루트
├── components/
│   ├── Wheel/
│   │   ├── WheelCanvas.tsx      # Canvas 렌더링
│   │   ├── WheelControls.tsx    # 스핀 버튼, 설정
│   │   └── useWheel.ts          # 휠 로직 훅
│   ├── Items/
│   │   ├── ItemList.tsx         # 항목 리스트
│   │   ├── ItemInput.tsx        # 항목 입력
│   │   └── BulkInput.tsx        # 일괄 입력
│   ├── History/
│   │   ├── HistoryPanel.tsx     # 히스토리 패널
│   │   ├── HistoryItem.tsx      # 히스토리 항목
│   │   └── HistoryExport.tsx    # CSV 내보내기
│   ├── Settings/
│   │   ├── SettingsPanel.tsx    # 설정 패널
│   │   └── SoundToggle.tsx      # 사운드 토글
│   └── Result/
│       ├── ResultModal.tsx      # 결과 모달
│       └── ShareButtons.tsx     # 공유 버튼
├── lib/
│   ├── wheel-renderer.ts        # Canvas 렌더링 클래스
│   ├── spin-animator.ts         # 애니메이션 클래스
│   ├── sound-manager.ts         # 사운드 관리
│   ├── history-manager.ts       # 히스토리 관리
│   └── image-exporter.ts        # 이미지 내보내기
├── hooks/
│   ├── useWheelState.ts         # 상태 관리 훅
│   ├── useSpinAnimation.ts      # 애니메이션 훅
│   └── useLocalStorage.ts       # localStorage 훅
├── types/
│   └── index.ts                 # TypeScript 타입 정의
└── assets/
    └── sounds/
        ├── tick.mp3
        ├── spin.mp3
        └── win.mp3
```

### 주요 컴포넌트

#### 8.1 WheelCanvas.tsx
```typescript
import React, { useRef, useEffect } from 'react';
import { WheelRenderer } from '@/lib/wheel-renderer';
import { WheelItem } from '@/types';

interface WheelCanvasProps {
  items: WheelItem[];
  rotation: number;
  onSpin: () => void;
  isSpinning: boolean;
}

export const WheelCanvas: React.FC<WheelCanvasProps> = ({
  items,
  rotation,
  onSpin,
  isSpinning
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WheelRenderer>();

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new WheelRenderer(canvasRef.current);
    }

    return () => {
      rendererRef.current = undefined;
    };
  }, []);

  // Draw wheel on rotation change
  useEffect(() => {
    if (rendererRef.current && items.length > 0) {
      rendererRef.current.drawWheel(items, rotation);
    }
  }, [items, rotation]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onClick={!isSpinning ? onSpin : undefined}
        className={`cursor-${isSpinning ? 'not-allowed' : 'pointer'}`}
      />
    </div>
  );
};
```

#### 8.2 useWheel.ts
```typescript
import { useReducer, useCallback, useRef } from 'react';
import { WheelState, WheelAction, WheelItem, SpinResult } from '@/types';
import { wheelReducer } from '@/lib/wheel-reducer';
import { SpinAnimator } from '@/lib/spin-animator';
import { SoundManager } from '@/lib/sound-manager';
import { HistoryManager } from '@/lib/history-manager';

export function useWheel() {
  const [state, dispatch] = useReducer(wheelReducer, {
    items: [],
    currentRotation: 0,
    currentIndex: null,
    isSpinning: false,
    history: HistoryManager.load(),
    settings: {
      soundEnabled: true,
      confettiEnabled: true,
      animationDuration: 5000
    }
  });

  const animatorRef = useRef(new SpinAnimator());
  const soundRef = useRef(new SoundManager());

  const spin = useCallback(() => {
    if (state.isSpinning || state.items.length < 2) return;

    dispatch({ type: 'START_SPIN' });
    soundRef.current.play('spin');

    animatorRef.current.spin(
      state.currentRotation,
      state.items,
      (rotation) => {
        dispatch({ type: 'UPDATE_ROTATION', payload: rotation });
      },
      (selectedItem) => {
        const result: SpinResult = {
          id: crypto.randomUUID(),
          selectedItem,
          timestamp: Date.now(),
          rotation: state.currentRotation,
          itemsSnapshot: state.items
        };

        dispatch({ type: 'COMPLETE_SPIN', payload: result });
        HistoryManager.save(result);
        soundRef.current.play('win');

        if (state.settings.confettiEnabled) {
          // trigger confetti
        }
      }
    );
  }, [state.items, state.currentRotation, state.isSpinning, state.settings]);

  const addItem = useCallback((label: string) => {
    dispatch({ type: 'ADD_ITEM', payload: label });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  return {
    state,
    actions: {
      spin,
      addItem,
      removeItem,
      // ... 다른 액션들
    }
  };
}
```

## 9. 개발 로드맵

### Phase 1: MVP (2주)
- [ ] 프로젝트 설정 (Vite + React 19 + TypeScript + Tailwind v4)
- [ ] 기본 UI 레이아웃 (항목 입력, 캔버스, 버튼)
- [ ] Canvas 휠 렌더링 (색상, 레이블)
- [ ] 회전 애니메이션 (easing, physics)
- [ ] 암호학적 랜덤 선택
- [ ] 결과 표시

### Phase 2: 기능 강화 (1주)
- [ ] 효과음 (Howler.js)
- [ ] Confetti 효과 (canvas-confetti)
- [ ] 히스토리 저장/표시 (localStorage)
- [ ] 결과 이미지 다운로드 (html-to-image)
- [ ] 반응형 디자인 (모바일 최적화)

### Phase 3: 폴리싱 (1주)
- [ ] 설정 UI (사운드, confetti 토글)
- [ ] 일괄 입력 기능
- [ ] 항목 편집/삭제/순서 변경
- [ ] CSV 내보내기
- [ ] 다크 모드 지원
- [ ] 접근성 개선 (키보드 네비게이션, ARIA)

### Phase 4: 배포 및 최적화 (3일)
- [ ] 번들 최적화 (코드 스플리팅, lazy loading)
- [ ] SEO 최적화 (메타 태그, OG 이미지)
- [ ] 성능 측정 및 개선 (Lighthouse)
- [ ] 크로스 브라우저 테스트
- [ ] Vercel/Netlify 배포

## 10. 성능 최적화

### 10.1 Canvas 렌더링
- `requestAnimationFrame` 사용으로 60fps 보장
- devicePixelRatio 고려하여 고해상도 지원
- 불필요한 redraw 방지 (rotation 변경 시만)

### 10.2 번들 사이즈
- Tailwind CSS: JIT 모드로 사용한 클래스만 포함
- Tree-shaking: 사용하지 않는 라이브러리 코드 제거
- Code splitting: 히스토리, 설정 패널 lazy load

### 10.3 메모리 관리
- Canvas 정리: 컴포넌트 언마운트 시 context 정리
- 이벤트 리스너 정리
- 큰 히스토리 데이터 페이지네이션

## 11. 테스트 전략

### 11.1 단위 테스트 (Vitest)
- [ ] 랜덤 선택 공정성 (1000회 테스트)
- [ ] Easing 함수 정확성
- [ ] 각도 계산 로직
- [ ] 히스토리 관리

### 11.2 통합 테스트 (React Testing Library)
- [ ] 항목 추가/삭제
- [ ] 스핀 애니메이션
- [ ] 결과 저장
- [ ] 이미지 다운로드

### 11.3 E2E 테스트 (Playwright)
- [ ] 전체 사용자 플로우
- [ ] 모바일 터치 이벤트
- [ ] 크로스 브라우저 호환성

## 12. 접근성 (a11y)

- [ ] ARIA 레이블 (버튼, 입력 필드)
- [ ] 키보드 네비게이션 (Tab, Enter, Space)
- [ ] 스크린 리더 지원
- [ ] 색상 대비 (WCAG AA)
- [ ] Focus visible 스타일
- [ ] Reduced motion 지원 (prefers-reduced-motion)

## 13. 향후 확장 기능 (v2)

- [ ] 가중치 설정 (특정 항목 당첨 확률 조정)
- [ ] 이미지 항목 지원 (프로필 사진 등)
- [ ] 테마 커스터마이징 (색상, 폰트)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 클라우드 저장 (Firebase)
- [ ] 공유 링크 생성
- [ ] Elimination 모드 (한 번 선택된 항목 제거)
- [ ] Team 모드 (여러 팀으로 나누기)

## 14. 참고 자료

### 유사 서비스
- [Wheel of Names](https://wheelofnames.com) - 공정성, 단순함
- [Picker Wheel](https://pickerwheel.com) - 다양한 모드, 기능

### 오픈소스 라이브러리
- [spin-wheel](https://github.com/CrazyTim/spin-wheel) - Vanilla JS 휠 컴포넌트
- [Howler.js](https://howlerjs.com/) - 오디오 라이브러리
- [canvas-confetti](https://github.com/catdad/canvas-confetti) - Confetti 효과
- [html-to-image](https://github.com/bubkoo/html-to-image) - DOM to Image

### 기술 문서
- [Canvas 2D Context API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [crypto.getRandomValues()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
- [Easing Functions](https://easings.net/)

## 15. MCP 개발 도구

### 15.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 15.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**작성일**: 2025-12-20
**버전**: 1.0
**작성자**: Claude (Anthropic)
