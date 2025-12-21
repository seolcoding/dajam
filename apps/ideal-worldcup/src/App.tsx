/**
 * 메인 앱 컴포넌트
 */

import { useState, useEffect } from 'react'
import useAppStore from './store/useAppStore'
import TournamentForm from './components/create/TournamentForm'
import MatchView from './components/play/MatchView'
import ResultView from './components/result/ResultView'
import { Button } from '@mini-apps/ui'
import { Trophy, Plus } from 'lucide-react'

type AppState = 'home' | 'create' | 'play' | 'result'

function App() {
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

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => setAppState('create')}
              className="px-12 py-6 text-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-6 w-6" />
              새 토너먼트 만들기
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

export default App
