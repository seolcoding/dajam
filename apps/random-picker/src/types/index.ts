/**
 * 랜덤 뽑기 룰렛 타입 정의
 */

export interface WheelItem {
  id: string;
  label: string;
  color: string;
  weight: number; // 기본 1, 가중치 기능용 (추후 확장)
}

export interface SpinResult {
  id: string;
  selectedItem: WheelItem;
  timestamp: number;
  rotation: number;
  itemsSnapshot: WheelItem[];
}

export interface WheelSettings {
  soundEnabled: boolean;
  confettiEnabled: boolean;
  animationDuration: number; // ms (4000-6000)
}

export interface WheelState {
  items: WheelItem[];
  currentRotation: number;
  currentIndex: number | null;
  isSpinning: boolean;
  history: SpinResult[];
  settings: WheelSettings;
}

export interface SpinConfig {
  targetIndex: number;
  duration: number;
  totalRotations: number;
  direction: 1 | -1;
}
