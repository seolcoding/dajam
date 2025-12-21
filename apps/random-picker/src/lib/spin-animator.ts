import type { WheelItem } from "@/types";
import { getSecureRandomIndex } from "./utils";

/**
 * Easing 함수
 */
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * 스핀 애니메이터 클래스
 */
export class SpinAnimator {
  private startTime: number = 0;
  private startRotation: number = 0;
  private targetRotation: number = 0;
  private duration: number = 0;
  private animationId: number | null = null;

  spin(
    currentRotation: number,
    items: WheelItem[],
    onUpdate: (rotation: number, currentIndex: number) => void,
    onComplete: (selectedItem: WheelItem) => void
  ) {
    // 1. Generate cryptographically secure random target
    const targetIndex = getSecureRandomIndex(items.length);

    // 2. Calculate target rotation
    const anglePerItem = 360 / items.length;
    const targetAngle = targetIndex * anglePerItem;

    // Add random offset within the item's sector (for fairness)
    const randomOffset = (Math.random() - 0.5) * anglePerItem * 0.8;

    // 3. Generate random spin parameters
    const totalRotations = 5 + Math.floor(Math.random() * 6); // 5-10 rotations
    const duration = 4000 + Math.random() * 2000; // 4-6 seconds

    // 4. Calculate final rotation
    const targetRotation = totalRotations * 360 + targetAngle + randomOffset;

    this.startTime = performance.now();
    this.startRotation = currentRotation;
    this.targetRotation = currentRotation + targetRotation;
    this.duration = duration;

    // 5. Animation loop
    const animate = (currentTime: number) => {
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // Apply easing
      const easedProgress = easeOutCubic(progress);

      // Calculate current rotation
      const rotation =
        this.startRotation +
        (this.targetRotation - this.startRotation) * easedProgress;

      // Calculate current index
      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalizedRotation) % 360;
      const currentIndex = Math.floor(pointerAngle / anglePerItem);

      onUpdate(rotation, currentIndex % items.length);

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
