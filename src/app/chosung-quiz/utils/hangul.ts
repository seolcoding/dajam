import { getChoseong } from 'es-hangul';

/**
 * 주어진 단어에서 초성만 추출
 */
export function extractChosung(word: string): string {
  return getChoseong(word);
}

/**
 * 사용자 입력과 정답의 초성을 비교
 */
export function compareChosung(
  userInput: string,
  correctAnswer: string
): boolean {
  const userChosung = getChoseong(userInput);
  const answerChosung = getChoseong(correctAnswer);
  return userChosung === answerChosung;
}

/**
 * 사용자 입력이 정답인지 검증
 * - 완전 일치 우선
 * - 공백 제거 및 정규화
 */
export function validateAnswer(
  userInput: string,
  correctAnswer: string
): boolean {
  // 공백 제거 및 소문자 변환
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedAnswer = correctAnswer.trim().toLowerCase();

  // 완전 일치
  if (normalizedInput === normalizedAnswer) {
    return true;
  }

  return false;
}

/**
 * 점수 계산
 */
export function calculateScore(
  timeRemaining: number,
  totalTime: number,
  hintsUsed: number
): number {
  const baseScore = 100;
  const timeBonus = Math.floor((timeRemaining / totalTime) * 100);
  const hintPenalty = hintsUsed * 50;
  const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);
  return finalScore;
}
