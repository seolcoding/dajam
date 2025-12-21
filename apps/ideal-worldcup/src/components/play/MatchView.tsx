/**
 * 1:1 대결 화면
 */

import { ArrowLeft } from 'lucide-react'
import { Button, Progress } from '@mini-apps/ui'
import type { Match } from '../../types'
import { getRoundName } from '../../utils/tournament'
import CandidatePanel from './CandidatePanel'

interface MatchViewProps {
  match: Match
  currentMatchIndex: number
  totalMatches: number
  currentRound: number
  onSelectWinner: (candidateId: string) => void
  onGoBack: () => void
  canGoBack: boolean
}

export default function MatchView({
  match,
  currentMatchIndex,
  totalMatches,
  currentRound,
  onSelectWinner,
  onGoBack,
  canGoBack,
}: MatchViewProps) {
  const progress = ((currentMatchIndex + 1) / totalMatches) * 100

  return (
    <div className="min-h-screen flex flex-col bg-primary-950">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-primary-900 to-accent-900 border-b-4 border-accent-500 sticky top-0 z-10 shadow-xl animate-slide-up">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* 뒤로가기 버튼 */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoBack}
              disabled={!canGoBack}
              className="text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>
            <span className="text-base font-bold text-primary-200 tracking-tight">
              {currentMatchIndex + 1} / {totalMatches}
            </span>
          </div>

          {/* 라운드 표시 */}
          <h1 className="font-display text-4xl md:text-5xl font-black text-center text-white tracking-tight">
            {getRoundName(currentRound)}
          </h1>

          {/* 진행률 바 */}
          <Progress value={progress} className="h-2 bg-primary-800" />
        </div>
      </div>

      {/* 대결 패널 */}
      <div className="flex-1 grid md:grid-cols-2 animate-fade-in">
        <CandidatePanel
          candidate={match.candidateA}
          position="left"
          onSelect={() => onSelectWinner(match.candidateA.id)}
        />
        <CandidatePanel
          candidate={match.candidateB}
          position="right"
          onSelect={() => onSelectWinner(match.candidateB.id)}
        />
      </div>

      {/* VS 구분선 (데스크톱) */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-scale-in">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-full px-16 py-8 shadow-2xl border-4 border-white">
          <span className="font-display text-6xl font-black text-white tracking-tighter">VS</span>
        </div>
      </div>
    </div>
  )
}
