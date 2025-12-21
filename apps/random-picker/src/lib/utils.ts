import type { WheelItem } from "@/types";

/**
 * HSL 색상환을 균등 분할하여 색상 생성 (Golden Angle 사용)
 */
export function generateColor(index: number): string {
  const hue = (index * 137.508) % 360; // Golden angle
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * 암호학적으로 안전한 랜덤 인덱스 생성
 */
export function getSecureRandomIndex(itemCount: number): number {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] % itemCount;
}

/**
 * 현재 포인터가 가리키는 항목 인덱스 계산
 */
export function getCurrentIndex(rotation: number, itemCount: number): number {
  const anglePerItem = 360 / itemCount;
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const pointerAngle = (360 - normalizedRotation) % 360;
  const index = Math.floor(pointerAngle / anglePerItem);
  return index % itemCount;
}

/**
 * 로컬 스토리지 헬퍼
 */
export const storage = {
  getItems: (): WheelItem[] => {
    const data = localStorage.getItem("wheel-items");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveItems: (items: WheelItem[]) => {
    localStorage.setItem("wheel-items", JSON.stringify(items));
  },

  getHistory: () => {
    const data = localStorage.getItem("wheel-history");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveHistory: (history: any[]) => {
    localStorage.setItem("wheel-history", JSON.stringify(history));
  },

  clearHistory: () => {
    localStorage.removeItem("wheel-history");
  },
};
