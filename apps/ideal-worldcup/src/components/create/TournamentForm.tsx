/**
 * 토너먼트 생성 폼
 */

import { useState } from 'react'
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@mini-apps/ui'
import { Play } from 'lucide-react'
import type { Candidate } from '../../types'
import { generateId } from '../../utils/tournament'
import ImageUploader from './ImageUploader'

interface TournamentFormProps {
  onSubmit: (tournament: {
    title: string
    totalRounds: number
    candidates: Candidate[]
  }) => void
}

const ROUND_OPTIONS = [
  { value: 4, label: '4강' },
  { value: 8, label: '8강' },
  { value: 16, label: '16강' },
  { value: 32, label: '32강' },
]

export default function TournamentForm({ onSubmit }: TournamentFormProps) {
  const [title, setTitle] = useState('')
  const [totalRounds, setTotalRounds] = useState(8)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const handleAddCandidate = (candidate: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      ...candidate,
      id: generateId(),
    }
    setCandidates([...candidates, newCandidate])
  }

  const handleRemoveCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('토너먼트 제목을 입력해주세요.')
      return
    }

    if (candidates.length < totalRounds) {
      alert(`최소 ${totalRounds}개의 후보자가 필요합니다.`)
      return
    }

    onSubmit({
      title: title.trim(),
      totalRounds,
      candidates,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>토너먼트 기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">토너먼트 제목</Label>
            <Input
              id="title"
              type="text"
              placeholder="예: 최고의 라면은?"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 라운드 선택 */}
          <div className="space-y-2">
            <Label htmlFor="rounds">라운드</Label>
            <div className="grid grid-cols-4 gap-2">
              {ROUND_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTotalRounds(option.value)}
                  className={`
                    px-4 py-2 rounded-md border-2 font-medium transition-colors
                    ${
                      totalRounds === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 후보자 업로드 */}
      <Card>
        <CardHeader>
          <CardTitle>후보자 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            candidates={candidates}
            onAddCandidate={handleAddCandidate}
            onRemoveCandidate={handleRemoveCandidate}
            maxCandidates={totalRounds}
          />
        </CardContent>
      </Card>

      {/* 시작 버튼 */}
      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={candidates.length < totalRounds}
          className="px-8"
        >
          <Play className="mr-2 h-5 w-5" />
          토너먼트 시작
        </Button>
      </div>

      {candidates.length < totalRounds && candidates.length > 0 && (
        <p className="text-sm text-red-500 text-center">
          {totalRounds - candidates.length}개의 후보자를 더 추가해주세요.
        </p>
      )}
    </form>
  )
}
