'use client'

/**
 * 메인 앱 컴포넌트
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAppStore from '../store/useAppStore'
import TournamentForm from './create/TournamentForm'
import TemplateSelector from './create/TemplateSelector'
import MatchView from './play/MatchView'
import ResultView from './result/ResultView'
import { Button } from '@/components/ui/button'
import { Trophy, Plus, Sparkles, Users } from 'lucide-react'
import type { Template } from '../data/templates'
import { generateId } from '../utils/tournament'

type AppState = 'home' | 'templates' | 'create' | 'play' | 'result'

export default function IdealWorldcupApp() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('home')
  const {
    currentGame,
    createTournament,
    startGame,
    selectWinner,
    goBack,
    saveResult,
    resetGame,
  } = useAppStore()

  // 게임 상태에 따라 화면 전환
  useEffect(() => {
    if (currentGame) {
      if (currentGame.isComplete) {
        setAppState('result')
      } else {
        setAppState('play')
      }
    }
  }, [currentGame])

  const handleCreateTournament = (tournament: {
    title: string
    totalRounds: number
    candidates: any[]
  }) => {
    createTournament(tournament)
    const tournaments = useAppStore.getState().tournaments
    const newTournament = tournaments[tournaments.length - 1]
    startGame(newTournament.id)
  }

  // 템플릿으로 시작
  const handleTemplateSelect = (template: Template) => {
    const candidates = template.candidates.map(c => ({
      ...c,
      id: generateId(),
    }))

    createTournament({
      title: template.title,
      totalRounds: template.totalRounds,
      candidates,
    })

    const tournaments = useAppStore.getState().tournaments
    const newTournament = tournaments[tournaments.length - 1]
    startGame(newTournament.id)
  }

  const handleSelectWinner = (candidateId: string) => {
    if (!currentGame) return

    const currentMatch = currentGame.matches[currentGame.currentMatchIndex]
    if (!currentMatch) return

    const winner =
      currentMatch.candidateA.id === candidateId
        ? currentMatch.candidateA
        : currentMatch.candidateB

    selectWinner(winner)
  }

  const handleSaveResult = () => {
    if (!currentGame || !currentGame.winner) return

    saveResult({
      tournamentId: currentGame.tournament.id,
      tournamentTitle: currentGame.tournament.title,
      winner: currentGame.winner,
      runnerUp: currentGame.runnerUp,
      semiFinals: currentGame.semiFinals,
    })

    setAppState('home')
  }

  const handleRestart = () => {
    if (!currentGame) return
    startGame(currentGame.tournament.id)
  }

  const handleHome = () => {
    resetGame()
    setAppState('home')
  }

  // 홈 화면
  if (appState === 'home') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              이상형 월드컵
            </h1>
            <p className="text-xl text-gray-600">
              나만의 토너먼트를 만들고 최애를 선택하세요
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
            <Button
              size="lg"
              onClick={() => setAppState('templates')}
              className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              인기 템플릿으로 시작
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setAppState('create')}
              className="px-8 py-6 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              직접 만들기
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">멀티플레이어</span>
              </div>
            </div>
            <Button
              size="lg"
              variant="default"
              onClick={() => router.push('/ideal-worldcup/session/create')}
              className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700"
            >
              <Users className="mr-2 h-5 w-5" />
              친구들과 함께하기
            </Button>
          </div>

          <div className="text-gray-500 text-sm">
            <p>이미지를 업로드하고 1:1 대결을 통해</p>
            <p>최종 우승자를 선택해보세요</p>
          </div>
        </div>
      </div>
    )
  }

  // 템플릿 선택 화면
  if (appState === 'templates') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">템플릿 선택</h1>
            <Button variant="ghost" onClick={handleHome}>
              취소
            </Button>
          </div>

          <TemplateSelector
            onSelect={handleTemplateSelect}
            onSkip={() => setAppState('create')}
          />
        </div>
      </div>
    )
  }

  // 생성 화면
  if (appState === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">토너먼트 만들기</h1>
            <Button variant="ghost" onClick={handleHome}>
              취소
            </Button>
          </div>

          <TournamentForm onSubmit={handleCreateTournament} />
        </div>
      </div>
    )
  }

  // 플레이 화면
  if (appState === 'play' && currentGame) {
    const currentMatch = currentGame.matches[currentGame.currentMatchIndex]

    if (!currentMatch) {
      return null
    }

    return (
      <MatchView
        match={currentMatch}
        currentMatchIndex={currentGame.currentMatchIndex}
        totalMatches={currentGame.matches.length}
        currentRound={currentGame.currentRound}
        onSelectWinner={handleSelectWinner}
        onGoBack={goBack}
        canGoBack={currentGame.history.length > 0}
      />
    )
  }

  // 결과 화면
  if (appState === 'result' && currentGame?.winner) {
    const result = {
      id: '',
      tournamentId: currentGame.tournament.id,
      tournamentTitle: currentGame.tournament.title,
      winner: currentGame.winner,
      runnerUp: currentGame.runnerUp,
      semiFinals: currentGame.semiFinals,
      completedAt: new Date(),
    }

    return (
      <ResultView
        result={result}
        onRestart={handleRestart}
        onHome={handleSaveResult}
      />
    )
  }

  return null
}
