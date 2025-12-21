/**
 * Easing Functions
 *
 * 애니메이션 타이밍 함수
 */

/**
 * Cubic Bezier Easing
 */
export function cubicBezier(
  _p1x: number,
  p1y: number,
  _p2x: number,
  p2y: number
) {
  return (t: number): number => {
    const cy = 3 * p1y;
    const by = 3 * (p2y - p1y) - cy;
    const ay = 1 - cy - by;

    function sampleCurveY(t: number) {
      return ((ay * t + by) * t + cy) * t;
    }

    return sampleCurveY(t);
  };
}

/**
 * Ease-in-out (default)
 */
export const easeInOut = cubicBezier(0.4, 0.0, 0.2, 1.0);

/**
 * Ease-out
 */
export const easeOut = cubicBezier(0.0, 0.0, 0.2, 1.0);

/**
 * Ease-in
 */
export const easeIn = cubicBezier(0.4, 0.0, 1.0, 1.0);

/**
 * 사다리 복잡도 기반 동적 애니메이션 시간 계산
 */
export function calculateAnimationDuration(
  pathDistance: number,
  baseSpeed: number = 100 // px/s
): number {
  const baseDuration = (pathDistance / baseSpeed) * 1000; // ms
  return Math.max(1500, Math.min(4000, baseDuration));
}
