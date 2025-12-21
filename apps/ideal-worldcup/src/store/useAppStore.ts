/**
 * Zustand 앱 스토어
 */

import { create } from 'zustand'
import type { AppStore, Tournament, GameState, TournamentResult, Candidate } from '../types'
import {
  createBracket,
  advanceToNextRound,
  generateId,
} from '../utils/tournament'
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  clearAllStorage,
} from '../utils/storage'

const useAppStore = create<AppStore>((set, get) => ({
  // Initial State
  tournaments: loadFromStorage(STORAGE_KEYS.TOURNAMENTS, []),
  currentGame: loadFromStorage(STORAGE_KEYS.CURRENT_GAME, null),
  results: loadFromStorage(STORAGE_KEYS.RESULTS, []),

  // Actions
  createTournament: (tournament) => {
    const newTournament: Tournament = {
      ...tournament,
      id: generateId(),
      createdAt: new Date(),
    }

    set((state) => {
      const tournaments = [...state.tournaments, newTournament]
      saveToStorage(STORAGE_KEYS.TOURNAMENTS, tournaments)
      return { tournaments }
    })
  },

  startGame: (tournamentId) => {
    const tournament = get().tournaments.find((t) => t.id === tournamentId)
    if (!tournament) {
      throw new Error('Tournament not found')
    }

    // 초기 브래킷 생성
    const initialMatches = createBracket(
      tournament.candidates,
      tournament.totalRounds
    )

    const gameState: GameState = {
      tournament,
      currentRound: tournament.totalRounds,
      currentMatchIndex: 0,
      matches: initialMatches,
      allMatches: initialMatches,
      history: [],
      isComplete: false,
    }

    set({ currentGame: gameState })
    saveToStorage(STORAGE_KEYS.CURRENT_GAME, gameState)
  },

  selectWinner: (winner) => {
    const { currentGame } = get()
    if (!currentGame) return

    const currentMatch = currentGame.matches[currentGame.currentMatchIndex]
    if (!currentMatch) return

    // 현재 매치에 승자 설정
    currentMatch.winner = winner

    // 히스토리에 추가
    const newHistory = [...currentGame.history, winner]

    // 다음 매치로 이동
    let nextMatchIndex = currentGame.currentMatchIndex + 1
    let newMatches = [...currentGame.matches]
    let newRound = currentGame.currentRound
    let allMatches = [...currentGame.allMatches]

    // 현재 라운드의 모든 매치가 완료되었는지 확인
    if (nextMatchIndex >= currentGame.matches.length) {
      // 다음 라운드로 진행
      const nextRoundMatches = advanceToNextRound(currentGame.matches)

      if (nextRoundMatches.length === 0) {
        // 토너먼트 완료
        const finalMatch = currentGame.matches[0]
        const loser =
          finalMatch.candidateA.id === winner.id
            ? finalMatch.candidateB
            : finalMatch.candidateA

        const updatedGame: GameState = {
          ...currentGame,
          matches: newMatches,
          allMatches,
          history: newHistory,
          isComplete: true,
          winner,
          runnerUp: loser,
        }

        set({ currentGame: updatedGame })
        saveToStorage(STORAGE_KEYS.CURRENT_GAME, updatedGame)
        return
      }

      // 다음 라운드 설정
      newRound = nextRoundMatches[0].round
      newMatches = nextRoundMatches
      allMatches = [...allMatches, ...nextRoundMatches]
      nextMatchIndex = 0
    }

    const updatedGame: GameState = {
      ...currentGame,
      currentRound: newRound,
      currentMatchIndex: nextMatchIndex,
      matches: newMatches,
      allMatches,
      history: newHistory,
    }

    set({ currentGame: updatedGame })
    saveToStorage(STORAGE_KEYS.CURRENT_GAME, updatedGame)
  },

  goBack: () => {
    const { currentGame } = get()
    if (!currentGame || currentGame.history.length === 0) return

    // 히스토리에서 마지막 선택 제거
    const newHistory = currentGame.history.slice(0, -1)

    // 이전 매치로 돌아가기
    let prevMatchIndex = currentGame.currentMatchIndex - 1
    let prevRound = currentGame.currentRound
    let prevMatches = [...currentGame.matches]

    if (prevMatchIndex < 0) {
      // 이전 라운드로 돌아가기
      const prevRoundNumber = currentGame.currentRound * 2
      const prevRoundMatches = currentGame.allMatches.filter(
        (m) => m.round === prevRoundNumber
      )

      if (prevRoundMatches.length > 0) {
        prevRound = prevRoundNumber
        prevMatches = prevRoundMatches
        prevMatchIndex = prevMatches.length - 1
      } else {
        return // 더 이상 뒤로 갈 수 없음
      }
    }

    // 이전 매치의 승자 제거
    if (prevMatches[prevMatchIndex]) {
      prevMatches[prevMatchIndex].winner = undefined
    }

    const updatedGame: GameState = {
      ...currentGame,
      currentRound: prevRound,
      currentMatchIndex: prevMatchIndex,
      matches: prevMatches,
      history: newHistory,
      isComplete: false,
      winner: undefined,
      runnerUp: undefined,
    }

    set({ currentGame: updatedGame })
    saveToStorage(STORAGE_KEYS.CURRENT_GAME, updatedGame)
  },

  saveResult: (result) => {
    const newResult: TournamentResult = {
      ...result,
      id: generateId(),
      completedAt: new Date(),
    }

    set((state) => {
      const results = [...state.results, newResult]
      saveToStorage(STORAGE_KEYS.RESULTS, results)
      return { results, currentGame: null }
    })

    saveToStorage(STORAGE_KEYS.CURRENT_GAME, null)
  },

  deleteTournament: (id) => {
    set((state) => {
      const tournaments = state.tournaments.filter((t) => t.id !== id)
      saveToStorage(STORAGE_KEYS.TOURNAMENTS, tournaments)
      return { tournaments }
    })
  },

  clearAll: () => {
    clearAllStorage()
    set({
      tournaments: [],
      currentGame: null,
      results: [],
    })
  },

  resetGame: () => {
    set({ currentGame: null })
    saveToStorage(STORAGE_KEYS.CURRENT_GAME, null)
  },
}))

export default useAppStore
