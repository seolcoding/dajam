/**
 * 결과 화면
 */

import { useState } from 'react'
import { Button, Card, CardContent } from '@mini-apps/ui'
import { Download, Share2, Copy, RotateCcw, Home } from 'lucide-react'
import type { TournamentResult } from '../../types'
import { generateResultImage, downloadBlob } from '../../utils/canvas'
import { shareImage, copyImageToClipboard, canShare } from '../../utils/share'

interface ResultViewProps {
  result: TournamentResult
  onRestart: () => void
  onHome: () => void
}

export default function ResultView({
  result,
  onRestart,
  onHome,
}: ResultViewProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    try {
      setIsGenerating(true)
      const blob = await generateResultImage(result)
      downloadBlob(blob, `${result.tournamentTitle}-result.png`)
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('이미지 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsGenerating(true)
      const blob = await generateResultImage(result)
      await shareImage(
        blob,
        `${result.tournamentTitle} 결과`,
        `우승: ${result.winner.name}`
      )
    } catch (error) {
      console.error('Failed to share:', error)
      alert('공유에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      setIsGenerating(true)
      const blob = await generateResultImage(result)
      await copyImageToClipboard(blob)
      alert('이미지가 클립보드에 복사되었습니다.')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('복사에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {result.tournamentTitle}
          </h1>
          <p className="text-xl text-gray-600">토너먼트 결과</p>
        </div>

        {/* 우승자 카드 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={result.winner.imageUrl}
                alt={result.winner.name}
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-6xl">🏆</span>
                  <div>
                    <p className="text-sm opacity-90">우승</p>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      {result.winner.name}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 준우승 */}
        {result.runnerUp && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img
                  src={result.runnerUp.imageUrl}
                  alt={result.runnerUp.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
                <div>
                  <p className="text-sm text-gray-600 mb-1">🥈 준우승</p>
                  <p className="text-xl font-bold">{result.runnerUp.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 공유 버튼 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>

          {canShare() && (
            <Button
              onClick={handleShare}
              disabled={isGenerating}
              variant="secondary"
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
          )}

          <Button
            onClick={handleCopy}
            disabled={isGenerating}
            variant="secondary"
            className="w-full"
          >
            <Copy className="mr-2 h-4 w-4" />
            복사
          </Button>

          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            다시하기
          </Button>
        </div>

        {/* 홈으로 */}
        <div className="text-center">
          <Button onClick={onHome} variant="ghost">
            <Home className="mr-2 h-4 w-4" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  )
}
