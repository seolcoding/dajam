/**
 * Canvas 이미지 렌더링 유틸리티
 */

import type { TournamentResult } from '../types'
import { loadImage } from './image'

/**
 * 토너먼트 결과 이미지 생성
 * @param result - 토너먼트 결과
 * @returns Blob (PNG 이미지)
 */
export async function generateResultImage(
  result: TournamentResult
): Promise<Blob> {
  // 1. Canvas 생성 (SNS 최적 비율)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  canvas.width = 1200
  canvas.height = 630

  // 2. 배경 그라디언트
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3. 타이틀 렌더링
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(result.tournamentTitle, canvas.width / 2, 80)

  // 4. 우승자 이미지 로드 및 그리기
  try {
    const img = await loadImage(result.winner.imageUrl)
    const imgSize = 350
    const imgX = (canvas.width - imgSize) / 2
    const imgY = 140

    // 원형 클리핑
    ctx.save()
    ctx.beginPath()
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize)
    ctx.restore()

    // 원형 테두리
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2)
    ctx.stroke()
  } catch (error) {
    console.error('Failed to load winner image:', error)
    // 이미지 로드 실패 시 플레이스홀더
    const imgSize = 350
    const imgX = (canvas.width - imgSize) / 2
    const imgY = 140
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 5. 우승자 이름
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'center'
  const trophyText = `🏆 ${result.winner.name}`
  ctx.fillText(trophyText, canvas.width / 2, 550)

  // 6. 워터마크
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('seolcoding.com/mini-apps', canvas.width - 30, canvas.height - 20)

  // 7. Blob 생성
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to generate image'))
      }
    }, 'image/png')
  })
}

/**
 * Blob을 다운로드
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
