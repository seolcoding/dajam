import type { Answer, DimensionScore, PersonalityCode, DimensionId } from '../types';

/**
 * Calculate MBTI personality type from answers
 */
export function calculatePersonalityType(answers: Answer[]): PersonalityCode {
  const scores: Record<DimensionId, { left: number; right: number }> = {
    EI: { left: 0, right: 0 },
    SN: { left: 0, right: 0 },
    TF: { left: 0, right: 0 },
    JP: { left: 0, right: 0 },
  };

  // Count answers for each dimension
  answers.forEach(answer => {
    if (answer.direction === 'left') {
      scores[answer.dimension].left++;
    } else {
      scores[answer.dimension].right++;
    }
  });

  // Determine dominant trait for each dimension
  const type = [
    scores.EI.left >= scores.EI.right ? 'E' : 'I',
    scores.SN.left >= scores.SN.right ? 'S' : 'N',
    scores.TF.left >= scores.TF.right ? 'T' : 'F',
    scores.JP.left >= scores.JP.right ? 'J' : 'P',
  ].join('');

  return type as PersonalityCode;
}

/**
 * Calculate detailed dimension scores
 */
export function calculateDimensionScores(answers: Answer[]): DimensionScore[] {
  const scores: Record<DimensionId, { left: number; right: number }> = {
    EI: { left: 0, right: 0 },
    SN: { left: 0, right: 0 },
    TF: { left: 0, right: 0 },
    JP: { left: 0, right: 0 },
  };

  // Count answers for each dimension
  answers.forEach(answer => {
    if (answer.direction === 'left') {
      scores[answer.dimension].left++;
    } else {
      scores[answer.dimension].right++;
    }
  });

  // Calculate percentages and determine dominant side
  return (Object.entries(scores) as [DimensionId, { left: number; right: number }][]).map(
    ([dimension, counts]) => {
      const total = counts.left + counts.right;
      const leftPercentage = (counts.left / total) * 100;
      const rightPercentage = (counts.right / total) * 100;
      const dominant = counts.left >= counts.right ? 'left' : 'right';
      const percentage = Math.max(leftPercentage, rightPercentage);

      return {
        dimension,
        left: counts.left,
        right: counts.right,
        percentage: Math.round(percentage),
        dominant: dominant as 'left' | 'right',
      };
    }
  );
}

/**
 * Get test progress percentage
 */
export function getTestProgress(answeredCount: number, totalQuestions: number): number {
  return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Check if test is complete
 */
export function isTestComplete(answeredCount: number, totalQuestions: number): boolean {
  return answeredCount === totalQuestions;
}

/**
 * Save test result to localStorage
 */
export function saveTestResult(code: PersonalityCode, scores: DimensionScore[]) {
  const result = {
    code,
    scores,
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('personality-test-result', JSON.stringify(result));
  } catch (error) {
    console.error('Failed to save test result:', error);
  }
}

/**
 * Load test result from localStorage
 */
export function loadTestResult(): { code: PersonalityCode; scores: DimensionScore[]; completedAt: string } | null {
  try {
    const stored = localStorage.getItem('personality-test-result');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load test result:', error);
  }
  return null;
}

/**
 * Clear test result from localStorage
 */
export function clearTestResult() {
  try {
    localStorage.removeItem('personality-test-result');
  } catch (error) {
    console.error('Failed to clear test result:', error);
  }
}
