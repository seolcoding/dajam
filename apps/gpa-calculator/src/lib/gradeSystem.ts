import type { Grade, GPAScale } from '../types';

/**
 * 성적 등급별 점수 매핑
 */
const GRADE_POINTS: Record<GPAScale, Record<Grade, number>> = {
  '4.5': {
    'A+': 4.5, 'A0': 4.0,
    'B+': 3.5, 'B0': 3.0,
    'C+': 2.5, 'C0': 2.0,
    'D+': 1.5, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  },
  '4.3': {
    'A+': 4.3, 'A0': 4.0,
    'B+': 3.3, 'B0': 3.0,
    'C+': 2.3, 'C0': 2.0,
    'D+': 1.3, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  },
  '4.0': {
    'A+': 4.0, 'A0': 4.0,
    'B+': 3.5, 'B0': 3.0,
    'C+': 2.5, 'C0': 2.0,
    'D+': 1.5, 'D0': 1.0,
    'F': 0.0, 'P': 0.0, 'NP': 0.0
  }
};

/**
 * 성적 등급을 점수로 변환
 */
export function getGradePoint(grade: Grade, scale: GPAScale): number {
  return GRADE_POINTS[scale][grade];
}

/**
 * 백분율을 성적으로 변환
 */
export function percentToGrade(percent: number): Grade {
  if (percent >= 95) return 'A+';
  if (percent >= 90) return 'A0';
  if (percent >= 85) return 'B+';
  if (percent >= 80) return 'B0';
  if (percent >= 75) return 'C+';
  if (percent >= 70) return 'C0';
  if (percent >= 65) return 'D+';
  if (percent >= 60) return 'D0';
  return 'F';
}

/**
 * 성적을 백분율로 변환 (중간값)
 */
export function gradeToPercent(grade: Grade): number {
  const percentRanges: Record<Grade, number> = {
    'A+': 97.5, 'A0': 92,
    'B+': 87, 'B0': 82,
    'C+': 77, 'C0': 72,
    'D+': 67, 'D0': 62,
    'F': 30, 'P': 0, 'NP': 0
  };
  return percentRanges[grade];
}

/**
 * 가능한 모든 성적 등급 목록
 */
export const ALL_GRADES: Grade[] = [
  'A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'
];

/**
 * 학점 인정 여부 확인
 */
export function isGradeEarned(grade: Grade): boolean {
  return grade !== 'F' && grade !== 'NP';
}

/**
 * Pass/Fail 등급 여부 확인
 */
export function isPassFailGrade(grade: Grade): boolean {
  return grade === 'P' || grade === 'NP';
}
