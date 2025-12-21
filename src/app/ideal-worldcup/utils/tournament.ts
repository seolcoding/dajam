/**
 * 토너먼트 알고리즘 유틸리티
 */

import type { Candidate, Match } from '../types'

/**
 * Fisher-Yates 셔플 알고리즘
 * @param array - 셔플할 배열
 * @returns 셔플된 새 배열
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * 토너먼트 브래킷 생성
 * @param candidates - 후보자 배열
 * @param totalRounds - 전체 라운드 수 (4, 8, 16, 32)
 * @returns 초기 매치 배열
 */
export function createBracket(
  candidates: Candidate[],
  totalRounds: number
): Match[] {
  // 1. 후보자 셔플 (Fisher-Yates)
  const shuffled = shuffleArray([...candidates])

  // 2. 필요한 후보자 수 검증
  const requiredCount = totalRounds
  if (shuffled.length < requiredCount) {
    throw new Error(`최소 ${requiredCount}명의 후보자가 필요합니다.`)
  }

  // 3. 초기 매치 생성 (첫 라운드)
  const matches: Match[] = []
  const initialCandidates = shuffled.slice(0, requiredCount)

  for (let i = 0; i < initialCandidates.length; i += 2) {
    matches.push({
      id: `match-${totalRounds}-${i / 2}`,
      round: totalRounds,
      candidateA: initialCandidates[i],
      candidateB: initialCandidates[i + 1],
    })
  }

  return matches
}

/**
 * 현재 라운드의 승자들로 다음 라운드 매치 생성
 * @param currentMatches - 현재 라운드 매치 배열
 * @returns 다음 라운드 매치 배열
 */
export function advanceToNextRound(currentMatches: Match[]): Match[] {
  // 1. 모든 매치가 완료되었는지 확인
  const allComplete = currentMatches.every((match) => match.winner)
  if (!allComplete) {
    throw new Error('모든 매치가 완료되지 않았습니다.')
  }

  // 2. 승자 추출
  const winners = currentMatches.map((match) => match.winner!)

  // 3. 결승전인 경우
  if (winners.length === 1) {
    return [] // 더 이상 진행할 라운드 없음
  }

  // 4. 다음 라운드 매치 생성
  const nextRound = currentMatches[0].round / 2
  const nextMatches: Match[] = []

  for (let i = 0; i < winners.length; i += 2) {
    nextMatches.push({
      id: `match-${nextRound}-${i / 2}`,
      round: nextRound,
      candidateA: winners[i],
      candidateB: winners[i + 1],
    })
  }

  return nextMatches
}

/**
 * 라운드 숫자를 한글로 변환
 * @param round - 라운드 숫자 (1, 2, 4, 8, 16, 32)
 * @returns 한글 라운드 이름
 */
export function getRoundName(round: number): string {
  switch (round) {
    case 1:
      return '결승'
    case 2:
      return '준결승'
    case 4:
      return '8강'
    case 8:
      return '16강'
    case 16:
      return '32강'
    case 32:
      return '64강'
    default:
      return `${round}강`
  }
}

/**
 * UUID 생성
 */
export function generateId(): string {
  return crypto.randomUUID()
}
